# ⛓️ Alcatraz Skygen — Discord + Slot-Free Bedrock Realm Bot

One bot for the Alcatraz Skygen Discord and Minecraft Bedrock Realm.

## Important change in v4

The Realm bridge **does not join the Minecraft world anymore**. It uses the Bedrock **Realms API** to read Realm information, so it does **not consume a Realm player slot**.

It still needs a one-time Microsoft device-code sign-in because Microsoft protects Realm information behind Xbox/Minecraft authentication. That login is API-only; the account never spawns into the Realm.

## Included

- Private `🤖・bot-config` Discord channel used as the bot config store
- `/setup` branded channel panels
- Clean single rules embed
- Ticket dropdown: Support, Player Report, Bug Report, Ban Appeal, Partnership
- Private ticket channels with Claim, Transcript and Close controls
- Realm code button with ephemeral response
- `/config`, `/sendpanel`, `/announce`
- Slot-free Bedrock Realms API integration
- Live `📊・realm-status` embed
- Online player count/list when supplied by the Realms API
- `/status`, `/players`, `/reconnect`
- Express `/` and `/health` endpoints for Render Web Service hosting

## Render

**Runtime:** Node

**Build Command**
```bash
npm install && npm run deploy
```

**Start Command**
```bash
npm start
```

### Required Discord envs

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_discord_application_id
GUILD_ID=your_discord_server_id
OWNER_ID=your_discord_user_id
```

### Bedrock Realm API envs

```env
REALM_INVITE=your_realm_invite_code_or_link
MAX_PLAYERS=10
STATUS_UPDATE_SECONDS=60
AUTH_DIR=.auth
```

You can use `REALM_ID` instead of `REALM_INVITE`.

Optional:

```env
REALM_AUTH_ID=alcatraz-realm-api
```

`REALM_AUTH_ID` is only a local cache identifier. It is **not** your Microsoft email.

## First Microsoft login

On the first Realm API request, Render logs will show a Microsoft device-code message. Open the verification page shown in the log, enter the code, and sign into a Microsoft/Xbox account that can access the Realm.

**The account does not join the Realm and does not take a player slot.**

Do not put a Microsoft password in Render.

### Render persistent disk

Render's normal filesystem is ephemeral. To keep the Microsoft token cache across rebuilds, attach a persistent disk and set:

```env
AUTH_DIR=/var/data/alcatraz-auth
```

Without a persistent disk, a fresh rebuild can require another device-code login.

## Discord setup

Create the channels/categories, invite the bot, deploy it, then run:

```text
/setup
```

The bot creates its private config channel automatically. `/setup` sends the branded panels and assigns `📊・realm-status` as the live status channel if it exists.

Then configure:

```text
/config realm-code
/config staff-role
/config ticket-category
/config status-channel
```

## Discord permissions

Give the bot:

- View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Manage Channels
- Manage Messages

## Developer Portal intents

Enable:

- Server Members Intent
- Message Content Intent

## Security

Never commit or upload:

- `.env`
- `.auth/`
- Discord bot tokens
- Microsoft/Xbox authentication cache files
