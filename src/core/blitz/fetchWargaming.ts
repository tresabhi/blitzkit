export type BlitzResponse<Data extends object> =
  | {
      status: 'error';
      error: { field: string; message: string; code: 402; value: null };
    }
  | {
      status: 'ok';
      data: Data;
    };

export default async function fetchBlitz<Data extends object>(url: string) {
  const data = (await fetch(url).then((response) =>
    response.json(),
  )) as BlitzResponse<Data>;

  if (data.status === 'ok') {
    return data.data;
  } else {
    throw new Error(`Wargaming response error status:"${data.status}"`, {
      cause: `Message: "${data.error.message}"\nURL: "${url}"`,
    });
  }
}
