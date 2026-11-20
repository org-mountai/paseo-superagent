import type { PluginServerContext } from "@getpaseo/plugin/server";
import { readStatus } from "./server/status";
import { statusRpc } from "./shared/status";

export default function contribute(server: PluginServerContext) {
  server.handle(statusRpc, readStatus);
  return () => {};
}
