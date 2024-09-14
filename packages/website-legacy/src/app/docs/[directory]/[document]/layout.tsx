import { readdir } from 'fs/promises';

export async function generateStaticParams() {
  return await readdir('../../docs').then((directories) =>
    Promise.all(
      directories
        .filter(
          (directory) =>
            !['.vitepress', 'public'].includes(directory) &&
            !directory.endsWith('.md'),
        )
        .map((directory) =>
          readdir(`../../docs/${directory}`).then((files) =>
            Promise.all(
              files
                .filter((file) => file.endsWith('.md'))
                .map((file) => ({
                  directory,
                  document: file.replace(/\.md$/, ''),
                })),
            ),
          ),
        ),
    ).then((directories) => directories.flat()),
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
