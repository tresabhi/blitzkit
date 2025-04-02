import { fetchPB, type MessageFns } from '@blitzkit/core';

export async function blobProxy(url: string) {
  if (import.meta.env.MODE === 'development') {
    return Response.redirect(url);
  } else {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Response(blob, { headers: response.headers });
  }
}

export function apiBlobProxy(path: string) {
  return blobProxy(`http://localhost:5000${path}`);
}

export function apiBlobProxyCurry(path: string) {
  return () => apiBlobProxy(path);
}

export async function jsonMirror<Type>(
  path: string,
  message: MessageFns<Type>,
) {
  return new Response(
    JSON.stringify(await fetchPB(`http://localhost:5000${path}`, message)),
  );
}

export function jsonMirrorCurry<Type>(path: string, message: MessageFns<Type>) {
  return () => jsonMirror(path, message);
}
