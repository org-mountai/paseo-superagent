# Super Agent status

Shows the Companion Super Agent's active tickets, persistent Paseo workers, recent activity, blockers, watchdog timer and First-Mate bridge in one Paseo screen. Results from the last 24 hours remain visible. The screen refreshes every 15 seconds and can also be refreshed manually.

The plugin runs status and log commands on the daemon host. Open tickets from the `agentmail`, `imap`, `pm`, and `schedule` sources can be dropped after a second confirmation click. The server validates the source and open status again before writing the drop event to the ticket audit. GitHub and host tickets cannot be dropped through this action.

For agents whose fixed Super-Agent title identifies them as ticket workers, the plugin automatically allows edits and writes only inside that worker's working directory. It also allows the exact local checks `cargo test`, `cargo check`, `cargo fmt --check`, `git status`, `git diff`, and `npm run typecheck` when run inside that directory. Other permission requests, agents, paths and shell commands still require their normal approval flow.

Paseo 0.16.1 or later is required. The daemon needs the Companion Super Agent checkout at `/home/companion/companion`; `SUPERAGENT_ROOT` can override that path and `SUPERAGENT_PYTHON` can override the Python binary. The systemd user timer `companion-superagent-watchdog.timer` supplies the watchdog state.
