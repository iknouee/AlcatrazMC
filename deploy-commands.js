'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const commands = [];
for (const file of fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'))) {
  commands.push(require(`./commands/${file}`).data.toJSON());
}
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  if (!process.env.GUILD_ID) throw new Error('GUILD_ID is required');
  await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
  console.log(`Deployed ${commands.length} commands.`);
})().catch(err => { console.error(err); process.exit(1); });
