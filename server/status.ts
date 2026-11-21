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

const channelSources = new Set(["agentmail", "imap", "pm", "schedule", "webhook"]);

export async function dropTicket({ id, confirm }: { id: number; confirm: "DROP" }) {
  if (confirm !== "DROP") throw new Error("Bestätigung fehlt");
  const tickets = await runJson<SuperAgentStatus["tickets"]>("dispatcher.py");
  const ticket = tickets.find((candidate) => candidate.id === id);
  if (!ticket) throw new Error(`Ticket #${id} ist nicht offen`);
  if (!channelSources.has(ticket.source)) {
    throw new Error("Nur R0-Kanal-Tickets dürfen über Paseo verworfen werden");
  }
  if (ticket.status !== "open") throw new Error(`Ticket #${id} ist ${ticket.status}`);
  await run(python, [`${root}/superagent/tickets.py`, "drop", String(id), "--reason", "Über Paseo bestätigt"]);
  return { id, status: "dropped" as const };
}

async function withActivity(ticket: SuperAgentStatus["tickets"][number]) {
  if (!ticket.runtime || !["starting", "running", "blocked"].includes(ticket.runtime_state ?? "")) {
    return { ...ticket, activity: null };
  }
  try {
    const activity = await run(python, [
      `${root}/superagent/dispatcher.py`, "logs", String(ticket.id), "--tail", "3",
    ]);
    return { ...ticket, activity: activity.trim().slice(-2000) || null };
  } catch {
    return { ...ticket, activity: null };
  }
}

export async function readStatus(): Promise<SuperAgentStatus> {
  const [tickets, bridge, active, enabled] = await Promise.all([
    runJson<SuperAgentStatus["tickets"]>("dispatcher.py"),
    runJson<SuperAgentStatus["bridge"]>("paseo_bridge.py"),
    run("/usr/bin/systemctl", ["--user", "is-active", "companion-superagent-watchdog.timer"], true),
    run("/usr/bin/systemctl", ["--user", "is-enabled", "companion-superagent-watchdog.timer"], true),
  ]);
  return {
    tickets: await Promise.all(tickets.map(withActivity)),
    bridge,
    watchdog: { active: active.trim(), enabled: enabled.trim() },
    fetchedAt: new Date().toISOString(),
  };
}
