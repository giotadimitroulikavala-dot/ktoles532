export const config = {
  runtime: 'edge', // Runs like a Cloudflare Worker
};

export default async function handler(request) {
  // Allow foothubhd.live and foothubhd.online
  const allowedOriginsPattern = /^https?:\/\/(foothubhd\.info|foothubhd\.info)/;
  const origin = request.headers.get('origin') || request.headers.get('referer');

  // If origin not allowed → redirect
  if (!origin || !allowedOriginsPattern.test(origin)) {
    return Response.redirect('https://foothubhd.info', 302);
  }

  const targetURL = 'https://f003.backblazeb2.com/';
  const newURL = new URL(request.url);
  newURL.hostname = new URL(targetURL).hostname;

  // Clone request into a new one with updated URL and headers
  const proxyRequest = new Request(newURL.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow',
  });

  proxyRequest.headers.set('host', new URL(targetURL).hostname);

  try {
    const response = await fetch(proxyRequest);

    // Clone the response so we can safely modify headers
    const modifiedResponse = new Response(response.body, response);

    // 🧠 Add cache control for .ts files (2 seconds)
    if (newURL.pathname.endsWith('.ts')) {
      // Cache for 2 seconds (both browser + edge)
      modifiedResponse.headers.set('Cache-Control', 'public, max-age=2, s-maxage=2');
    } else {
      // Default: no cache
      modifiedResponse.headers.set('Cache-Control', 'no-cache');
    }

    // Stream response back
    return modifiedResponse;

  } catch (error) {
    return new Response('Error fetching resource', { status: 500 });
  }
}
