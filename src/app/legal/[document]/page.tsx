import Markdown from 'markdown-to-jsx';
import { use } from 'react';
import PageWrapper from '../../../components/PageWrapper';

export default function Page({ params }: { params: { document: string } }) {
  const markdown = use(
    fetch(
      `https://raw.githubusercontent.com/tresabhi/blitzkit/main/docs/legal/${params.document}.md`,
    ).then((response) => response.text()),
  );

  return (
    <PageWrapper>
      <Markdown>{markdown}</Markdown>
    </PageWrapper>
  );
}
