import * as tracksService from '../services/tracks.service.js';
import { ok } from '../utils/response.js';

export async function listTracks(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    const sort = req.query.sort || 'created_at:desc';

    const { tracks, total } = await tracksService.listTracks({ limit, offset, sort });

    ok(res, tracks, { total, limit, offset });
  } catch (err) {
    next(err);
  }
}

export async function getTrackById(req, res, next) {
  try {
    const track = await tracksService.getTrackById(req.params.id, req.user);
    ok(res, track);
  } catch (err) {
    next(err);
  }
}

export async function syncTrack(req, res, next) {
  try {
    const { pod_resource_url } = req.body;
    const track = await tracksService.syncFromPod(pod_resource_url, req.user);
    res.status(200).json({ data: track });
  } catch (err) {
    next(err);
  }
}
