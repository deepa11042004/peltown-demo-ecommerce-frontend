import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const getApiBaseUrl = () => {
  const value = process.env.API_URL?.trim();

  if (!value) {
    return null;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "API_URL is not configured",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required",
        },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(fileEntry.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG, WEBP, and GIF images are allowed",
        },
        { status: 400 },
      );
    }

    if (fileEntry.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must be less than 5MB",
        },
        { status: 400 },
      );
    }

    const upstreamFormData = new FormData();
    upstreamFormData.append("file", fileEntry);

    const requestHeaders = new Headers();

    const incomingAuthorization = request.headers.get("authorization");
    if (incomingAuthorization) {
      requestHeaders.set("authorization", incomingAuthorization);
    }

    const incomingCookie = request.headers.get("cookie");
    if (incomingCookie) {
      requestHeaders.set("cookie", incomingCookie);
    }

    const incomingAccept = request.headers.get("accept");
    if (incomingAccept) {
      requestHeaders.set("accept", incomingAccept);
    }

    const incomingUserAgent = request.headers.get("user-agent");
    if (incomingUserAgent) {
      requestHeaders.set("user-agent", incomingUserAgent);
    }

    const upstream = await fetch(`${apiBaseUrl}/api/v1/products/uploads`, {
      method: "POST",
      headers: requestHeaders,
      body: upstreamFormData,
      cache: "no-store",
      redirect: "manual",
    });

    const contentType = upstream.headers.get("content-type") || "application/json";

    if (contentType.includes("application/json")) {
      const payload = await upstream.json();
      return NextResponse.json(payload, { status: upstream.status });
    }

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
