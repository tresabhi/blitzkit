export async function patientFetch(
  url: string,
  timeout = 1000,
  options?: Partial<{ cache: 'no-store' }>,
) {
  let patientResponse: Response;

  while (patientResponse! === undefined) {
    try {
      patientResponse = await fetch(url, options);
    } catch (error) {
      console.warn(
        `Failed to fetch ${url}; retrying in ${timeout}ms...`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }

  return patientResponse;
}
