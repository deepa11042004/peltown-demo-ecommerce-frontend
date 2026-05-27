import { NextRequest, NextResponse } from "next/server";

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE"]);

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

const proxyCheckoutRequest = async (request: NextRequest) => {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return NextResponse.json(
      {
        message: "API_URL is not configured",
      },
      { status: 500 },
    );
  }

  const targetUrl = `${apiBaseUrl}/api/v1/checkout${request.nextUrl.search}`;
  const requestHeaders = new Headers();
  const forceGuestMode = request.headers.get("x-shopping-guest-mode") === "true";

  const incomingContentType = request.headers.get("content-type");
  if (incomingContentType) {
    requestHeaders.set("content-type", incomingContentType);
  }

  const incomingAuthorization = request.headers.get("authorization");
  if (incomingAuthorization && !forceGuestMode) {
    requestHeaders.set("authorization", incomingAuthorization);
  }

  const incomingCookie = request.headers.get("cookie");
  if (incomingCookie && !forceGuestMode) {
    requestHeaders.set("cookie", incomingCookie);
  }

  const incomingGuestId = request.headers.get("x-guest-id");
  if (incomingGuestId) {
    requestHeaders.set("x-guest-id", incomingGuestId);
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
        message: "Unable to reach checkout service",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
};

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyCheckoutRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  return proxyCheckoutRequest(request);
}
