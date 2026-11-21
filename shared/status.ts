import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

const ticketSchema = z.object({
  id: z.number(),
  key: z.string(),
  title: z.string(),
  source: z.string(),
  status: z.string(),
  runtime: z.string().nullable(),
  runtime_state: z.string().nullable(),
  runtime_detail: z.string().nullable(),
  activity: z.string().nullable().optional(),
  note: z.string().nullable(),
  state_changed_at: z.string().nullable(),
  updated_at: z.string(),
  url: z.string().nullable(),
  delivery_url: z.string().nullable(),
  blockers: z.array(z.object({ kind: z.string() }).passthrough()),
}).passthrough();

const bridgeSchema = z.object({
  agent_label: z.string(),
  routing_error: z.string().nullable(),
  pending_events: z.array(z.number()),
  last_sent_at: z.string().nullable(),
  last_error: z.string().nullable(),
}).passthrough();

const outputSchema = z.object({
  tickets: z.array(ticketSchema),
  bridge: bridgeSchema,
  watchdog: z.object({ active: z.string(), enabled: z.string() }),
  fetchedAt: z.string(),
});

export const statusRpc = defineRpc({
  name: "superagent.status",
  input: z.object({}),
  output: outputSchema,
});

export const dropTicketRpc = defineRpc({
  name: "superagent.tickets.drop",
  input: z.object({ id: z.number().int().positive(), confirm: z.literal("DROP") }),
  output: z.object({ id: z.number(), status: z.literal("dropped") }),
});

export type SuperAgentStatus = z.output<typeof outputSchema>;
export type SuperAgentTicket = z.output<typeof ticketSchema>;
