'use strict';
const { SlashCommandBuilder } = require('discord.js');
const bridge = require('../utils/realmBridge');
const { loadConfig } = require('../utils/configStore');
module.exports = {
  data: new SlashCommandBuilder().setName('status').setDescription('Show the live Alcatraz Realm status'),
  async execute(interaction) {
    await interaction.deferReply();
    const config = await loadConfig(interaction.guild);
    return interaction.editReply({ embeds: [bridge.statusEmbed(config)] });
  }
};
