import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { useRpc } from "@getpaseo/plugin/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { statusRpc, type SuperAgentTicket } from "../shared/status";

function TicketCard({ ticket, styles }: { ticket: SuperAgentTicket; styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>#{ticket.id} · {ticket.title}</Text>
      <Text style={styles.muted}>{ticket.status} · {ticket.source}</Text>
      {ticket.runtime ? (
        <Text style={styles.text}>Worker {ticket.runtime}: {ticket.runtime_state ?? "unbekannt"}</Text>
      ) : null}
      {ticket.runtime_detail ? <Text style={styles.muted}>{ticket.runtime_detail}</Text> : null}
      {ticket.blockers.length > 0 ? (
        <Text style={styles.text}>Blocker: {ticket.blockers.map((blocker) => blocker.kind).join(", ")}</Text>
      ) : null}
      {ticket.delivery_url ? <Text style={styles.muted}>Ergebnis: {ticket.delivery_url}</Text> : null}
    </View>
  );
}

const createStyles = (theme: PluginScreenProps["theme"], compact: boolean) => ({
  screen: { flex: 1, backgroundColor: theme.colors.surface0 },
  content: { padding: compact ? 16 : 24, gap: 12 },
  title: { color: theme.colors.foreground, fontSize: compact ? 24 : 30, fontWeight: "600" as const },
  section: { color: theme.colors.foreground, fontSize: 18, fontWeight: "600" as const, marginTop: 8 },
  text: { color: theme.colors.foreground, fontSize: 15, lineHeight: 21 },
  muted: { color: theme.colors.foregroundMuted, fontSize: 13, lineHeight: 19 },
  card: {
    backgroundColor: theme.colors.surface1,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  cardTitle: { color: theme.colors.foreground, fontSize: 16, fontWeight: "600" as const, lineHeight: 22 },
  button: { backgroundColor: theme.colors.accent, borderRadius: 8, padding: 12, alignSelf: "flex-start" as const },
  buttonText: { color: theme.colors.accentForeground, fontSize: 14, fontWeight: "600" as const },
});

export function StatusScreen({ theme, layout }: PluginScreenProps) {
  const readStatus = useRpc(statusRpc);
  const query = useQuery({
    queryKey: ["superagent-status"],
    queryFn: () => readStatus({}),
    refetchInterval: 15_000,
  });
  const styles = useMemo(() => createStyles(theme, layout.compact), [theme, layout.compact]);
  const data = query.data;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Super Agent</Text>
      <Text style={styles.muted}>Read-only · aktualisiert alle 15 Sekunden</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Super-Agent-Status aktualisieren"
        style={styles.button}
        onPress={() => void query.refetch()}
      >
        <Text style={styles.buttonText}>Jetzt aktualisieren</Text>
      </Pressable>

      {query.isPending ? <Text style={styles.text}>Status wird gelesen …</Text> : null}
      {query.isError ? <Text style={styles.text}>Statusfehler: {query.error.message}</Text> : null}

      {data ? (
        <>
          <Text style={styles.section}>Betrieb</Text>
          <View style={styles.card}>
            <Text style={styles.text}>Watchdog: {data.watchdog.active} · {data.watchdog.enabled}</Text>
            <Text style={styles.text}>Brücke: {data.bridge.routing_error ?? "bereit"}</Text>
            <Text style={styles.muted}>
              {data.bridge.pending_events.length} ausstehende Ereignisse
              {data.bridge.last_error ? ` · letzter Fehler: ${data.bridge.last_error}` : ""}
            </Text>
          </View>

          <Text style={styles.section}>Offene Tickets und Worker</Text>
          {data.tickets.length === 0 ? (
            <View style={styles.card}><Text style={styles.text}>Keine offenen Tickets.</Text></View>
          ) : data.tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} styles={styles} />
          ))}
          <Text style={styles.muted}>Gelesen: {data.fetchedAt}</Text>
        </>
      ) : null}
    </ScrollView>
  );
}
