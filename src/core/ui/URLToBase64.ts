export default async function URLToBase64(URL: string) {
  const response = await fetch(URL);
  const blob = await response.arrayBuffer();
  const base64 = `data:${response.headers.get(
    'content-type',
  )};base64,${Buffer.from(blob).toString('base64')}`;

  return base64;
}
