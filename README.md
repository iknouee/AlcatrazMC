# Alcatraz Skygen Discord Bot

Custom Discord bot for the Alcatraz Skygen Minecraft Bedrock Realm.

## Environment variables

- `DISCORD_TOKEN` — Discord bot token
- `CLIENT_ID` — Discord application/client ID
- `GUILD_ID` — your Discord server ID (used for fast slash-command deployment)
- `PORT` — Render normally supplies this automatically; optional locally
- `OWNER_ID` — optional for future owner-only features

## Discord Developer Portal intents
Enable:
- Server Members Intent
- Message Content Intent

## Local setup
```bash
npm install
npm run deploy
npm start
```

## Render Web Service
- Build command: `npm install && npm run deploy`
- Start command: `npm start`
- Runtime: Node

## First use
1. Invite the bot with `bot` + `applications.commands` scopes.
2. Give it Administrator while setting up (or equivalent channel/manage-role permissions).
3. Make your channels/categories.
4. Run `/setup`.
5. Run `/config realm-code`.
6. Run `/config staff-role`.
7. Optionally run `/config ticket-category`.

The bot automatically creates a private `🤖・bot-config` channel only visible to itself. Config is stored as JSON in a bot-owned message and updated whenever `/config` changes.
