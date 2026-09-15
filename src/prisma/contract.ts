import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {
  const User = model('User', {
    fields: {
      id: field.id.uuidv7String(),
      name: field.text().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });
  const Artist = model('Artist', {
    fields: {
      id: field.id.uuidv7String(),
      name: field.text(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });
  const Song = model('Song', {
    fields: {
      id: field.id.uuidv7String(),
      title: field.text(),
      duration: field.int(),
      artistId: field.uuidString(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });
  const Post = model('Post', {
    fields: {
      id: field.id.uuidv7String(),
      title: field.text(),
      content: field.text().optional(),
      artistId: field.uuidString(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    }});

  return {
  models: {
    Artist: Artist.relations({
      songs: rel.hasMany(Song, { by: 'artistId' }),
    }),

    Song: Song.relations({
      artist: rel.belongsTo(Artist, { from: 'artistId', to: 'id' }),
    }),
  },
}});