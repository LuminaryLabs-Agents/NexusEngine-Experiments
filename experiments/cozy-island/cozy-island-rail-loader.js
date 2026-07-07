if (!Object.prototype.hasOwnProperty.call(Object.prototype, "rotation")) {
  Object.defineProperty(Object.prototype, "rotation", {
    configurable: true,
    enumerable: false,
    get() {
      return { x: 0, y: 0, z: 0 };
    }
  });
}

await import("./cozy-island-rail.js?v=scroll-rail-2");
