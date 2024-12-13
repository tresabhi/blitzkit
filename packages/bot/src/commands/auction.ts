import {
  BlitzTankClass,
  Region,
  regionToRegionSubdomain,
} from '@blitzkit/core';
import { tankDefinitions } from '../core/blitzkit/nonBlockingPromises';
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
      initial_count?: number;
      current_count?: number;
      saleable?: boolean;
      available_from?: Date;
      available_before?: Date;
      price?: Price;
      next_price?: Price | null;
      available: true;
      display?: boolean;
      next_price_datetime?: Date | null;
      next_price_timestamp?: number | null;
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

export const auctionCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand('auction', [
      { subcommand: 'available' },
      { subcommand: 'setup' },
    ]),

    async handler(interaction) {
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
      const seeableTanks = data.results.filter((result) => result.available);
      const { t, translate } = translator(interaction.locale);

      const title = `# ${t`bot.commands.auction.subcommands.available.body.title`}`;
      const subtitle = `-# ${translate(
        'bot.commands.auction.subcommands.available.body.available',
        [`${seeableTanks.length} / ${data.results.length}`],
      )}`;
      const body = seeableTanks
        .map((data, index) => {
          const tank = awaitedTankDefinitions.tanks[data.entity!.id];

          if (!tank) return '';

          const name = `[${tank.name}](<https://blitzkit.app/tools/tankopedia/${
            tank.id
          }>)`;
          const next = translate(
            'bot.commands.auction.subcommands.available.body.next',
            [
              `<:gold:1317173197082333244> ${data.next_price!.value.toLocaleString(
                interaction.locale,
              )}`,
            ],
          );

          return `${
            index + 1
          }. ${name} <:gold:1317173197082333244> ${data.price!.value.toLocaleString(
            interaction.locale,
          )}\n-# ${next}`;
        })
        .join('\n\n');

      return `${title}\n${subtitle}\n\n${body}`;
    },
  });
});
