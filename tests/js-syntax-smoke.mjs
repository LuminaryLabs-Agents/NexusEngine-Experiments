import { execFile } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { promisify } from "node:util";

const root = process.cwd();
const files = [];
const roots = ["experiments", "games", "tests"].filter((dir) => existsSync(join(root, dir)));
const execFileAsync = promisify(execFile);

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules", "dist", "build", "coverage"].includes(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (entry.endsWith(".js") || entry.endsWith(".mjs")) files.push(path);
  }
}

for (const dir of roots) walk(join(root, dir));
files.sort();
let nextFileIndex = 0;
const workerCount = Math.min(8, files.length);

async function syntaxWorker() {
  while (nextFileIndex < files.length) {
    const file = files[nextFileIndex];
    nextFileIndex += 1;
    try {
      await execFileAsync(process.execPath, ["--check", file]);
    } catch (error) {
      const details = error.stderr || error.stdout || error.message;
      throw new Error(`Syntax check failed for ${relative(root, file)}\n${details}`);
    }
  }
}

await Promise.all(Array.from({ length: workerCount }, () => syntaxWorker()));
console.log(`Syntax checked ${files.length} JS/MJS files.`);
