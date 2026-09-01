'use strict';
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { CONFIG_CHANNEL_NAME, CONFIG_MESSAGE_PREFIX, BRAND } = require('./constants');

const defaults = {
  version: 1,
  realmCode: 'NOT_SET',
  realmName: 'Alcatraz Skygen',
  bannerUrl: BRAND.banner,
  ticketCategoryId: null,
  staffRoleId: null,
  verifiedRoleId: null,
  lastUpdated: null
};

async function getOrCreateConfigChannel(guild) {
  let channel = guild.channels.cache.find(c => c.name === CONFIG_CHANNEL_NAME);
  if (channel) return channel;

  channel = await guild.channels.create({
    name: CONFIG_CHANNEL_NAME,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] }
    ],
    reason: 'Alcatraz bot private configuration storage'
  });
  return channel;
}

async function findConfigMessage(channel) {
  const messages = await channel.messages.fetch({ limit: 50 });
  return messages.find(m => m.author.id === channel.client.user.id && m.content.startsWith(CONFIG_MESSAGE_PREFIX));
}

async function loadConfig(guild) {
  const channel = await getOrCreateConfigChannel(guild);
  const msg = await findConfigMessage(channel);
  if (!msg) {
    const config = { ...defaults, lastUpdated: new Date().toISOString() };
    await channel.send(CONFIG_MESSAGE_PREFIX + '```json\n' + JSON.stringify(config, null, 2) + '\n```');
    return config;
  }
  try {
    const json = msg.content.replace(CONFIG_MESSAGE_PREFIX, '').replace(/```json\n?|```/g, '').trim();
    return { ...defaults, ...JSON.parse(json) };
  } catch {
    return { ...defaults };
  }
}

async function saveConfig(guild, patch) {
  const channel = await getOrCreateConfigChannel(guild);
  const current = await loadConfig(guild);
  const updated = { ...current, ...patch, lastUpdated: new Date().toISOString() };
  const msg = await findConfigMessage(channel);
  const content = CONFIG_MESSAGE_PREFIX + '```json\n' + JSON.stringify(updated, null, 2) + '\n```';
  if (msg) await msg.edit(content); else await channel.send(content);
  return updated;
}

module.exports = { loadConfig, saveConfig, getOrCreateConfigChannel };
