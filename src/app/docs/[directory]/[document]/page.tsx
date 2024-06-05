import Markdown from 'markdown-to-jsx';
import { use } from 'react';
import { Link } from '../../../../components/Link';
import PageWrapper from '../../../../components/PageWrapper';
import isDev from '../../../../core/blitzkit/isDev';

export default function Page({
  params,
}: {
  params: { document: string; directory: string };
}) {
  const markdown = use(
    fetch(
      `https://raw.githubusercontent.com/tresabhi/blitzkit/${isDev() ? 'dev' : 'main'}/docs/${params.directory}/${params.document}.md`,
    ).then((response) => response.text()),
  );

  return (
    <PageWrapper>
      <Markdown
        options={{
          overrides: {
            a: { component: Link },
          },
        }}
      >
        {markdown}
      </Markdown>
    </PageWrapper>
  );
}
