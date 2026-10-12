import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const MODEL = "gemini-3.5-flash-lite";
const MAX_IMAGES = 4;
const NAME_PROMPT = `You are a product naming assistant for a luxury Nigerian resort-wear fashion brand.
Analyze the garment shown at the provided image URL or URLs and generate one product title following this formula: [Style/Pattern/Theme] + [Garment Type].
Examples of the format: Monochrome Canvas Shirt, Sunset Silk Trousers.
Use only visual details that can be identified from the images. Do not invent material or construction details that are not visible.
Output ONLY the name itself. Do not include quotation marks, labels, explanations, bullets, or extra text.`;
const DESCRIPTION_PROMPT = `Write a concise ecommerce product description using only details visible in the product images at the provided URLs and the product name.
Describe the garment type, visible colours, print or pattern, and clearly visible design details such as collar, sleeves, buttons, or shape.
Use polished fashion-store language in 1–2 sentences.
Do not guess or invent fabric, fit, comfort, origin, craftsmanship, care instructions, sizing, or any detail not clearly visible.
Avoid generic claims and do not repeat the product name unnecessarily.
Return only the description text, with no heading, bullets, quotation marks, or explanation.`;

function getImageBaseUrl() {
  const value = process.env.R2_PUBLIC_URL;
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function getAllowedImageUrl(src: string, baseUrl: URL) {
  try {
    const url = new URL(src);
    const basePath = baseUrl.pathname.replace(/\/$/, "");
    const mediaPath = url.pathname.slice(basePath.length);
    if (
      url.protocol !== "https:" ||
      url.origin !== baseUrl.origin ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.pathname.startsWith(`${basePath}/product-media/`) ||
      !/^\/product-media\/[0-9a-f-]{36}\.(?:jpeg|png|webp)$/i.test(mediaPath)
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI product generation is not configured. Add GEMINI_API_KEY to the server environment." },
      { status: 503 }
    );
  }

  const imageBaseUrl = getImageBaseUrl();
  if (!imageBaseUrl) {
    return NextResponse.json(
      { error: "Configure R2_PUBLIC_URL with the HTTPS product image domain before generating product AI content." },
      { status: 503 }
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 64 * 1024) {
    return NextResponse.json(
      { error: "The description request is too large." },
      { status: 413 }
    );
  }

  let input: {
    task?: unknown;
    name?: unknown;
    instructions?: unknown;
    media?: unknown;
  };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid product AI request." }, { status: 400 });
  }

  const task = input.task === undefined ? "description" : input.task;
  if (task !== "name" && task !== "description") {
    return NextResponse.json({ error: "Unsupported product AI task." }, { status: 400 });
  }
  const productName = typeof input.name === "string" ? input.name.trim() : "";
  if (
    task === "description" &&
    (!productName || productName.length > 200)
  ) {
    return NextResponse.json(
      { error: "Enter a product name of 1–200 characters before generating a description." },
      { status: 400 }
    );
  }
  if (
    task === "description" &&
    input.instructions !== undefined &&
    (typeof input.instructions !== "string" || input.instructions.length > 1000)
  ) {
    return NextResponse.json(
      { error: "Additional instructions must be 1,000 characters or fewer." },
      { status: 400 }
    );
  }
  if (
    !Array.isArray(input.media) ||
    input.media.length > 100 ||
    !input.media.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "src" in item &&
        typeof item.src === "string" &&
        "type" in item &&
        typeof item.type === "string"
    )
  ) {
    return NextResponse.json({ error: "Product images are invalid." }, { status: 400 });
  }

  const imageUrls = input.media
    .filter((item) => item.type === "image")
    .slice(0, MAX_IMAGES)
    .map((item) => getAllowedImageUrl(item.src, imageBaseUrl));

  if (imageUrls.length === 0 || imageUrls.some((url) => url === null)) {
    return NextResponse.json(
      {
        error:
          "Use at least one JPEG, PNG, or WebP product image hosted in the configured R2 product-media folder.",
      },
      { status: 400 }
    );
  }
  const validImageUrls = imageUrls.filter((url): url is URL => url !== null);

  try {
    const prompt =
      task === "name"
        ? NAME_PROMPT
        : [
            DESCRIPTION_PROMPT,
            `Product name: ${productName}`,
            typeof input.instructions === "string" && input.instructions.trim()
              ? `Additional admin guidance: ${input.instructions.trim()}`
              : "",
          ]
            .filter(Boolean)
            .join("\n\n");
    const inputText = [
      prompt,
      "Use the image content at these URLs as visual input:",
      ...validImageUrls.map((url) => url.href),
    ].join("\n\n");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: MODEL,
          input: inputText,
          tools: [{ type: "url_context" }],
          store: false,
        }),
        signal: AbortSignal.timeout(30_000),
      }
    );

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("Gemini product description request failed:", {
        status: response.status,
        message: result?.error?.message,
      });
      return NextResponse.json(
        {
          error:
            response.status === 429
              ? "The AI service is busy or its free-tier limit was reached. Try again later."
              : `The AI service could not generate a product ${task}. Check the server logs and API key, then try again.`,
        },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const generatedText =
      typeof result?.output_text === "string" ? result.output_text.trim() : "";

    if (
      !generatedText ||
      generatedText.length > (task === "name" ? 120 : 10_000) ||
      (task === "name" && generatedText.includes("\n"))
    ) {
      return NextResponse.json(
        {
          error: `The AI service returned no usable product ${task}. Try again.`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      task === "name"
        ? { name: generatedText.replace(/^["'`]|["'`]$/g, "") }
        : { description: generatedText }
    );
  } catch (error) {
    console.error("Could not generate product description:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.name === "TimeoutError"
            ? `Generating the product ${task} took too long. Please try again.`
            : "Could not reach the AI service to analyze the product image URLs. Check the connection and try again.",
      },
      { status: 502 }
    );
  }
}
