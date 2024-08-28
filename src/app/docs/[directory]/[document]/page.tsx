import { Table } from '@radix-ui/themes';
import Markdown from 'markdown-to-jsx';
import { use } from 'react';
import { Link } from '../../../../components/Link';
import PageWrapper from '../../../../components/PageWrapper';
import { assertSecret } from '../../../../core/blitzkit/secret';

export default function Page({
  params,
}: {
  params: { document: string; directory: string };
}) {
  const markdown = use(
    fetch(
      `https://raw.githubusercontent.com/tresabhi/blitzkit/${assertSecret(
        process.env.NEXT_PUBLIC_ASSET_BRANCH,
      )}/docs/${params.directory}/${params.document}.md`,
    ).then((response) => response.text()),
  );
  const title = markdown.split('\n')[0].replaceAll(/[^a-zA-Z0-9 \.&]/g, '');

  return (
    <>
      <title>{title}</title>

      <PageWrapper>
        <Markdown
          options={{
            overrides: {
              a: { component: Link },
              table: { component: Table.Root },
              thead: { component: Table.Header },
              tbody: { component: Table.Body },
              tr: { component: Table.Row },
              th: { component: Table.ColumnHeaderCell },
              td: { component: Table.Cell },
            },
          }}
        >
          {markdown}
        </Markdown>
      </PageWrapper>
    </>
  );
}
