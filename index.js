const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();

const regurl = /https:\/\/discord(app)?.com\/channels(\/\d{18}){3}/g;

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

client.on('message', msg => {
    try{
        if (msg.author.bot) return;
        let msgurls = msg.content.match(regurl);
        if (!msgurls) return;
        for (let msgurl of msgurls) {
            let ids = msgurl.split('/').slice(4);
            if (ids[0] != msg.guild.id) {
                msg.reply(`\`${msgurl}\`\nis not from this server. I could not expand it.`);
                continue;
            }
            let cnl = msg.guild.channels.cache.get(ids[1]);
            if (!cnl.viewable) {
                msg.reply(`I didn't have permission to see \n\`${msgurl}\`.\nI could not expand it.`);
                continue;
            }
            cnl.messages.fetch(ids[2]).then(target => {
                let name;
                if (target.member) {
                    name = target.member.nickname;
                }else{
                    name = target.author.username;
                }
                let msgembed = new Discord.MessageEmbed({
                    author: {
                        name: name,
                        icon_url: target.author.avatarURL()
                    },
                    description: target.content,
                    timestamp: target.createdAt,
                    footer: {
                        text: cnl.parent.name + ' > ' + cnl.name,
                        icon_url: msg.guild.iconURL()
                    }
                });
                let attaches = target.attachment;
                if (attaches) msgembed.setImage(attaches.array()[0].proxyURL);
                let embeds = target.embeds;
                if (embeds.length) msgembed.description += '\n(Original message was embedded.)';
                msg.channel.send(msgembed);
            });
        };
    }catch(e){
        msg.reply('unexpected error.')
    }
});

client.on('channelCreate', channel => channel.fetch());

client.login(process.env.BOT_TOKEN);