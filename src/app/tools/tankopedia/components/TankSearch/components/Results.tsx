import { slateDark } from '@radix-ui/colors';
import { Card, Flex, Inset, Link } from '@radix-ui/themes';
import { asset } from '../../../../../../core/blitzkit/asset';
import { TankDefinition } from '../../../../../../core/blitzkit/tankDefinitions';
import {
  TANK_ICONS,
  TANK_ICONS_COLLECTOR,
  TANK_ICONS_PREMIUM,
  TIER_ROMAN_NUMERALS,
} from '../../../../../../core/blitzkit/tankDefinitions/constants';
import { tankIcon } from '../../../../../../core/blitzkit/tankIcon';
import { theme } from '../../../../../../stitches.config';
import { CompactSearchResultRow } from './CompactSearchResultRow';

interface ResultsProps {
  compact?: boolean;
  results: TankDefinition[];
}

export function Results({ compact, results }: ResultsProps) {
  const firstChunk = compact
    ? results.slice(0, Math.ceil(results.length / 2))
    : [];
  const secondChunk = compact
    ? results.slice(Math.ceil(results.length / 2))
    : [];

  return (
    <Flex
      wrap="wrap"
      gap="2"
      style={{
        justifyContent:
          compact && firstChunk.length > 0 && secondChunk.length > 0
            ? 'space-around'
            : 'center',
      }}
    >
      {!compact &&
        results.map((tank) => (
          <Link
            href={`/tools/tankopedia/${tank.id}`}
            style={{
              flex: 1,
              minWidth: 256,
            }}
          >
            <Card
              key={tank.id}
              style={{
                cursor: 'pointer',
                height: 64,
                width: '100%',
              }}
            >
              <Inset
                key={tank.id}
                style={{
                  minHeight: 64,
                  position: 'relative',
                  display: 'flex',
                }}
              >
                <img
                  alt={tank.name}
                  className={styles.flag}
                  src={asset(`flags/scratched/${tank.nation}.webp`)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    position: 'absolute',
                  }}
                />

                <div
                  className={styles.listingShadow}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    transition: `box-shadow ${theme.durations.regular}`,
                  }}
                />

                <div
                  style={{
                    width: 256,
                    height: 128,
                  }}
                  className={styles.listingImage}
                >
                  <img
                    alt={tank.name}
                    src={tankIcon(tank.id)}
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'left center',
                    }}
                  />
                </div>

                <Flex
                  align="center"
                  justify="between"
                  className={styles.listingLabel}
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    padding: '0 12px',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <Flex align="center" justify="center" gap="1">
                    <img
                      alt={tank.name}
                      src={
                        (tank.treeType === 'collector'
                          ? TANK_ICONS_COLLECTOR
                          : tank.treeType === 'premium'
                            ? TANK_ICONS_PREMIUM
                            : TANK_ICONS)[tank.class]
                      }
                      style={{ width: '1em', height: '1em' }}
                    />
                    <Text
                      size="4"
                      color={
                        tank.treeType === 'collector'
                          ? 'blue'
                          : tank.treeType === 'premium'
                            ? 'amber'
                            : undefined
                      }
                      weight="medium"
                      style={{
                        color:
                          tank.treeType === 'researchable'
                            ? slateDark.slate12
                            : undefined,
                        whiteSpace: 'nowrap',
                        maxWidth: 160,
                        display: 'block',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      {tank.name}
                    </Text>
                  </Flex>

                  <Text size="4" color="gray" highContrast={false}>
                    {TIER_ROMAN_NUMERALS[tank.tier]}
                  </Text>
                </Flex>
              </Inset>
            </Card>
          </Link>
        ))}

      {compact && firstChunk.length > 0 && (
        <CompactSearchResultRow tanks={firstChunk} onSelect={onSelect} />
      )}

      {compact && secondChunk.length > 0 && (
        <CompactSearchResultRow tanks={secondChunk} onSelect={onSelect} />
      )}
    </Flex>
  );
}
