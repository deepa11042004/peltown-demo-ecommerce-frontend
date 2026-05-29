import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ section: string }>;
};

const ALLOWED_SECTIONS = new Set([
  "products",
  "variants",
  "categories",
  "brands",
  "users",
  "hero-banners",
  "temp",
]);

const getApiBaseUrl = () => {
  const value = process.env.API_URL?.trim();

  if (!value) {
    return null;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: RouteContext) {
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

    const { section } = await context.params;

    if (!ALLOWED_SECTIONS.has(section)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported upload section",
        },
        { status: 400 },
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

    const upstreamFormData = new FormData();
    upstreamFormData.append("file", fileEntry);

    const baseNameEntry = formData.get("baseName");
    if (typeof baseNameEntry === "string" && baseNameEntry.trim()) {
      upstreamFormData.append("baseName", baseNameEntry.trim());
    }

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

    const upstream = await fetch(`${apiBaseUrl}/api/v1/media/upload/${encodeURIComponent(section)}`, {
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
