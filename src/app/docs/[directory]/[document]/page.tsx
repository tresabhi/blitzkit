import { Table } from '@radix-ui/themes';
import Markdown from 'markdown-to-jsx';
import { use } from 'react';
import { Link } from '../../../../components/Link';
import PageWrapper from '../../../../components/PageWrapper';
import { assertSecrete } from '../../../../core/blitzkit/secrete';

export default function Page({
  params,
}: {
  params: { document: string; directory: string };
}) {
  const markdown = use(
    fetch(
      `https://raw.githubusercontent.com/tresabhi/blitzkit/${assertSecrete(
        process.env.NEXT_PUBLIC_ASSET_BRANCH,
      )}/docs/${params.directory}/${params.document}.md`,
    ).then((response) => response.text()),
  );

  return (
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
  );
}
