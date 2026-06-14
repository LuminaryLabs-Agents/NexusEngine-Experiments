export const makeGame = ({ kits = [] } = {}) => {
  const world = {
    resources: new Map(), events: [], nextEvents: [], clock: { elapsed: 0, delta: 0 }, apis: {},
    set(name, value) { this.resources.set(name, value); return value; },
    get(name) { return this.resources.get(name); },
    emit(type, payload = {}) { this.nextEvents.push({ type, ...payload }); },
    read(type) { return this.events.filter(e => e.type === type); },
    allEvents() { return this.events; }
  };
  const engine = {
    world,
    tick(dt) {
      world.clock.delta = dt;
      world.clock.elapsed += dt;
      world.events = world.nextEvents;
      world.nextEvents = [];
      for (const kit of kits) for (const system of kit.systems ?? []) system(world, engine);
    },
    getState() { return Object.fromEntries(world.resources); }
  };
  for (const kit of kits) kit.init?.(world, engine);
  for (const kit of kits) kit.install?.(engine, world);
  return engine;
};
