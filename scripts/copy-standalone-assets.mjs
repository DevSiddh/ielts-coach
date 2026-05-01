import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

async function copyIfExists(source, destination) {
  if (!existsSync(source)) return;
  await rm(destination, { force: true, recursive: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

if (existsSync(standaloneDir)) {
  await copyIfExists(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"));
  await copyIfExists(path.join(root, "public"), path.join(standaloneDir, "public"));
}
