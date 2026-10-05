import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

function getStorageConfig() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null;
  }

  return {
    bucketName,
    publicUrl,
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

function getManagedMediaKey(src: string, publicUrl: string) {
  try {
    const base = new URL(publicUrl);
    const mediaUrl = new URL(src);
    const basePath = base.pathname.replace(/\/$/, "");
    const mediaPrefix = `${basePath}/product-media/`;

    if (
      mediaUrl.origin !== base.origin ||
      mediaUrl.username ||
      mediaUrl.password ||
      mediaUrl.search ||
      mediaUrl.hash ||
      !mediaUrl.pathname.startsWith(mediaPrefix)
    ) {
      return null;
    }

    const encodedKey = mediaUrl.pathname.slice(basePath.length + 1);
    const segments = encodedKey.split("/").map((segment) => decodeURIComponent(segment));
    if (
      segments.some((segment) => !segment || segment === "." || segment === ".." || /[\\/]/.test(segment))
    ) {
      return null;
    }

    const key = segments.join("/");
    return /^product-media\/[0-9a-f-]{36}\.(?:jpeg|png|webp|avif|mp4|webm|mov)$/.test(key)
      ? key
      : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getStorageConfig();
  if (!config) {
    return NextResponse.json(
      { error: "R2 upload storage is not configured on the server." },
      { status: 503 }
    );
  }

  let input: { contentType?: unknown; size?: unknown; mediaType?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const contentType = typeof input.contentType === "string" ? input.contentType : "";
  const size = typeof input.size === "number" ? input.size : 0;
  const mediaType = input.mediaType === "video" ? "video" : "image";
  const allowedTypes = mediaType === "video" ? VIDEO_TYPES : IMAGE_TYPES;
  const maxBytes = mediaType === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

  if (!allowedTypes.has(contentType)) {
    return NextResponse.json({ error: `Unsupported ${mediaType} file format.` }, { status: 400 });
  }
  if (!Number.isSafeInteger(size) || size <= 0 || size > maxBytes) {
    return NextResponse.json(
      { error: `File must be smaller than ${mediaType === "video" ? "100 MB" : "20 MB"}.` },
      { status: 400 }
    );
  }

  const extension = contentType.split("/")[1].replace("quicktime", "mov");
  const key = `product-media/${randomUUID()}.${extension}`;
  const uploadUrl = await getSignedUrl(
    config.client,
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 }
  );
  const publicUrl = `${config.publicUrl}/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let input: { src?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid media deletion request." }, { status: 400 });
  }

  if (typeof input.src !== "string" || !input.src.trim()) {
    return NextResponse.json({ error: "Media URL is required." }, { status: 400 });
  }

  const config = getStorageConfig();
  if (!config) {
    return NextResponse.json(
      { error: "R2 storage is not configured on the server." },
      { status: 503 }
    );
  }

  const key = getManagedMediaKey(input.src, config.publicUrl);
  if (!key) return NextResponse.json({ deleted: false });

  try {
    await config.client.send(
      new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })
    );
  } catch (error) {
    console.error("Could not delete product media from R2:", error);
    return NextResponse.json(
      { error: "Could not delete media from R2." },
      { status: 502 }
    );
  }

  return NextResponse.json({ deleted: true });
}
