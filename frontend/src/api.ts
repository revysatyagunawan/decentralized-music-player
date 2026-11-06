import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export interface User {
  id: string;
  webid: string;
  display_name: string;
  is_admin: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist_name: string;
  owner_webid: string;
  cover_url: string | null;
  duration_seconds: number | null;
  genre: string[] | null;
  stream_access: 'free' | 'login_required' | 'paid';
  stream_allowed: boolean;
  audio_url: string | null;
  created_at: string;
}
