function chunksFor(summitY, h = 600) {
  const total = Math.ceil((summitY + 500) / h) + 1;
  return Array.from({ length: total }, (_, i) => {
    const y = i * h - 300;
    return {
      id: `chunk-${i}`,
      y,
      h,
      scaffold: {
        leftX: -170,
        rightX: 170,
        braces: [
          { x: 0, y: y + h * 0.22, rotation: 0.25 },
          { x: 0, y: y + h * 0.75, rotation: -0.25 }
        ],
        cables: [-110, 0, 110].map((x, cableIndex) => ({ id: `cable-${i}-${cableIndex}`, x, phase: i * 0.37 + cableIndex }))
      }
    };
  });
}

export function adaptProjectedRouteToClimbRoute(projectedRoute, climb = {}) {
  const anchors = projectedRoute?.anchors ?? [];
  const summitY = Number(climb.summitY ?? anchors.at(-1)?.position?.y ?? 2200);
  const ledges = anchors.map((anchor, index) => {
    const isStart = anchor.tags?.includes(climb.startTag ?? "start") || index === 0;
    const isSummit = anchor.tags?.includes(climb.endTag ?? "end") || index === anchors.length - 1;
    const isRest = !isStart && !isSummit && anchor.tags?.includes(climb.restTag ?? "rest");
    const type = isSummit ? "summit" : isRest ? "rest" : "normal";
    return {
      id: isStart ? "anchor-0" : isSummit ? "summit" : anchor.id,
      sourceAnchorId: anchor.id,
      index,
      x: Number(anchor.position?.x ?? 0),
      y: Number(anchor.position?.y ?? 0),
      z: Number(anchor.position?.z ?? 0),
      r: isStart ? Number(climb.startRadius ?? 9) : isSummit ? Number(climb.summitRadius ?? 14) : isRest ? Number(climb.restRadius ?? 7) : Number(climb.normalRadius ?? anchor.radius ?? 5),
      type,
      label: isStart ? "Base anchor" : isSummit ? "Summit anchor" : isRest ? `Restore node ${index}` : `Anchor node ${index}`,
      staminaRestore: isRest ? Number(climb.staminaRestore ?? 45) : 0,
      tags: anchor.tags ?? [],
      metadata: anchor.metadata ?? {}
    };
  });
  const crest = climb.masteryCrest;
  const crestBeats = Array.isArray(crest?.beats) ? crest.beats : [];
  const lastIndex = ledges.length - 1;
  for (const [order, beat] of crestBeats.entries()) {
    const index = Math.max(0, lastIndex - Math.max(0, Math.floor(Number(beat.fromSummit ?? 0))));
    const source = ledges[index];
    if (!source) continue;
    const type = beat.type ?? source.type;
    ledges[index] = {
      ...source,
      id: beat.id ?? source.id,
      x: Number(beat.x ?? source.x),
      y: summitY + Number(beat.yOffset ?? source.y - summitY),
      r: Number(beat.radius ?? source.r),
      type,
      label: beat.label ?? source.label,
      staminaRestore: type === "rest" ? Number(beat.staminaRestore ?? source.staminaRestore ?? climb.staminaRestore ?? 45) : 0,
      tags: [...new Set([...(source.tags ?? []), ...(beat.tags ?? []), type])],
      metadata: {
        ...(source.metadata ?? {}),
        masteryCrestId: crest.id ?? "summit-mastery-crest",
        masteryRole: beat.role ?? `crest-beat-${order}`,
        masteryOrder: order,
        authoredRouteBeat: true
      }
    };
  }
  return {
    id: climb.routeId ?? projectedRoute?.id ?? "next-ledge-route",
    seed: projectedRoute?.seed,
    sector: Number(climb.sector ?? 1),
    summitY,
    ledges,
    chunks: chunksFor(summitY),
    route: ledges.map((ledge) => ledge.id),
    masteryCrest: crestBeats.length ? {
      id: crest.id ?? "summit-mastery-crest",
      beatIds: crestBeats.map((beat) => beat.id).filter(Boolean),
      startIndex: Math.max(0, ledges.length - crestBeats.length),
      summitId: ledges.at(-1)?.id ?? "summit"
    } : null,
    sourceRoute: projectedRoute
  };
}
