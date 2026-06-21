import { startAaaBatchRoute } from "../../experiments/aaa-batch/host/batch-host.js";

export function startGeneratedApplicationRoute(slug = document.body?.dataset?.appId) {
  if (!slug) throw new Error("Missing generated application slug.");
  startAaaBatchRoute(slug);
}
