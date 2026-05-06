export const config = {
  runtime: 'edge', // Runs like a Cloudflare Worker
};

export default async function handler(request) {
  const targetURL = 'https://pub-2e51144dbaa143659c2b4635a01a88d0.r2.dev';
  const newURL = new URL(request.url);
  newURL.hostname = new URL(targetURL).hostname;

  const proxyRequest = new Request(newURL.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow',
  });

  proxyRequest.headers.set('host', new URL(targetURL).hostname);

  try {
    const response = await fetch(proxyRequest);

    const modifiedResponse = new Response(response.body, response);

    // Allow all origins
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', '*');

    // Main cache control (2 seconds)
    modifiedResponse.headers.set('Cache-Control', 'public, max-age=2, s-maxage=2');

    return modifiedResponse;

  } catch (error) {
    return new Response('Error fetching resource', { status: 500 });
  }
}
