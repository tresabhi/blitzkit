import { Markdown } from '../../../../../components/Markdown';
import { PageWrapper } from '../../../../../components/PageWrapper';

interface PageProps {
  content: string;
}

export function Page({ content }: PageProps) {
  return (
    <PageWrapper>
      <Markdown>{content}</Markdown>
    </PageWrapper>
  );
}
