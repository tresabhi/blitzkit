export async function blobMirror(url: string) {
  if (import.meta.env.MODE === 'development') {
    return Response.redirect(url);
  } else {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Response(blob, { headers: response.headers });
  }
}
