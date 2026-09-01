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
      '📊・realm-status': panels.realmstatus,
      '🎫・open-ticket': panels.support
    };
    const sent = [], missing = [];
    for (const [name, payload] of Object.entries(map)) {
      const channel = interaction.guild.channels.cache.find(c => c.name === name && c.isTextBased());
      if (!channel) { missing.push(name); continue; }
      await channel.send(payload);
      sent.push(name);
    }
    await interaction.editReply(`✅ Setup complete. Sent panels to **${sent.length}** channels.${missing.length ? `\n\n⚠️ Missing: ${missing.join(', ')}` : ''}`);
  }
};
