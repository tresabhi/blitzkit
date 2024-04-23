import sharp from 'sharp';
import { TankClass } from '../../src/components/Tanks';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readXMLDVPL } from '../../src/core/blitz/readXMLDVPL';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import { FileChange } from '../../src/core/blitzkit/commitMultipleFiles';
import { DATA } from './constants';

interface SkillIcon {
  name: string;
  state: number;
}

export interface Avatar {
  roles: unknown;
  skillsByClasses: Record<TankClass, string>;
  skills: {
    [name: string]: {
      userString: string;
      effectDescription: string;
      tipDescription: string;
      icon: SkillIcon | SkillIcon[];
      type: 'continuous' | 'trigger';
    };
  };
}

export async function skillIcons(production: boolean) {
  console.log('Building skill icons...');

  const avatar = await readXMLDVPL<{ root: Avatar }>(
    `${DATA}/XML/item_defs/tankmen/avatar.xml.dvpl`,
  );
  const changes = await Promise.all(
    Object.values(avatar.root.skills).map(async (skill) => {
      const icon = Array.isArray(skill.icon) ? skill.icon[0] : skill.icon;
      const name = icon.name.split('/').at(-1)!.replace(/_\d$/, '');
      const path = `${DATA}${icon.name.replace('~res:', '')}.packed.webp.dvpl`;
      const image = sharp(await readDVPLFile(path)).trim();
      const content = (await image.toBuffer()).toString('base64');

      return {
        content,
        encoding: 'base64',
        path: `icons/skills/${name}.webp`,
      } satisfies FileChange;
    }),
  );

  commitAssets('skill icons', changes, production);
}
