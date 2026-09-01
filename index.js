'use strict';
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  Client, GatewayIntentBits, Collection, Events, MessageFlags,
  ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder
} = require('discord.js');
const { loadConfig, getOrCreateConfigChannel } = require('./utils/configStore');
const { BRAND } = require('./utils/constants');

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID');
  process.exit(1);
}

const app = express();
app.get('/', (_req, res) => res.send('⛓️ Alcatraz Skygen bot is online'));
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.listen(process.env.PORT || 3000, () => console.log(`Web server on ${process.env.PORT || 3000}`));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
for (const file of fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

client.once(Events.ClientReady, async c => {
  console.log(`Logged in as ${c.user.tag}`);
  c.user.setActivity('Alcatraz Skygen');
  for (const guild of c.guilds.cache.values()) {
    try { await getOrCreateConfigChannel(guild); } catch (e) { console.error('Config channel:', e.message); }
  }
});

async function createTicket(interaction, type) {
  const config = await loadConfig(interaction.guild);
  const existing = interaction.guild.channels.cache.find(c => c.topic?.includes(`ticket-owner:${interaction.user.id}`));
  if (existing) return interaction.reply({ content: `❌ You already have an open ticket: ${existing}`, flags: MessageFlags.Ephemeral });
  const safe = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'user';
  const overwrites = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
    { id: interaction.guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory] }
  ];
  if (config.staffRoleId) overwrites.push({ id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] });
  const channel = await interaction.guild.channels.create({
    name: `ticket-${type}-${safe}`,
    type: ChannelType.GuildText,
    parent: config.ticketCategoryId || null,
    topic: `ticket-owner:${interaction.user.id};type:${type}`,
    permissionOverwrites: overwrites
  });
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setEmoji('🙋').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('ticket_add').setLabel('Add User').setEmoji('➕').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setEmoji('📄').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger)
  );
  const embed = new EmbedBuilder().setColor(BRAND.color).setTitle(`🎫 ${type[0].toUpperCase()+type.slice(1)} Ticket`).setDescription(`Welcome ${interaction.user}.\n\nExplain what you need help with and a staff member will respond. Please include screenshots or usernames where relevant.`).setImage(config.bannerUrl || BRAND.banner).setFooter({ text: 'Alcatraz Skygen Support' });
  await channel.send({ content: config.staffRoleId ? `<@&${config.staffRoleId}> • ${interaction.user}` : `${interaction.user}`, embeds: [embed], components: [row] });
  return interaction.reply({ content: `✅ Ticket created: ${channel}`, flags: MessageFlags.Ephemeral });
}

async function isStaff(interaction) {
  const config = await loadConfig(interaction.guild);
  return interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) || (config.staffRoleId && interaction.member.roles.cache.has(config.staffRoleId));
}

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
      return;
    }
    if (!interaction.isButton()) return;

    if (interaction.customId === 'rules_accept') return interaction.reply({ content: '✅ You have confirmed that you understand the Alcatraz rules.', flags: MessageFlags.Ephemeral });
    if (interaction.customId === 'show_realm_code') {
      const config = await loadConfig(interaction.guild);
      return interaction.reply({ content: config.realmCode === 'NOT_SET' ? '⚠️ The Realm code has not been configured yet.' : `🎮 **Alcatraz Skygen Realm Code:** \`${config.realmCode}\``, flags: MessageFlags.Ephemeral });
    }
    if (interaction.customId === 'open_support') return createTicket(interaction, 'support');
    if (interaction.customId.startsWith('ticket_') && ['ticket_support','ticket_report','ticket_bug','ticket_appeal','ticket_partner'].includes(interaction.customId)) {
      return createTicket(interaction, interaction.customId.replace('ticket_', ''));
    }
    if (interaction.customId === 'ticket_claim') {
      if (!(await isStaff(interaction))) return interaction.reply({ content: '🔒 Staff only.', flags: MessageFlags.Ephemeral });
      await interaction.channel.send(`🙋 Ticket claimed by ${interaction.user}.`);
      return interaction.reply({ content: '✅ Claimed.', flags: MessageFlags.Ephemeral });
    }
    if (interaction.customId === 'ticket_close') {
      const ownerId = interaction.channel.topic?.match(/ticket-owner:(\d+)/)?.[1];
      const allowed = ownerId === interaction.user.id || await isStaff(interaction);
      if (!allowed) return interaction.reply({ content: '🔒 You cannot close this ticket.', flags: MessageFlags.Ephemeral });
      await interaction.reply({ content: '🔒 Closing ticket…', flags: MessageFlags.Ephemeral });
      setTimeout(() => interaction.channel.delete('Ticket closed').catch(()=>{}), 1500);
      return;
    }
    if (interaction.customId === 'ticket_transcript') {
      if (!(await isStaff(interaction))) return interaction.reply({ content: '🔒 Staff only.', flags: MessageFlags.Ephemeral });
      const msgs = await interaction.channel.messages.fetch({ limit: 100 });
      const lines = [...msgs.values()].sort((a,b)=>a.createdTimestamp-b.createdTimestamp).map(m => `[${new Date(m.createdTimestamp).toISOString()}] ${m.author.tag}: ${m.cleanContent}`);
      const buf = Buffer.from(lines.join('\n') || 'No messages.');
      return interaction.reply({ content: '📄 Ticket transcript:', files: [{ attachment: buf, name: `${interaction.channel.name}-transcript.txt` }], flags: MessageFlags.Ephemeral });
    }
    if (interaction.customId === 'ticket_add') {
      if (!(await isStaff(interaction))) return interaction.reply({ content: '🔒 Staff only. Use Discord channel permissions to add a user for now.', flags: MessageFlags.Ephemeral });
      return interaction.reply({ content: '➕ For v1, right-click the channel → Edit Channel → Permissions → add the member. A user-select menu can be added next.', flags: MessageFlags.Ephemeral });
    }
  } catch (err) {
    console.error(err);
    if (interaction.isRepliable()) {
      const payload = { content: '❌ Something went wrong. Check the Render logs.', flags: MessageFlags.Ephemeral };
      if (interaction.replied || interaction.deferred) await interaction.followUp(payload).catch(()=>{}); else await interaction.reply(payload).catch(()=>{});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
