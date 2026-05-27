import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

const getApiBaseUrl = () => {
  const value = process.env.API_URL?.trim();

  if (!value) {
    return null;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const proxyUploadRequest = async (request: NextRequest, context: RouteContext) => {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        message: "API_URL is not configured",
      },
      { status: 500 },
    );
  }

  const { path } = await context.params;
  const pathnameSuffix = path && path.length > 0
    ? `/${path.map((segment) => encodeURIComponent(segment)).join("/")}`
    : "";
  const targetUrl = `${apiBaseUrl}/uploads${pathnameSuffix}${request.nextUrl.search}`;

  const requestHeaders = new Headers();
  const incomingAccept = request.headers.get("accept");
  if (incomingAccept) {
    requestHeaders.set("accept", incomingAccept);
  }

  const incomingRange = request.headers.get("range");
  if (incomingRange) {
    requestHeaders.set("range", incomingRange);
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method.toUpperCase(),
      headers: requestHeaders,
      cache: "no-store",
      redirect: "follow",
    });

    const responseHeaders = new Headers();

    const copyHeader = (name: string) => {
      const value = upstream.headers.get(name);
      if (value) {
        responseHeaders.set(name, value);
      }
    };

    copyHeader("content-type");
    copyHeader("content-length");
    copyHeader("cache-control");
    copyHeader("etag");
    copyHeader("last-modified");
    copyHeader("accept-ranges");
    copyHeader("content-range");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to reach uploads service",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyUploadRequest(request, context);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxyUploadRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyUploadRequest(request, context);
}
