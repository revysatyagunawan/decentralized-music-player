import * as likeService from '../services/like.service.js';
import { ok } from '../utils/response.js';

export async function like(req, res, next) {
  try {
    const result = await likeService.likeTrack(req.user, req.params.id);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function unlike(req, res, next) {
  try {
    const result = await likeService.unlikeTrack(req.user, req.params.id);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}
