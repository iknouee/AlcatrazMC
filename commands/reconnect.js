'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const bridge = require('../utils/realmBridge');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reconnect')
    .setDescription('Refresh the Bedrock Realms API session')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const ok = await bridge.reconnect();
    return interaction.editReply(ok
      ? '✅ Realms API refreshed. No in-game bot joined and no player slot was used.'
      : '⚠️ Could not refresh the Realms API. Check the Render logs and Realm environment variables.');
  }
};
