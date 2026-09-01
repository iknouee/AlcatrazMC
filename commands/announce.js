'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { base } = require('../utils/embeds');
const { loadConfig } = require('../utils/configStore');
module.exports = {
  data: new SlashCommandBuilder().setName('announce').setDescription('Send a branded announcement').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('title').setDescription('Title').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(false)),
  async execute(interaction) {
    const config = await loadConfig(interaction.guild);
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const embed = base(`📢 ${interaction.options.getString('title')}`, interaction.options.getString('message'), config.bannerUrl);
    await channel.send({ embeds: [embed] });
    return interaction.reply({ content: `✅ Announcement sent in ${channel}.`, flags: MessageFlags.Ephemeral });
  }
};
