'use strict';
const { SlashCommandBuilder } = require('discord.js');
const bridge = require('../utils/realmBridge');
const { loadConfig } = require('../utils/configStore');
module.exports = {
  data: new SlashCommandBuilder().setName('status').setDescription('Show the live Alcatraz Realm status'),
  async execute(interaction) {
    const config = await loadConfig(interaction.guild);
    return interaction.reply({ embeds: [bridge.statusEmbed(config)] });
  }
};
