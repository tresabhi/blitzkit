import { times } from 'lodash';
import { IndividualTankStats } from '../../types/tanksStats';
import { AllStats } from '../blitz/getAccountInfo';
import { ReadStream, WriteStream } from './buffer';

export interface BlitzkitTankStats extends AllStats {
  id: number;
  battle_life_time: number;
  last_battle_time: number;
  mark_of_mastery: number;
}

export class RtsmReadStream extends ReadStream {
  rtsm() {
    this.magic();
    this.header();
    return this.body();
  }

  magic() {
    const magic = this.utf8(4);

    if (magic !== 'RTSM') {
      throw new Error(`Invalid RTSM magic number: "${magic}"`);
    }
  }

  header() {
    return {
      version: this.uint16(),
    };
  }

  body() {
    return {
      time: this.uint32(),
      base: this.uint8(),
    };
  }
}

export class RtsmWriteStream extends WriteStream {
  rtsm(base: number) {
    this.magic();
    this.header();
    this.body(base);

    return this;
  }

  magic() {
    this.utf8('RTSM');
  }

  header() {
    this.uint16(1);
  }

  body(base: number) {
    this.uint32(Math.round(Date.now() / 1000));
    this.uint8(base);
  }
}

export class RtscReadStream extends ReadStream {
  rtsc() {
    this.magic();
    const header = this.header();
    return this.body(header.playerCount);
  }

  magic() {
    const magic = this.utf8(4);

    if (magic !== 'RTSC') {
      throw new Error(`Invalid RTSC magic number: "${magic}"`);
    }
  }

  header() {
    return {
      version: this.uint16(),
      playerCount: this.uint32(),
    };
  }

  body(playerCount: number) {
    return times(playerCount, () => this.player());
  }

  player() {
    const id = this.uint32();
    const tankCount = this.uint16();
    const tanks = times(tankCount, () => this.tank());

    return {
      id,
      tankCount,
      tanks,
    };
  }

  tank() {
    return {
      id: this.uint32(),
      battle_life_time: this.uint32(),
      last_battle_time: this.uint32(),
      mark_of_mastery: this.uint8(),
      battles: this.uint32(),
      capture_points: this.uint32(),
      damage_dealt: this.uint32(),
      damage_received: this.uint32(),
      dropped_capture_points: this.uint32(),
      frags: this.uint32(),
      frags8p: this.uint32(),
      hits: this.uint32(),
      losses: this.uint32(),
      max_frags: this.uint8(),
      max_xp: this.uint16(),
      shots: this.uint32(),
      spotted: this.uint32(),
      survived_battles: this.uint32(),
      win_and_survived: this.uint32(),
      wins: this.uint32(),
      xp: this.uint32(),
    } satisfies BlitzkitTankStats;
  }
}

export interface RtscWritePlayer {
  id: number;
  tanks: IndividualTankStats[];
}

export class RtscWriteStream extends WriteStream {
  rtsc(players: RtscWritePlayer[]) {
    this.magic();
    this.header(players.length);
    this.body(players);

    return this;
  }

  magic() {
    this.utf8('RTSC');
  }

  header(playerCount: number) {
    this.uint16(1);
    this.uint32(playerCount);
  }

  body(players: RtscWritePlayer[]) {
    players.forEach((player) => {
      this.uint32(player.id);
      this.uint16(player.tanks.length);

      player.tanks.forEach((tank) => {
        this.uint32(tank.tank_id);
        this.uint32(tank.battle_life_time);
        this.uint32(tank.last_battle_time);
        this.uint8(tank.mark_of_mastery);
        this.uint32(tank.all.battles);
        this.uint32(tank.all.capture_points);
        this.uint32(tank.all.damage_dealt);
        this.uint32(tank.all.damage_received);
        this.uint32(tank.all.dropped_capture_points);
        this.uint32(tank.all.frags);
        this.uint32(tank.all.frags8p);
        this.uint32(tank.all.hits);
        this.uint32(tank.all.losses);
        this.uint8(tank.all.max_frags);
        this.uint16(tank.all.max_xp);
        this.uint32(tank.all.shots);
        this.uint32(tank.all.spotted);
        this.uint32(tank.all.survived_battles);
        this.uint32(tank.all.win_and_survived);
        this.uint32(tank.all.wins);
        this.uint32(tank.all.xp);
      });
    });
  }
}
