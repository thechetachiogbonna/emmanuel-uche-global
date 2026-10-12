import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getR2StorageConfig } from "@/lib/r2-storage";

export const runtime = "nodejs";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_GENERATED_BYTES = 30 * 1024 * 1024;
const REFERENCE_BACKGROUND_IDS = {
  "1": "products/master_reference_bg_1",
  "2": "products/master_reference_bg_2",
} as const;
const GENERATED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpeg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

function normalizeSku(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "shirt-product"
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getCloudinaryConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Cloudinary image processing is not configured on the server." },
      { status: 503 }
    );
  }
  const r2 = getR2StorageConfig();
  if (!r2) {
    return NextResponse.json(
      { error: "R2 media storage is not configured on the server." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid shirt image upload." }, { status: 400 });
  }

  const file = formData.get("file");
  const skuValue = formData.get("sku");
  const viewValue = formData.get("view");
  const backgroundValue = formData.get("background");
  const sku = normalizeSku(typeof skuValue === "string" ? skuValue : "");
  const view = viewValue === "back" ? "back" : viewValue === "front" ? "front" : null;
  const backgroundId =
    backgroundValue === "1" || backgroundValue === "2"
      ? REFERENCE_BACKGROUND_IDS[backgroundValue]
      : null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a shirt image to process." }, { status: 400 });
  }
  if (!view) {
    return NextResponse.json({ error: "Choose whether this is the front or back view." }, { status: 400 });
  }
  if (!backgroundId) {
    return NextResponse.json({ error: "Choose a valid mockup background." }, { status: 400 });
  }
  if (!IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, WebP, or AVIF shirt image." },
      { status: 400 }
    );
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Shirt images must be smaller than 20 MB." },
      { status: 400 }
    );
  }

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
  });

  let temporaryPublicId: string | null = null;
  let r2Key: string | null = null;
  let processingStep =
    "uploading the temporary source image to Cloudinary";
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
    const upload = await cloudinary.uploader.upload(dataUri, {
      folder: "products/raw",
      public_id: `${sku}_${view}_${randomUUID()}`,
      resource_type: "image",
    });
    temporaryPublicId = upload.public_id;

    processingStep = "generating the mockup with the selected reference background";
    const transformedUrl = cloudinary.url(upload.public_id, {
      secure: true,
      transformation: [
        {
          effect: `gen_background_replace:prompt_match_reference_${backgroundId}`,
        },
        {
          effect: "gen_replace:from_neck tag;to_clean professional apparel inner collar",
        },
        {
          width: 1000,
          height: 1000,
          crop: "pad",
          background: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    let transformedResponse: Response | null = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      transformedResponse = await fetch(transformedUrl, { cache: "no-store" });
      if (transformedResponse.ok) break;
      if (transformedResponse.status !== 423 || attempt === 4) {
        await transformedResponse.body?.cancel();
        throw new Error(
          `Cloudinary returned HTTP ${transformedResponse.status} for the generated mockup.`
        );
      }
      await transformedResponse.body?.cancel();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    if (!transformedResponse?.ok) {
      throw new Error("Cloudinary did not finish generating the mockup.");
    }

    const contentType = transformedResponse.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();
    const extension = contentType
      ? GENERATED_IMAGE_TYPES.get(contentType)
      : undefined;
    const contentLength = Number(transformedResponse.headers.get("content-length"));
    if (!extension || !contentType) {
      throw new Error("Cloudinary returned an unsupported mockup image format.");
    }
    if (Number.isFinite(contentLength) && contentLength > MAX_GENERATED_BYTES) {
      throw new Error("The generated mockup is too large to store.");
    }

    const generatedImage = Buffer.from(await transformedResponse.arrayBuffer());
    if (generatedImage.length === 0 || generatedImage.length > MAX_GENERATED_BYTES) {
      throw new Error("The generated mockup is empty or too large to store.");
    }

    processingStep = "uploading the generated mockup to R2";
    r2Key = `product-media/${randomUUID()}.${extension}`;
    await r2.client.send(
      new PutObjectCommand({
        Bucket: r2.bucketName,
        Key: r2Key,
        Body: generatedImage,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    processingStep = "deleting the temporary Cloudinary source image";
    const deletion = await cloudinary.uploader.destroy(temporaryPublicId, {
      invalidate: true,
      resource_type: "image",
    });
    if (deletion.result !== "ok") {
      throw new Error(
        `Cloudinary did not confirm deletion of the temporary source (result: ${deletion.result}).`
      );
    }
    temporaryPublicId = null;

    const url = `${r2.publicUrl}/${r2Key
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
    return NextResponse.json({ success: true, url, view });
  } catch (error) {
    const cleanupErrors: string[] = [];
    if (temporaryPublicId) {
      try {
        const deletion = await cloudinary.uploader.destroy(temporaryPublicId, {
          invalidate: true,
          resource_type: "image",
        });
        if (deletion.result !== "ok" && deletion.result !== "not_found") {
          cleanupErrors.push(
            `Cloudinary cleanup returned ${deletion.result} for ${temporaryPublicId}.`
          );
        }
      } catch (cleanupError) {
        cleanupErrors.push(
          `Cloudinary cleanup failed for ${temporaryPublicId}: ${
            cleanupError instanceof Error ? cleanupError.message : "unknown error"
          }`
        );
      }
    }
    if (r2Key) {
      try {
        await r2.client.send(
          new DeleteObjectCommand({ Bucket: r2.bucketName, Key: r2Key })
        );
      } catch (cleanupError) {
        cleanupErrors.push(
          `R2 cleanup failed for ${r2Key}: ${
            cleanupError instanceof Error ? cleanupError.message : "unknown error"
          }`
        );
      }
    }
    console.error(
      `Could not process and store shirt mockup while ${processingStep}:`,
      error,
      ...cleanupErrors
    );
    const cloudinaryStatus =
      error && typeof error === "object" && "http_code" in error
        ? error.http_code
        : null;
    const detail =
      processingStep === "uploading the temporary source image to Cloudinary" &&
      cloudinaryStatus === 403
        ? "Cloudinary rejected the source upload (403). Verify the Cloudinary cloud name, API key, API secret, and that the API key is active."
        : processingStep ===
            "generating the mockup with the selected reference background" &&
          error instanceof Error &&
          error.message.includes("HTTP 403")
          ? "Cloudinary denied the generated transformation (403). Check that generative transformations are enabled for the account and that the selected reference image is available."
          : "Could not complete mockup generation and R2 storage. Check server logs for the failing step and cleanup details before retrying.";
    return NextResponse.json(
      { error: detail },
      { status: 502 }
    );
  }
}
