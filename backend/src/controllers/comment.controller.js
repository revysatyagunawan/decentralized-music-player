import * as commentService from '../services/comment.service.js';
import { ok } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    const { limit, offset } = req.query;
    const result = await commentService.listComments(
      req.params.id,
      req.user,
      { limit, offset },
    );
    ok(res, result.comments, { total: result.total, limit, offset });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const comment = await commentService.addComment(
      req.params.id,
      req.user,
      req.body.content,
    );
    res.status(201).json({ data: comment });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await commentService.deleteComment(req.params.id, req.user);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}
