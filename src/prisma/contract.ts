import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {
  const User = model('User', {
    fields: {
      id: field.id.uuidv7String(),
      name: field.text(),
      email: field.text(),
      password: field.text(),
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
  const Album = model('Album', {
    fields: {
      id: field.id.uuidv7String(),
      title: field.text(),
      type: field.text(),
      artistId: field.uuidString(),
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
      albumId: field.uuidString(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });
  const Playlist = model('Playlist', {  
    fields: {
      id: field.id.uuidv7String(),
      name: field.text(),
      userId: field.uuidString(),
      coverUrl: field.text().optional(),
      isPublic: field.boolean(),
      description: field.text().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });

  const PlaylistSong = model('PlaylistSong', {
    fields: {
      id: field.id.uuidv7String(),
      playlistId: field.uuidString(),
      songId: field.uuidString(),
      position: field.int(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });
  return {

   
  models: {
    Album: Album.relations({
      artist: rel.belongsTo(Artist, { from: 'artistId', to: 'id' }),
      songs: rel.hasMany(Song, { by: 'albumId' }),
    }),
    User: User.relations({
      playlists: rel.hasMany(Playlist, {by: 'userId'}),
    }),
     Artist: Artist.relations({
      songs: rel.hasMany(Song, { by: 'artistId' }),
      albums: rel.hasMany(Album, { by: 'artistId' }),
    }),
    PlaylistSong: PlaylistSong.relations({
      playlist: rel.belongsTo(Playlist, { from: 'playlistId', to: 'id' }),
      song: rel.belongsTo(Song, { from: 'songId', to: 'id' }),
    }),
    Playlist: Playlist.relations({
      user: rel.belongsTo(User, { from: 'userId', to: 'id'}),
      songs: rel.hasMany(PlaylistSong, { by: 'playlistId' }),
    }),   
    Song: Song.relations({
      artist: rel.belongsTo(Artist, { from: 'artistId', to: 'id' }),
      playlists: rel.hasMany(PlaylistSong, { by: 'songId' }),
      album: rel.belongsTo(Album, { from: 'albumId', to: 'id' }),
    }),
  },
}});