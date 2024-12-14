import { asset, tankIcon, TankType, type TankDefinition } from '@blitzkit/core';
import { Flex, Link, Text, type TextProps } from '@radix-ui/themes';
import { uniq } from 'lodash-es';
import { forwardRef, type ReactNode } from 'react';
import { TankopediaPersistent } from '../../stores/tankopediaPersistent';
import { classIcons } from '../ClassIcon';
import { MAX_RECENTLY_VIEWED } from '../TankSearch/constants';
import './index.css';

type TankCardProps = TextProps & {
  tank: TankDefinition;
  onTankSelect?: (tank: TankDefinition) => void;
  discriminator?: ReactNode;
  noLink?: boolean;
};

export const TankCard = forwardRef<HTMLSpanElement, TankCardProps>(
  (
    {
      tank,
      discriminator,
      onTankSelect: onSelect,
      noLink,
      style,
      ...props
    }: TankCardProps,
    ref,
  ) => {
    const provideLink = !noLink && onSelect === undefined;
    const mutateTankopediaPersistent = TankopediaPersistent.useMutation();
    const Icon = classIcons[tank.class];

    return (
      <Text
        ref={ref}
        tabIndex={onSelect ? 0 : undefined}
        size="1"
        color={
          tank.type === TankType.COLLECTOR
            ? 'blue'
            : tank.type === TankType.PREMIUM
              ? 'amber'
              : 'gray'
        }
        highContrast={tank.type === TankType.RESEARCHABLE}
        onClick={() => {
          onSelect?.(tank);
          mutateTankopediaPersistent((draft) => {
            draft.recentlyViewed = uniq([
              tank.id,
              ...draft.recentlyViewed,
            ]).slice(0, MAX_RECENTLY_VIEWED);
          });
        }}
        className="tank-search-card"
        data-provide-link={provideLink}
        style={{
          backgroundImage: `url(${asset(`flags/scratched/${tank.nation}.webp`)})`,
          ...style,
        }}
        {...props}
      >
        <Link
          className="link"
          underline="hover"
          href={provideLink ? `/tools/tankopedia/${tank.id}` : '#'}
          onClick={(event) => {
            if (!provideLink) event.preventDefault();
          }}
        >
          <img
            alt={tank.name}
            src={tankIcon(tank.id)}
            className="image"
            draggable={false}
          />

          <Flex
            justify="center"
            gap="1"
            align="center"
            overflow="hidden"
            width="100%"
          >
            <Icon className="class-icon" />
            <Text align="center" className="name">
              {tank.name}
            </Text>
          </Flex>

          {discriminator && (
            <Text
              color="gray"
              align="center"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {discriminator}
            </Text>
          )}
        </Link>
      </Text>
    );
  },
);
