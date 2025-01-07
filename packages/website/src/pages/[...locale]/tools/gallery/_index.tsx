import { CalendarIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { GalleryList, type Avatar } from '../../../../components/Gallery/List';
import { GallerySearch } from '../../../../components/Gallery/Search';
import { PageWrapper } from '../../../../components/PageWrapper';
import { literals } from '../../../../core/i18n/literals';
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from '../../../../hooks/useLocale';
import { GalleryEphemeral } from '../../../../stores/galleryEphemeral';

interface ContentProps {
  avatars: Avatar[];
  lastUpdated: string;
}

type PageProps = ContentProps & LocaleAcceptorProps;

export function Page({ locale, ...props }: PageProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content {...props} />
    </LocaleProvider>
  );
}

function Content({ avatars, lastUpdated }: ContentProps) {
  const { strings } = useLocale();

  return (
    <PageWrapper maxWidth="80rem" color="gold">
      <Flex justify="center">
        <Callout.Root size="1">
          <Callout.Icon>
            <CalendarIcon />
          </Callout.Icon>
          <Callout.Text>
            {literals(strings.website.tools.gallery.last_updated, [
              lastUpdated,
            ])}
          </Callout.Text>
        </Callout.Root>
      </Flex>

      <GalleryEphemeral.Provider>
        <GallerySearch />
        <GalleryList avatars={avatars} />
      </GalleryEphemeral.Provider>
    </PageWrapper>
  );
}
