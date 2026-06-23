# Ticket

A simple Discord bot for support tickets with private channels and button controls.

## How it Works

- **Startup**: posts a fresh ticket panel in `TICKET_PANEL_CHANNEL_ID`, replacing the old one.
- **Opening**: picking a type opens a private channel under `TICKET_CATEGORY_ID`.
- **Closing**: Close locks the channel and shows Reopen, Transcript, and Delete.
- **Transcript**: staff send a `.txt` log to `TICKET_TRANSCRIPT_CHANNEL_ID` and archive the ticket.
- **Reopening**: staff unlock a closed ticket.
- **Deletion**: staff remove the ticket channel.
- **Auto-close**: inactive tickets close after `TICKET_SETTINGS.autoCloseHours`.
- **Auto-delete**: closed or archived tickets idle past `TICKET_SETTINGS.autoDeleteHours` are removed, saving a transcript first if one was not sent yet.

## Permissions

Invite with the `bot` scope only (no slash commands). Grant **Manage Channels**, **Manage Roles**, **View Channel**, **Send Messages**, **Embed Links**, **Attach Files**, **Read Message History**, and **Manage Messages**.

Use this invite link directly, replacing `<client-id>` with your application's client ID:

```
https://discord.com/api/oauth2/authorize?client_id=<client-id>&permissions=268561424&scope=bot
```

## Setup

Requires Node.js 22 or newer.

```bash
npm install
cp .env.example .env
```

Edit `.env` with your bot credentials:

```env
DISCORD_TOKEN=...
TICKET_CATEGORY_ID=...
TICKET_PANEL_CHANNEL_ID=...
TICKET_TRANSCRIPT_CHANNEL_ID=...
TICKET_STAFF_ROLE_IDS=...
```

Edit `src/config/ticketConfig.ts` to tweak:

- `autoCloseHours` - inactivity period before auto-close
- `autoCloseCheckIntervalMinutes` - how often to check for inactive tickets
- `shouldAutoDelete` - enable auto-deletion of closed and archived tickets
- `autoDeleteHours` - inactivity period before a closed or archived ticket is deleted
- `maxOpenPerUser` - max open tickets per member
- `shouldDmOnClose` - DM the opener when their ticket is closed
- `dmOnCloseMessage` - the close DM text
- `deleteDelaySeconds` - delay before the channel is deleted
- `TICKET_TYPES` - dropdown types (`id`, `label`, `description`, `welcomeMessage`)

The panel embed thumbnail is `img/ticket.png`.

Start the bot:

```bash
npm start
```

## File Structure

```
ticket/
├── .env.example
├── img/
│   └── ticket.png     # Panel embed thumbnail
└── src/
    ├── core/          # Discord client setup and login
    ├── events/        # Discord event listeners
    ├── interactions/  # Button and select menu handlers
    ├── handlers/      # Interaction routing, error handling
    ├── services/      # Ticket lifecycle, transcripts, auto-close
    ├── embeds/        # Embed and component builders
    ├── utils/         # Logger, channel fetch, permission
    ├── types/         # Shared type definitions
    ├── constants/     # Colors and customId strings
    ├── config/        # Env vars and ticket settings
    └── index.ts       # Entry point (process lifecycle)
```
