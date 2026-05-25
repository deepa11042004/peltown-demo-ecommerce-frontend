import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const METHODS_WITH_BODY = new Set(["PUT", "PATCH", "DELETE"]);

const getApiBaseUrl = () => {
  const value = process.env.API_URL?.trim();

  if (!value) {
    return null;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const copySetCookieHeaders = (upstream: Response, responseHeaders: Headers) => {
  const maybeHeaders = upstream.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies = maybeHeaders.getSetCookie?.() ?? [];

  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", cookie);
    }
    return;
  }

  const fallbackCookie = upstream.headers.get("set-cookie");
  if (fallbackCookie) {
    responseHeaders.set("set-cookie", fallbackCookie);
  }
};

const proxyProductByIdRequest = async (request: NextRequest, context: RouteContext) => {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        message: "API_URL is not configured",
      },
      { status: 500 },
    );
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      {
        message: "Product id is required",
      },
      { status: 400 },
    );
  }

  const targetUrl = `${apiBaseUrl}/api/v1/products/${encodeURIComponent(id)}${request.nextUrl.search}`;
  const requestHeaders = new Headers();

  const incomingContentType = request.headers.get("content-type");
  if (incomingContentType) {
    requestHeaders.set("content-type", incomingContentType);
  }

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

  const method = request.method.toUpperCase();
  const body = METHODS_WITH_BODY.has(method)
    ? await request.arrayBuffer()
    : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers: requestHeaders,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    const cacheControl = upstream.headers.get("cache-control");
    if (cacheControl) {
      responseHeaders.set("cache-control", cacheControl);
    }

    const location = upstream.headers.get("location");
    if (location) {
      responseHeaders.set("location", location);
    }

    copySetCookieHeaders(upstream, responseHeaders);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to reach product service",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyProductByIdRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyProductByIdRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyProductByIdRequest(request, context);
}
