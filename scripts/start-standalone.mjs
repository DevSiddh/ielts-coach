import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const portIndex = args.findIndex((arg) => arg === "-p" || arg === "--port");
const port = portIndex >= 0 ? args[portIndex + 1] : process.env.PORT;
const standaloneServer = path.join(process.cwd(), ".next", "standalone", "server.js");
const commandArgs = existsSync(standaloneServer)
  ? [standaloneServer]
  : [path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next"), "start", ...(port ? ["-p", port] : [])];

const child = spawn(process.execPath, commandArgs, {
  env: {
    ...process.env,
    ...(port ? { PORT: port } : {})
  },
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
