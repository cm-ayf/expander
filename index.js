const Discord = require('discord.js');
require('dotenv').config();

dclient.on('ready', () => console.log(`Logged in as ${dclient.user.tag}!`));

client.login(process.env.BOT_TOKEN);