import { SeniverseApi } from './seniverse.js';

export const seniverseApi = new SeniverseApi(
  process.env.SENIVERSE_PUBLIC_KEY || '',
  process.env.SENIVERSE_SECRET_KEY || '',
);