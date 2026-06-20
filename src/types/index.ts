export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration_seconds: number;
  cover_url: string | null;
  audio_url: string;
  owner_id: string;
  created_at: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  owner_id: string;
  is_public: boolean;
  created_at: string;
};

export type PlaylistTrack = {
  playlist_id: string;
  track_id: string;
  position: number;
};

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_anonymous: boolean;
  created_at: string;
};

export type ListeningHistory = {
  id: string;
  user_id: string;
  track_id: string;
  listened_at: string;
};

export type DownloadedTrack = {
  track_id: string;
  local_file_path: string;
  downloaded_at: string;
};
