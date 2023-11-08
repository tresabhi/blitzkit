export async function patientFetch(url: string, timeout = 1 * 60 * 1000) {
  let patientResponse: Response;

  while (patientResponse! === undefined) {
    try {
      patientResponse = await fetch(url);
    } catch (error) {
      console.warn(`Failed to fetch ${url}; retrying in ${timeout}ms...`);
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  }

  return patientResponse;
}
