'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { loadConfig, saveConfig } = require('../utils/configStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config').setDescription('Manage Alcatraz bot config').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName('view').setDescription('View current config'))
    .addSubcommand(s => s.setName('realm-code').setDescription('Set the Realm code').addStringOption(o => o.setName('code').setDescription('Realm code').setRequired(true)))
    .addSubcommand(s => s.setName('banner').setDescription('Set embed banner URL').addStringOption(o => o.setName('url').setDescription('Image URL').setRequired(true)))
    .addSubcommand(s => s.setName('staff-role').setDescription('Set ticket staff role').addRoleOption(o => o.setName('role').setDescription('Staff role').setRequired(true)))
    .addSubcommand(s => s.setName('ticket-category').setDescription('Set ticket category').addChannelOption(o => o.setName('category').setDescription('Ticket category').setRequired(true))),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'view') {
      const c = await loadConfig(interaction.guild);
      return interaction.reply({ content: `\`Realm:\` ${c.realmName}\n\`Realm code:\` ${c.realmCode}\n\`Staff role:\` ${c.staffRoleId ? `<@&${c.staffRoleId}>` : 'Not set'}\n\`Ticket category:\` ${c.ticketCategoryId ? `<#${c.ticketCategoryId}>` : 'Not set'}\n\`Banner:\` ${c.bannerUrl}`, flags: MessageFlags.Ephemeral });
    }
    let patch = {};
    if (sub === 'realm-code') patch.realmCode = interaction.options.getString('code');
    if (sub === 'banner') patch.bannerUrl = interaction.options.getString('url');
    if (sub === 'staff-role') patch.staffRoleId = interaction.options.getRole('role').id;
    if (sub === 'ticket-category') patch.ticketCategoryId = interaction.options.getChannel('category').id;
    await saveConfig(interaction.guild, patch);
    return interaction.reply({ content: '✅ Configuration updated in the private bot-config channel.', flags: MessageFlags.Ephemeral });
  }
};
