import {
  BlitzTankClass,
  Region,
  regionToRegionSubdomain,
} from '@blitzkit/core';
import { literals } from '@blitzkit/i18n';
import { tankDefinitions } from '../core/blitzkit/nonBlockingPromises';
import { chunkLines } from '../core/discord/chunkLines';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';

interface Auction {
  count: number;
  has_next: boolean;
  results: Result[];
}

type Result =
  | {
      id?: number;
      type: 'vehicle';
      countable?: boolean;
      entity?: Entity;
      initial_count: number;
      current_count: number;
      saleable?: boolean;
      available_from?: Date;
      available_before?: Date;
      price?: Price;
      next_price: Price | null;
      available: true;
      display?: boolean;
      next_price_datetime: Date;
      next_price_timestamp: number;
    }
  | {
      available: false;
      type: 'vehicle';
    };

interface Entity {
  id: number;
  name: string;
  nation: string;
  subnation: string;
  use_subnation_flag: boolean;
  type_slug: BlitzTankClass;
  level: number;
  roman_level: string;
  user_string: string;
  image_url: string;
  preview_image_url: string;
  is_premium: boolean;
  is_collectible: boolean;
}

interface Price {
  currency: Currency;
  value: number;
}

interface Currency {
  name: 'gold';
  count: number;
  title: 'Gold';
  image_url: string;
  sizes: unknown;
  type: 'currency';
}

const WARNING_COUNT = 500;

export const auctionCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand('auction'),

    async handler(interaction) {
      const { strings } = translator(interaction.locale);
      const awaitedTankDefinitions = await tankDefinitions;
      const region: Region = 'com';
      const pageSize = 80;
      const saleable = true;
      const data = await fetch(
        `https://${regionToRegionSubdomain(
          region,
        )}.wotblitz.com/en/api/events/items/auction/?page_size=${
          pageSize
        }&type[]=vehicle&saleable=${saleable}`,
      ).then((response) => response.json() as Promise<Auction>);
      const saleableTanks = data.results.filter((result) => result.available);

      if (saleableTanks.length === 0) {
        return strings.bot.commands.auction.errors.no_auction;
      }

      const nextPricesTimestamp = saleableTanks[0].next_price_timestamp;

      const title = `# ${strings.bot.commands.auction.body.title}`;
      const subtitle = `${literals(strings.bot.commands.auction.body.subtitle, [
        `${saleableTanks.length} / ${data.results.length}`,
        `<t:${nextPricesTimestamp}:R>`,
        '<https://wotblitz.com/auction/>',
      ])}`;
      const body = saleableTanks.map((data, index) => {
        const tank = awaitedTankDefinitions.tanks[data.entity!.id];

        if (!tank) return '';

        const name = `[${tank.name}](<https://blitzkit.app/tools/tankopedia/${
          tank.id
        }>)`;
        const next =
          data.next_price === null
            ? ''
            : `\n-# ${literals(strings.bot.commands.auction.body.next, [
                `<:gold:1317173197082333244> ${data.next_price.value.toLocaleString(
                  interaction.locale,
                )}`,
              ])}`;
        const available = literals(
          strings.bot.commands.auction.body.available,
          [
            data.current_count.toLocaleString(interaction.locale),
            data.initial_count.toLocaleString(interaction.locale),
          ],
        );
        const isOut = data.current_count === 0;
        const outString = isOut ? '~~' : '';
        const isLow = data.current_count <= WARNING_COUNT;

        return `${index + 1}. ${
          outString
        }${name} <:gold:1317173197082333244> ${data.price!.value.toLocaleString(
          interaction.locale,
        )}${outString}\n-#${isLow ? ' ‼️ ' : ' '}${available}${isOut ? '' : next}`;
      });
      const header = `${title}\n${subtitle}`;
      const lines = [header, ...body];

      return chunkLines(lines, '\n\n');
    },
  });
});
