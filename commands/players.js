'use strict';
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const bridge = require('../utils/realmBridge');
const { BRAND } = require('../utils/constants');

module.exports = {
  data: new SlashCommandBuilder().setName('players').setDescription('Show players currently online on the Alcatraz Realm'),
  async execute(interaction) {
    const state = bridge.getState();
    const list = state.players.length
      ? state.players.map(x => `• ${x}`).join('\n')
      : state.realmOpen ? 'No players are currently online.' : 'The Realm is currently closed or unavailable.';

    const embed = new EmbedBuilder()
      .setColor(BRAND.color)
      .setTitle('👥 Alcatraz Skygen — Online Players')
      .setDescription(`\`\`\`\n${list}\n\`\`\``)
      .setFooter({ text: `${state.players.length} player(s) online • Realms API • No bot slot used` });

    return interaction.reply({ embeds: [embed] });
  }
};
