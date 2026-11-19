import * as artistService from '../services/artist.service.js';
import { ok } from '../utils/response.js';

function decodeWebid(raw) {
  return decodeURIComponent(raw);
}

export async function getProfile(req, res, next) {
  try {
    const profile = await artistService.getArtistProfile(
      decodeWebid(req.params.webid),
      req.user,
    );
    ok(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function getTracks(req, res, next) {
  try {
    const { limit, offset } = req.query;
    const { tracks, total } = await artistService.getArtistTracks(
      decodeWebid(req.params.webid),
      { limit, offset },
    );
    ok(res, tracks, { total, limit, offset });
  } catch (err) {
    next(err);
  }
}

export async function follow(req, res, next) {
  try {
    const result = await artistService.followArtist(
      req.user,
      decodeWebid(req.params.webid),
    );
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function unfollow(req, res, next) {
  try {
    const result = await artistService.unfollowArtist(
      req.user,
      decodeWebid(req.params.webid),
    );
    ok(res, result);
  } catch (err) {
    next(err);
  }
}
