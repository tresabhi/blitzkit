import { fetchGameDefinitions, fetchTankDefinitions } from '@blitzkit/core';

export const tankDefinitions = fetchTankDefinitions();
export const gameDefinitions = fetchGameDefinitions();
