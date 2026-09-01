'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getOrCreateConfigChannel, loadConfig } = require('../utils/configStore');
const { infoPanels } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('setup').setDescription('Set up Alcatraz Skygen panels').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await getOrCreateConfigChannel(interaction.guild);
    const config = await loadConfig(interaction.guild);
    const panels = infoPanels(config);
    const map = {
      '📜・rules': panels.rules,
      '📢・announcements': panels.announcements,
      '🧱・how-to-play': panels.howtoplay,
      '📖・server-info': panels.serverinfo,
      '🔗・realm-access': panels.realmacccess,
      '📝・changelog': panels.changelog,
      '⭐・ranks': panels.ranks,
      '🎁・rewards': panels.rewards,
      '🎯・events': panels.events,
      '🎫・open-ticket': panels.support
    };
    const sent = [], missing = [];
    for (const [name, payload] of Object.entries(map)) {
      const channel = interaction.guild.channels.cache.find(c => c.name === name && c.isTextBased());
      if (!channel) { missing.push(name); continue; }
      await channel.send(payload);
      sent.push(name);
    }
    const statusChannel = interaction.guild.channels.cache.find(c => c.name === '📊・realm-status' && c.isTextBased());
    if (statusChannel) {
      const { saveConfig } = require('../utils/configStore');
      const realmBridge = require('../utils/realmBridge');
      await saveConfig(interaction.guild, { statusChannelId: statusChannel.id });
      await realmBridge.updateGuildStatus(interaction.guild);
    }
    await interaction.editReply(`✅ Setup complete. Sent panels to **${sent.length}** channels.${statusChannel ? '\n📊 Slot-free Realms API status connected to the realm-status channel.' : ''}${missing.length ? `\n\n⚠️ Missing: ${missing.join(', ')}` : ''}`);
  }
};
