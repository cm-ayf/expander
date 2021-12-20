import { Client, Intents } from 'discord.js';
import env from './env';
import expand from './expand';

const { BOT_TOKEN } = env;

const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS
    ]
});

const regurl = /https:\/\/discord(app)?.com\/channels(\/\d{18}){3}/g;

client.on('ready', client => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;
    let msgurls = message.content.match(regurl);
    if (!msgurls) return;

    msgurls.forEach(expand(client, message));
});

client.on('threadCreate', channel => {
    channel.join().catch(console.error);
});

client.login(BOT_TOKEN);