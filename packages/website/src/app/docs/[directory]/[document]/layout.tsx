import { assertSecret } from '@blitzkit/core';

export async function generateStaticParams() {
  return await fetch(
    `https://api.github.com/repos/tresabhi/blitzkit/contents/docs?ref=${assertSecret(
      process.env.NEXT_PUBLIC_ASSET_BRANCH,
    )}`,
  )
    .then((response) => response.json() as Promise<{ name: string }[]>)
    .then((directories) =>
      Promise.all(
        directories
          .filter(
            (directory) =>
              !['.vitepress', 'public', 'index.md'].includes(directory.name),
          )
          .map((directory) =>
            fetch(
              `https://api.github.com/repos/tresabhi/blitzkit/contents/docs/${directory.name}?ref=${assertSecret(
                process.env.NEXT_PUBLIC_ASSET_BRANCH,
              )}`,
            )
              .then(
                (response) => response.json() as Promise<{ name: string }[]>,
              )
              .then((docs) =>
                docs
                  .map((document) => {
                    console.log(`${directory.name}/${document.name}`);
                    return document;
                  })
                  .map((document) => ({
                    document: document.name.split('.').slice(0, -1).join('.'),
                    directory: directory.name,
                  })),
              ),
          ),
      ),
    )
    .then((docs) => docs.flat());
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
