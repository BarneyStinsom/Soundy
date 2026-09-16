import { db } from './db.js';

async function main() {
  const artist1 = await db.orm.public.Artist.create({
    name: 'Pink Floyd',
  });

  const artist2 = await db.orm.public.Artist.create({
    name: 'Elvis Presley',
  });

  const artist3 = await db.orm.public.Artist.create({
    name: 'The Beatles',
  });

  console.log(artist1);
  console.log(artist2);

  await db.close();
}

main();