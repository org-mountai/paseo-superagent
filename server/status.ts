import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { SuperAgentStatus } from "../shared/status";

const execFileAsync = promisify(execFile);
const root = process.env.SUPERAGENT_ROOT ?? "/home/companion/companion";
const python = process.env.SUPERAGENT_PYTHON ?? "/usr/bin/python3";

async function run(command: string, args: string[], allowFailure = false): Promise<string> {
  try {
    const { stdout } = await execFileAsync(command, args, {
      encoding: "utf8",
      timeout: 10_000,
      maxBuffer: 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    if (allowFailure && typeof error === "object" && error !== null && "stdout" in error) {
      return String(error.stdout);
    }
    throw error;
  }
}

async function runJson<T>(script: string): Promise<T> {
  const stdout = await run(python, [`${root}/superagent/${script}`, "status", "--json"]);
  return JSON.parse(stdout) as T;
}

export async function readStatus(): Promise<SuperAgentStatus> {
  const [tickets, bridge, active, enabled] = await Promise.all([
    runJson<SuperAgentStatus["tickets"]>("dispatcher.py"),
    runJson<SuperAgentStatus["bridge"]>("paseo_bridge.py"),
    run("/usr/bin/systemctl", ["--user", "is-active", "companion-superagent-watchdog.timer"], true),
    run("/usr/bin/systemctl", ["--user", "is-enabled", "companion-superagent-watchdog.timer"], true),
  ]);
  return {
    tickets,
    bridge,
    watchdog: { active: active.trim(), enabled: enabled.trim() },
    fetchedAt: new Date().toISOString(),
  };
}
