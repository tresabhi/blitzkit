import { assertSecret } from '@blitzkit/core';
import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { google } from 'googleapis';
import { awaitableTankDefinitions } from '../core/awaitables/tankDefinitions';
import { literals } from '../core/i18n/literals';
import { LocaleProvider, useLocale } from '../hooks/useLocale';
import { TankopediaPersistent } from '../stores/tankopediaPersistent';
import { TankCard } from './TankCard';

const [tankDefinitions] = await Promise.all([awaitableTankDefinitions, ,]);

const auth = await google.auth.getClient({
  keyFile: import.meta.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});
const analytics = google.analyticsdata({ version: 'v1beta', auth });
const report = await analytics.properties.runReport({
  property: `properties/${assertSecret(import.meta.env.PUBLIC_GOOGLE_ANALYTICS_PROPERTY_ID)}`,
  requestBody: {
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: { matchType: 'BEGINS_WITH', value: '/tools/tankopedia/' },
      },
    },
  },
});

if (!report.data.rows) {
  throw new Error('No rows in report');
}

const hotTanks = report.data.rows
  .filter(
    (row) =>
      row.dimensionValues &&
      row.dimensionValues[0].value &&
      row.dimensionValues[0].value !== '/tools/tankopedia/' &&
      row.metricValues &&
      row.metricValues[0].value,
  )
  .map((row) => ({
    id: Number(
      row.dimensionValues![0].value!.match(
        /\/tools\/tankopedia\/(\d+)\/?/,
      )?.[1],
    ),
    views: Number(row.metricValues![0].value!),
  }))
  .filter((row) => {
    if (!(row.id in tankDefinitions.tanks)) {
      // console.log('Unknown tank', row.id);
    }

    return row.id in tankDefinitions.tanks;
  })
  .slice(0, 8)
  .map(({ id, views }) => ({
    tank: tankDefinitions.tanks[id],
    views,
  }));

interface HomePageHotTanksProps {
  locale: string | undefined;
}

export function HomePageHotTanks({ locale }: HomePageHotTanksProps) {
  return (
    <LocaleProvider locale={locale}>
      <TankopediaPersistent.Provider>
        <Content />
      </TankopediaPersistent.Provider>
    </LocaleProvider>
  );
}

function Content() {
  const { locale, strings } = useLocale();

  return (
    <Flex direction="column" pt="4" pb="8">
      <Heading align="center" size="5">
        {strings.website.home.hot_tanks.title}
      </Heading>
      <Text color="gray" align="center" mb="5" size="2">
        {literals(strings.website.home.hot_tanks.subtitle, ['7'])}
      </Text>

      <Flex justify="center" gap="4" wrap="wrap">
        {hotTanks.map((row) => (
          <Box width="7rem" key={row.tank.id}>
            <TankCard
              tank={row.tank}
              discriminator={
                <Flex align="center" gap="1" justify="center">
                  <EyeOpenIcon />
                  {Math.round(row.views * (30 / 7)).toLocaleString(locale)}
                </Flex>
              }
            />
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
