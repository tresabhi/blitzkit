import { Badge, Card, Flex, Text } from '@radix-ui/themes';
import PageWrapper from '../../../components/PageWrapper';
import { tankIcon } from '../../../core/blitzkrieg/tankIcon';
import { tanks } from '../../../core/blitzkrieg/tankopedia';

const sortedTanks = tanks.then((tanks) =>
  tanks.sort((a, b) => b.tier - a.tier),
);

export default async function Page() {
  const awaitedTanks = await sortedTanks;

  return (
    <PageWrapper>
      {awaitedTanks.map((tank) => (
        <Card
          style={{
            // backgroundImage: `url(${tankIcon(tank.id)})`,
            // backgroundRepeat: 'no-repeat',
            // backgroundPosition: '8px 8px',
            minHeight: 128,
          }}
        >
          <Flex justify="between" align="center">
            <img
              src={tankIcon(tank.id)}
              style={{
                backgroundColor: 'white',
                width: 256,
                height: 128,
                objectFit: 'contain',
                objectPosition: 'left center',
              }}
            />

            <Flex direction="column" justify="center" align="end" gap="2">
              <Text>
                {tank.name_short ?? tank.name ?? `Unknown tank ${tank.id}`}
              </Text>

              <Flex justify="end" align="center" gap="1">
                {tank.tree_type !== 'tech-tree' && (
                  <Badge
                    color={tank.tree_type === 'collector' ? 'blue' : 'amber'}
                  >
                    {tank.tree_type === 'collector' ? 'Collector' : 'Premium'}
                  </Badge>
                )}
                <Badge color="indigo">
                  {(() => {
                    if (tank.type === 'AT-SPG') return 'Tank Destroyer';
                    if (tank.type === 'lightTank') return 'Light Tank';
                    if (tank.type === 'mediumTank') return 'Medium Tank';
                    if (tank.type === 'heavyTank') return 'Heavy Tank';
                  })()}
                </Badge>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      ))}
    </PageWrapper>
  );
}
