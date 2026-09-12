export const config = { runtime: 'edge' };

import { AwsClient } from 'aws4fetch';

const client = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  service: 's3',
  region: 'auto',
});

export default async function handler(request) {
  const url = new URL(request.url);
  const bucket = 'tohkampelis';
  const accountId = '5f05442df109b7bf41429568bde96343';
  const targetUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}${url.pathname}`;

  const signedRequest = await client.sign(targetUrl, {
    method: request.method,
    headers: { 'host': `${accountId}.r2.cloudflarestorage.com` },
  });

  const response = await fetch(signedRequest);
  const modifiedResponse = new Response(response.body, response);
  modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
  modifiedResponse.headers.set('Cache-Control', 'public, max-age=2, s-maxage=2');
  return modifiedResponse;
}
