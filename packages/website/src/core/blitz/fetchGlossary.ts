import { assertSecret, type BlitzGlossary } from '@blitzkit/core';

export async function fetchGlossary() {
  const response = await fetch(assertSecret(import.meta.env.WOTB_GLOSSARY));
  return (await response.json()) as BlitzGlossary;
}
