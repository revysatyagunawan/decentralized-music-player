import * as tracksService from '../services/tracks.service.js';
import { ok, created } from '../utils/response.js';

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

export async function syncTrack(req, res, next) {
  try {
    const { pod_resource_url } = req.body;
    const track = await tracksService.syncFromPod(pod_resource_url, req.user);
    created(res, track);
  } catch (err) {
    next(err);
  }
}
