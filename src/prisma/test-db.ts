import { db } from './db.js';

async function main() {
  const artists = await db.orm.public.Artist
  .orderBy((a) => a.name.desc())
  .all();

console.log(artists);

  await db.close();
}

main();