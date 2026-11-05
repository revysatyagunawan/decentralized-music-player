export function ok(res, data, meta) {
  res.json({ data, ...(meta && { meta }) });
}

export function created(res, data) {
  res.status(201).json({ data });
}

export function noContent(res) {
  res.status(204).end();
}
