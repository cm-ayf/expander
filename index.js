const { Client, Intents, MessageEmbed } = require('discord.js');
const express = require('express');
require('dotenv').config();

const app = express();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS
    ]
});

app.get('/', (req, res) => res.send(`Logged in as ${client.user.tag}!`));

app.listen(process.env.PORT);

const regurl = /https:\/\/discord(app)?.com\/channels(\/\d{18}){3}/g;

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

client.on('messageCreate', msg => {
    if (msg.author.bot) return;
    let msgurls = msg.content.match(regurl);
    if (!msgurls) return;
    for (let msgurl of msgurls) {
        let ids = msgurl.split('/').slice(4);
        if (ids[0] != msg.guild.id) {
            msg.reply(`\`${msgurl}\`\nis not from this server. I could not expand it.`)
                .catch(e => console.error(e));
            continue;
        }
        let cnl = msg.guild.channels.cache.get(ids[1]);
        if (!cnl.manageable) {
            msg.reply(`I didn't have permission to see \n\`${msgurl}\`.\nI could not expand it.`)
                .catch(e => console.error(e));
            continue;
        }
        cnl.messages.fetch(ids[2]).then(target => {
            let name;
            if (target.member) {
                name = target.member.displayName;
            }else{
                name = target.author.username;
            }
            let channel_name;
            if (cnl.parent) {
                channel_name = cnl.parent.name + ' > ' + cnl.name;
            }else{
                channel_name = cnl.name;
            }
            let msgembed = new MessageEmbed({
                author: {
                    name: name,
                    icon_url: target.author.avatarURL()
                },
                description: target.content,
                timestamp: target.createdAt,
                footer: {
                    text: channel_name,
                    icon_url: msg.guild.iconURL()
                }
            });
            let attach = target.attachments.find(att => att.width);
            if (attach) msgembed.setImage(attach.url);
            let embeds = target.embeds;
            if (embeds.length) msgembed.description += `\n(${embeds.length} ${embeds.length == 1 ? 'embed follows.' : 'embeds follow.'})`;
            msg.channel.send({
                embeds: [msgembed].concat(embeds)
            }).catch(e => console.error(e));
        }).catch(e => console.error(e));
    };
});

client.on('channelCreate', channel => channel.fetch().catch(e => console.error(e)));

client.login(process.env.BOT_TOKEN).catch(e => console.error(e));