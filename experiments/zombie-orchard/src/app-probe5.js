import { createZombieOrchardSession } from "./session.js";
const game = createZombieOrchardSession();
console.log(game.snapshot());
