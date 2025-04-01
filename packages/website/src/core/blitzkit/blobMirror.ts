import { fetchPB, type MessageFns } from '@blitzkit/core';
import type { APIRoute } from 'astro';

export async function blobMirror(url: string) {
  if (import.meta.env.MODE === 'development') {
    return Response.redirect(url);
  } else {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Response(blob, { headers: response.headers });
  }
}

export function apiMirror(path: string) {
  const get: APIRoute = () => blobMirror(`http://localhost:5000${path}`);
  return get;
}

export function jsonMirror<Type>(path: string, message: MessageFns<Type>) {
  const get: APIRoute = async () => {
    return new Response(
      JSON.stringify(await fetchPB(`http://localhost:5000${path}`, message)),
    );
  };
  return get;
}
