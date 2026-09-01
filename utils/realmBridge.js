'use strict';

const fs = require('fs');
const path = require('path');
const { Authflow, Titles } = require('prismarine-auth');
const { RealmAPI } = require('prismarine-realms');
const { ActivityType, EmbedBuilder } = require('discord.js');
const { loadConfig, saveConfig } = require('./configStore');
const { BRAND } = require('./constants');

let discord = null;
let api = null;
let authflow = null;
let realm = null;
const gamertagCache = new Map(); // xuid -> gamertag
let authenticated = false;
let refreshing = false;
let lastError = null;
let lastUpdate = null;
let updateTimer = null;
let onlinePlayers = [];

const bridgeCfg = {
  realmId: process.env.REALM_ID || undefined,
  realmInvite: process.env.REALM_INVITE || undefined,
  authId: process.env.REALM_AUTH_ID || 'alcatraz-realm-api',
  maxPlayers: Number(process.env.MAX_PLAYERS || 10),
  interval: Math.max(30, Number(process.env.STATUS_UPDATE_SECONDS || 60)) * 1000,
  authDir: process.env.AUTH_DIR || path.join(process.cwd(), '.auth'),
};

function isConfigured() {
  return Boolean(bridgeCfg.realmId || bridgeCfg.realmInvite);
}

function normalizeInvite(value) {
  if (!value) return null;

  const text = String(value).trim();

  const match = text.match(
    /realms\.gg\/(?:invite\/)?([A-Za-z0-9_-]+)/i,
  );

  return match ? match[1] : text;
}

function deviceCodePrinter(data) {
  console.log('\n=== MICROSOFT REALMS API LOGIN REQUIRED ===');
  console.log(
    data?.message ||
      'Open the Microsoft verification page and enter the displayed code.',
  );

  if (data?.user_code) {
    console.log(`Code: ${data.user_code}`);
  }

  if (data?.verification_uri) {
    console.log(`URL: ${data.verification_uri}`);
  }

  console.log(
    'This login only authenticates the Realms API. It does NOT join the Realm or use a player slot.',
  );

  console.log(`Auth cache: ${bridgeCfg.authDir}`);
  console.log('===========================================\n');
}

function realmIsOpen(r) {
  const state = String(r?.state || '').toUpperCase();

  return state === 'OPEN' || state === 'ONLINE';
}

async function createApi() {
  fs.mkdirSync(bridgeCfg.authDir, {
    recursive: true,
  });

  authflow = new Authflow(
    bridgeCfg.authId,
    bridgeCfg.authDir,
    {
      flow: 'live',
      authTitle: Titles.MinecraftNintendoSwitch,
      deviceType: 'Nintendo',
    },
    deviceCodePrinter,
  );

  return RealmAPI.from(authflow, 'bedrock');
}

// Resolve Xbox XUIDs to gamertags via the Xbox Live profile API.
// The live-players endpoint returns XUIDs with name=null, so we look the
// gamertags up ourselves using the same authenticated Xbox session.
// Results are cached because gamertags rarely change.
async function resolveGamertags(xuids) {
  const result = new Map();
  const missing = [];

  for (const xuid of xuids) {
    const id = String(xuid);
    if (gamertagCache.has(id)) {
      result.set(id, gamertagCache.get(id));
    } else {
      missing.push(id);
    }
  }

  if (!missing.length || !authflow) {
    return result;
  }

  try {
    const { userHash, XSTSToken } = await authflow.getXboxToken(
      'http://xboxlive.com',
    );

    const response = await fetch(
      'https://profile.xboxlive.com/users/batch/profile/settings',
      {
        method: 'POST',
        headers: {
          Authorization: `XBL3.0 x=${userHash};${XSTSToken}`,
          'x-xbl-contract-version': '3',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          userIds: missing,
          settings: ['Gamertag'],
        }),
      },
    );

    if (!response.ok) {
      console.warn(
        'Xbox profile lookup failed:',
        response.status,
        response.statusText,
      );
      return result;
    }

    const data = await response.json();
    const users = Array.isArray(data?.profileUsers)
      ? data.profileUsers
      : [];

    for (const user of users) {
      const id = String(user?.id ?? '');
      const setting = (user?.settings || []).find(
        (s) => s?.id === 'Gamertag',
      );
      const tag = setting?.value;
      if (id && tag) {
        gamertagCache.set(id, tag);
        result.set(id, tag);
      }
    }
  } catch (error) {
    console.warn(
      'Xbox profile lookup error:',
      error?.message || error,
    );
  }

  return result;
}

async function fetchRealm() {
  if (!api) {
    api = await createApi();
  }

  if (bridgeCfg.realmId) {
    return api.getRealm(String(bridgeCfg.realmId));
  }

  const invite = normalizeInvite(bridgeCfg.realmInvite);

  if (!invite) {
    throw new Error(
      'REALM_ID or REALM_INVITE is required.',
    );
  }

  return api.getRealmFromInvite(invite, false);
}

