import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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
