import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from '../hooks/useLocale';

function Content() {
  const { locale, strings } = useLocale();
  const content = JSON.stringify(strings, null, 2);

  return <span>{strings.common.units.deg_s}</span>;
}

export function TestComponent({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );
}
