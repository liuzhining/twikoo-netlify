// Keep the database name aligned with the Atlas user's readWrite role.
if (process.env.MONGODB_URI) {
  const mongoUri = new URL(process.env.MONGODB_URI);
  mongoUri.pathname = '/twikoo';
  process.env.MONGODB_URI = mongoUri.toString();
}

const { default: handleTwikoo } = await import('twikoo-netlify');

const allowedOrigins = new Set([
  'https://liuzhining.com',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
]);

export default async function handleRequest(request, context) {
  const origin = request.headers.get('Origin');
  const response = request.method === 'OPTIONS'
    ? new Response(null, { status: 204 })
    : await handleTwikoo(request, context);

  const headers = new Headers(response.headers);
  headers.append('Vary', 'Origin');
  headers.delete('Access-Control-Allow-Origin');
  if (allowedOrigins.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
