import { assertSecret, type BlitzGlossary } from '@blitzkit/core';

export async function fetchGlossary(locale: string) {
  const response = await fetch(
    `${assertSecret(
      import.meta.env.WOTB_GLOSSARY_DOMAIN,
    )}/${locale}${assertSecret(import.meta.env.WOTB_GLOSSARY_PATH)}`,
  );
  return (await response.json()) as BlitzGlossary;
}
