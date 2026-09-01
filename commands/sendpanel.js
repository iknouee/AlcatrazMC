'use strict';
const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { infoPanels } = require('../utils/embeds');
const { loadConfig } = require('../utils/configStore');
module.exports = {
  data: new SlashCommandBuilder().setName('sendpanel').setDescription('Send an Alcatraz panel').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName('panel').setDescription('Panel').setRequired(true).addChoices(
      {name:'Rules',value:'rules'},{name:'How To Play',value:'howtoplay'},{name:'Server Info',value:'serverinfo'},{name:'Realm Access',value:'realmacccess'},{name:'Ranks',value:'ranks'},{name:'Rewards',value:'rewards'},{name:'Events',value:'events'},{name:'Realm Status',value:'realmstatus'},{name:'Tickets',value:'support'}
    ))
    .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(false)),
  async execute(interaction) {
    const config = await loadConfig(interaction.guild);
    const panel = infoPanels(config)[interaction.options.getString('panel')];
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    await channel.send(panel);
    return interaction.reply({ content: `✅ Panel sent in ${channel}.`, flags: MessageFlags.Ephemeral });
  }
};
