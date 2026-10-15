import * as jobs from "../repositories/job.repository.js";
import * as service from "../services/job.service.js";
import * as schema from "../validators/schemas.js";
export async function list(req, res) {
  res.json(await jobs.list(schema.search.parse(req.query), req.user?.id));
}
export async function get(req, res) {
  res.json(await service.get(schema.id.parse(req.params.id), req.user?.id));
}
export async function owned(req, res) {
  res.json(
    await jobs.list(schema.search.parse(req.query), req.user.id, "owned"),
  );
}
export async function create(req, res) {
  res
    .status(201)
    .json(await jobs.create(schema.job.parse(req.body), req.user.id));
}
export async function update(req, res) {
  const id = schema.id.parse(req.params.id);
  await service.owned(id, req.user.id);
  res.json(await jobs.update(id, schema.job.parse(req.body)));
}
export async function close(req, res) {
  const id = schema.id.parse(req.params.id);
  await service.owned(id, req.user.id);
  res.json(await jobs.update(id, { status: "closed" }));
}
export async function stats(req, res) {
  res.json(await jobs.stats());
}
