export async function patientFetchJSON<Type extends object>(
  url: string,
  timeout = 1000,
  options?: Partial<{ cache: 'no-store' }>,
) {
  let patientJSON: Type;

  while (patientJSON! === undefined) {
    try {
      patientJSON = (await fetch(url, options).then(({ json }) =>
        json(),
      )) as Type;
    } catch (error) {
      console.warn(
        `Failed to fetch ${url} as JSON; retrying in ${timeout}ms...`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }

  return patientJSON;
}
