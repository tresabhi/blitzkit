import AdmZip from 'adm-zip';
import { readFile } from 'fs/promises';
import { BattleResultsReadStream } from '../src/core/streams/battleResults';

interface WoTBReplayMeta {
  version: string;
  title: string;
  dbid: string;
  playerName: string;
  battleStartTime: string;
  playerVehicleName: string;
  mapName: string;
  arenaUniqueId: string;
  battleDuration: number;
  vehicleCompDescriptor: number;
  camouflageId: number;
  mapId: number;
  arenaBonusType: number;
}

const file = await readFile('temp/test.wotbreplay');
const zip = new AdmZip(file);
const entries = zip.getEntries();

const metaRaw = entries.find((entry) => entry.name === 'meta.json');
const battleResultsRaw = entries.find(
  (entry) => entry.name === 'battle_results.dat',
);

if (!metaRaw) throw new Error('No meta.json found');
if (!battleResultsRaw) throw new Error('No battle_results.dat found');

const meta = JSON.parse(metaRaw.getData().toString()) as WoTBReplayMeta;
const battleResults = new BattleResultsReadStream(
  battleResultsRaw.getData().buffer,
).battleResults();
