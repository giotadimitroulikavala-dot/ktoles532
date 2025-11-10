export const config = {
  runtime: 'edge', // Runs like a Cloudflare Worker
};

export default async function handler(request) {
  // Allow foothubhd.live and foothubhd.online
  const allowedOriginsPattern = /^https?:\/\/(foothubhd\.live|foothubhd\.online)/;
  const origin = request.headers.get('origin') || request.headers.get('referer');

  // If origin not allowed → redirect
  if (!origin || !allowedOriginsPattern.test(origin)) {
    return Response.redirect('https://foothubhd.online', 302);
  }

  const targetURL = 'https://chanis.hantekomenos.xyz:445/';
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

    // Stream the response directly back
    return new Response(response.body, response);

  } catch (error) {
    return new Response('Error fetching resource', { status: 500 });
  }
}
