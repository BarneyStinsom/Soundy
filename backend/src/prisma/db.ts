import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import { contract } from './contract.js';
import contractJson from './contract.json' with { type: 'json' };

export const db = postgres<typeof contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
