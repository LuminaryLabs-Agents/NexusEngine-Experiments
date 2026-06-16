export function createClimbActionAdapter(input = {}) {
  return {
    restart: Boolean(input.restart),
    advanceSector: Boolean(input.advanceSector),
    pause: input.pause ?? undefined,
    action: Boolean(input.action),
    axis: Number(input.axis ?? 0),
    aimWorld: input.aimWorld ?? null,
    aimVector: input.aimVector ?? null,
    userGesture: Boolean(input.userGesture)
  };
}
