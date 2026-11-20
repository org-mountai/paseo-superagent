import type { PluginClientContext, PluginSidebarItemProps } from "@getpaseo/plugin/client";
import { SidebarRow } from "@getpaseo/plugin/client/ui";
import { StatusScreen } from "./client/status";

function SuperAgentItem({ currentScreen, openScreen }: PluginSidebarItemProps) {
  return (
    <SidebarRow
      icon="Activity"
      active={currentScreen?.screenId === "status"}
      onPress={() => openScreen({ screenId: "status" })}
    />
  );
}

export default function contribute(client: PluginClientContext) {
  client.addScreen({ id: "status", title: "Super Agent", Component: StatusScreen });
  client.addSidebarHeaderItem({ id: "superagent", title: "Super Agent", Component: SuperAgentItem });
  return () => {};
}
