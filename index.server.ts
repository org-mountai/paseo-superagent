import type { PluginServerContext } from "@getpaseo/plugin/server";
import { dropTicket, readStatus } from "./server/status";
import { dropTicketRpc, statusRpc } from "./shared/status";

export default function contribute(server: PluginServerContext) {
  server.handle(statusRpc, readStatus);
  server.handle(dropTicketRpc, dropTicket);
  return () => {};
}
