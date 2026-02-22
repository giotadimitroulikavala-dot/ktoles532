export const config = {
  runtime: 'edge', // Runs like a Cloudflare Worker
};

export default async function handler(request) {
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

    // ✅ Allow all origins
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', '*');

    // Cache control
    if (newURL.pathname.endsWith('.ts')) {
      modifiedResponse.headers.set('Cache-Control', 'public, max-age=2, s-maxage=2');
    } else {
      modifiedResponse.headers.set('Cache-Control', 'no-cache');
    }

    return modifiedResponse;

  } catch (error) {
    return new Response('Error fetching resource', { status: 500 });
  }
}
