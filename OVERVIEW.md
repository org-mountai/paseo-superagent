# Super Agent status

Shows the Companion Super Agent's open tickets, worker states, blockers, watchdog timer and First-Mate bridge in one Paseo screen. The screen refreshes every 15 seconds and can also be refreshed manually.

The plugin runs status commands on the daemon host. It does not start workers, answer permissions, or change host services. Open tickets from the `agentmail`, `imap`, `pm`, and `schedule` sources can be dropped after a second confirmation click. The server validates the source and open status again before writing the drop event to the ticket audit. GitHub and host tickets cannot be dropped through this action. Ticket titles, sources, runtime details and delivery URLs shown in the screen come from the local Super Agent state.

Paseo 0.16.1 or later is required. The daemon needs the Companion Super Agent checkout at `/home/companion/companion`; `SUPERAGENT_ROOT` can override that path and `SUPERAGENT_PYTHON` can override the Python binary. The systemd user timer `companion-superagent-watchdog.timer` supplies the watchdog state.