// Direct call to the Bedrock live-players endpoint using the authenticated
// REST client that prismarine-realms already sets up. This works regardless
// of whether the installed library version exposes getLivePlayerLists(),
// and is used as a fallback because realm.players[].online is often not
// populated for Bedrock realms fetched via invite.
async function fetchLivePlayers(realmObj) {
  if (!api?.rest || typeof api.rest.get !== 'function' || !realmObj?.id) {
    return [];
  }

  let data;

  try {
    data = await api.rest.get('/activities/live/players');
  } catch (error) {
    console.warn(
      'Live players endpoint unavailable:',
      error?.message || error,
    );
    return [];
  }

  // Response shape:
  // { servers: [{ id, full, players: [{ uuid(=XUID), name(null), online }] }] }
  const servers = Array.isArray(data?.servers) ? data.servers : [];

  if (!servers.length) {
    return [];
  }

  // The endpoint returns EVERY server this account can see (including other
  // people's realms we've joined). The server id here is not the world id,
  // so match against every identifier the realm object carries. If nothing
  // matches, return nobody — never guess, or we'd show a stranger's players.
  const candidateIds = new Set(
    [
      realmObj.id,
      realmObj.clubId,
      realmObj.remoteSubscriptionId,
    ]
      .filter((v) => v != null)
      .map(String),
  );

  const match = servers.find((server) =>
    candidateIds.has(String(server?.id ?? '')),
  );

  if (!match) {
    console.warn(
      'Live players: no server matched this realm.',
      'realm ids=',
      [...candidateIds].join(','),
      'live server ids=',
      servers.map((s) => s?.id).join(','),
    );
    return [];
  }

  const players = Array.isArray(match?.players) ? match.players : [];

  // Only players actually online right now.
  const onlineXuids = players
    .filter((player) => player?.online)
    .map((player) => player?.uuid || player?.playerId || player?.xuid)
    .filter(Boolean)
    .map(String);

  if (!onlineXuids.length) {
    return [];
  }

  // The endpoint gives XUIDs with name=null, so resolve gamertags.
  const tags = await resolveGamertags(onlineXuids);

  const names = onlineXuids.map((xuid) => {
    const tag = tags.get(String(xuid));
    // Fallback label if a gamertag can't be resolved.
    return tag || `Player-${String(xuid).slice(-4)}`;
  });

  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

async function refreshData() {
  if (!isConfigured()) {
    authenticated = false;
    realm = null;
    onlinePlayers = [];
    lastError =
      'Realm API environment variables are not configured.';

    await updateAllStatuses(false);

    return false;
  }

  if (refreshing) {
    return true;
  }

  refreshing = true;
  lastError = null;

  try {
    realm = await fetchRealm();

    // First try the online flags on the realm object itself.
    onlinePlayers = Array.isArray(realm?.players)
      ? realm.players
          .filter((player) => player?.online)
          .map((player) => player.name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
      : [];

    // Bedrock realms typically return realm.players as null, so fall back to
    // the live-players endpoint whenever the realm object reported nobody.
    if (!onlinePlayers.length && realm?.id != null) {
      const live = await fetchLivePlayers(realm);
      if (live.length) {
        onlinePlayers = live;
      }
    }

    authenticated = true;
    lastUpdate = Date.now();

    return true;
  } catch (error) {
    authenticated = false;

    lastError =
      error?.message ||
      String(error);

    console.error(
      'Realm API refresh error:',
      lastError,
    );

    return false;
  } finally {
    refreshing = false;

    await updateAllStatuses(false);
  }
}

function currentPlayers() {
  return [...onlinePlayers];
}

function statusEmbed(config = {}) {
  const configured = isConfigured();
  const open = realmIsOpen(realm);

  let state = '⚪ NOT CONFIGURED';

  if (configured && refreshing) {
    state = '🟡 CHECKING';
  } else if (
    configured &&
    authenticated &&
    open
  ) {
    state = '🟢 ONLINE';
  } else if (
    configured &&
    authenticated &&
    !open
  ) {
    state = '🔴 CLOSED';
  } else if (configured) {
    state = '🔴 API OFFLINE';
  }

  const maxPlayers = Number(
    realm?.maxPlayers ||
      bridgeCfg.maxPlayers ||
      10,
  );

  const playerLines = onlinePlayers.length
    ? onlinePlayers
        .map((name) => `• ${name}`)
        .join('\n')
    : open
      ? 'No players are currently online.'
      : 'No players detected.';

  const description = [
    '> Live Realm information without an in-game bot account taking a player slot.',
    '',
    '📡 **REALM STATUS**',
    '```',
    `Status   • ${state.replace(/^[^ ]+ /, '')}`,
    `Players  • ${onlinePlayers.length} / ${maxPlayers}`,
    `Name     • ${realm?.name || 'Alcatraz Skygen'}`,
    'Edition  • Minecraft Bedrock Realm',
    '```',
    '',
    '👥 **ONLINE PLAYERS**',
    `\`\`\`\n${playerLines.slice(0, 900)}\n\`\`\``,
    '',
    '> ✅ Uses the Realms API only — **no Minecraft player slot is used**.',
  ];

  if (lastError) {
    description.push(
      '',
      `> ⚠️ Last API error: ${String(lastError).slice(0, 300)}`,
    );
  }

  return new EmbedBuilder()
    .setColor(
      open
        ? 0x57f287
        : BRAND.color,
    )
    .setTitle(
      '📊 Alcatraz Skygen — Realm Status',
    )
    .setDescription(
      description.join('\n'),
    )
    .setImage(
      config.bannerUrl ||
        BRAND.banner,
    )
    .setFooter({
      text: lastUpdate
        ? `Alcatraz Skygen • Updated ${new Date(
            lastUpdate,
          ).toLocaleTimeString('en-GB')}`
        : 'Alcatraz Skygen • Waiting for Realm API',
    })
    .setTimestamp();
}

async function resolveStatusChannel(
  guild,
  config,
) {
  if (config.statusChannelId) {
    const configured =
      await guild.channels
        .fetch(
          config.statusChannelId,
        )
        .catch(() => null);

    if (
      configured?.isTextBased()
    ) {
      return configured;
    }
  }

  const byName =
    guild.channels.cache.find(
      (channel) =>
        channel.name ===
          '📊・realm-status' &&
        channel.isTextBased(),
    );

  if (byName) {
    await saveConfig(guild, {
      statusChannelId:
        byName.id,
    });

    return byName;
  }

  return null;
}

async function updateGuildStatus(
  guild,
) {
  try {
    const config =
      await loadConfig(guild);

    const channel =
      await resolveStatusChannel(
        guild,
        config,
      );

    if (!channel) {
      return;
    }

    const embed =
      statusEmbed(config);

    let message = null;

    if (
      config.statusMessageId
    ) {
      message =
        await channel.messages
          .fetch(
            config.statusMessageId,
          )
          .catch(() => null);
    }

    if (message) {
      await message.edit({
        embeds: [embed],
        components: [],
      });
    } else {
      message =
        await channel.send({
          embeds: [embed],
        });

      await saveConfig(guild, {
        statusMessageId:
          message.id,
        statusChannelId:
          channel.id,
      });
    }
  } catch (error) {
    console.error(
      'Realm status update failed:',
      error?.message || error,
    );
  }
}

async function updateAllStatuses(
  refreshFirst = false,
) {
  if (refreshFirst) {
    await refreshData();
  }

  if (!discord) {
    return;
  }

  for (const guild of discord.guilds.cache.values()) {
    await updateGuildStatus(
      guild,
    );
  }

  if (discord.user) {
    const count =
      currentPlayers().length;

    const open =
      realmIsOpen(realm);

    try {
      discord.user.setPresence({
        activities: [
          {
            name: `${count} player${
              count === 1
                ? ''
                : 's'
            } | Alcatraz`,
            type: ActivityType.Watching,
          },
        ],
        status: open
          ? 'online'
          : 'idle',
      });
    } catch (error) {
      console.error(
        'Failed to update Discord presence:',
        error?.message || error,
      );
    }
  }
}

async function reconnect() {
  api = null;
  realm = null;
  authenticated = false;
  onlinePlayers = [];

  return refreshData();
}

async function init(client) {
  discord = client;

  if (updateTimer) {
    clearInterval(
      updateTimer,
    );
  }

  if (!isConfigured()) {
    console.warn(
      'Realm API disabled: set REALM_ID or REALM_INVITE.',
    );

    await updateAllStatuses(
      false,
    );

    return;
  }

  await refreshData();

  updateTimer = setInterval(
    () => {
      refreshData().catch(
        (error) => {
          console.error(
            'Realm refresh timer failed:',
            error?.message ||
              error,
          );
        },
      );
    },
    bridgeCfg.interval,
  );
}

function getState() {
  return {
    configured:
      isConfigured(),
    authenticated,
    refreshing,
    connected:
      authenticated,
    realmOpen:
      realmIsOpen(realm),
    lastError,
    lastUpdate,
    players:
      currentPlayers(),
    maxPlayers: Number(
      realm?.maxPlayers ||
        bridgeCfg.maxPlayers ||
        10,
    ),
    realmName:
      realm?.name ||
      null,
    realmState:
      realm?.state ||
      null,
    usesPlayerSlot: false,
  };
}

module.exports = {
  init,
  reconnect,
  refreshData,
  updateAllStatuses,
  updateGuildStatus,
  statusEmbed,
  getState,
  currentPlayers,
};
