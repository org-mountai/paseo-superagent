import type { PluginServerContext } from "@getpaseo/plugin/server";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { dropTicket, readStatus } from "./server/status";
import { dropTicketRpc, statusRpc } from "./shared/status";

const workerTitle = /^Kai Ticket #\d+:/;
const allowedChecks = new Set([
  "cargo test",
  "cargo check",
  "cargo fmt --check",
  "git status",
  "git diff",
  "npm run typecheck",
]);

function within(root: string, candidate: string) {
  const path = relative(resolve(root), resolve(candidate));
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

export default function contribute(server: PluginServerContext) {
  server.handle(statusRpc, readStatus);
  server.handle(dropTicketRpc, dropTicket);
  server.addHook("agent.permission.before", async ({ agent, request }, context) => {
    if (!workerTitle.test(agent.title ?? "")) return;
    const detail = request.detail;
    if (!detail) return;
    const allowedFile = (detail.type === "edit" || detail.type === "write")
      && within(agent.cwd, detail.filePath);
    const allowedCheck = detail.type === "shell"
      && allowedChecks.has(detail.command.trim())
      && within(agent.cwd, detail.cwd ?? agent.cwd);
    if (!allowedFile && !allowedCheck) return;
    await context.paseo.agents.ref(agent.id).respondToPermission({
      requestId: request.id,
      response: { behavior: "allow" },
    });
  });
  return () => {};
}
