import * as tracksService from '../services/tracks.service.js';
import { ok } from '../utils/response.js';

export async function listTracks(req, res, next) {
  try {
    const { limit, offset, sort } = req.query;
    const { tracks, total } = await tracksService.listTracks({ limit, offset, sort });
    ok(res, tracks, { total, limit, offset });
  } catch (err) {
    next(err);
  }
}

export async function getTrackById(req, res, next) {
  try {
    const track = await tracksService.getTrackById(req.params.id);
    ok(res, track);
  } catch (err) {
    next(err);
  }
}

export async function searchTracks(req, res, next) {
  try {
    const { q, limit, offset } = req.query;
    const tracks = await tracksService.searchTracks({ q, limit, offset });
    ok(res, tracks, { query: q, count: tracks.length });
  } catch (err) {
    next(err);
  }
}

export async function syncTrack(req, res, next) {
  try {
    const { pod_resource_url } = req.body;
    const track = await tracksService.syncFromPod(pod_resource_url, req.user);
    res.status(201).json({ data: track });
  } catch (err) {
    next(err);
  }
}
