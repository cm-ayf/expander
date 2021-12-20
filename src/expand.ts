import { Client, Message, MessageEmbed, Permissions } from "discord.js";


export default function expand(client: Client, msg: Message) {
    return async msgurl => {
        let ids = msgurl.split('/').slice(4);
        if (ids[0] != msg.guild.id) {
            msg.channel.send(`\`${msgurl}\`\nis not from this server. I could not expand it.`)
                .catch(e => console.error(e));
            return;
        }
    
        let cnl = await msg.guild.channels.fetch(ids[1]);
        let allowed = cnl.permissionsFor(client.user).has(Permissions.FLAGS.READ_MESSAGE_HISTORY);
        if (!cnl.isText()) {
            msg.channel.send(`I didn't have permission to see \n\`${msgurl}\`.\nI could not expand it.`)
                .catch(e => console.error(e));
            return;
        }
        if (!allowed) {
            msg.channel.send(`I didn't have permission to see \n\`${msgurl}\`.\nI could not expand it.`)
                .catch(e => console.error(e));
            return;
        }
    
        let target = await cnl.messages.fetch(ids[2]);
    
        let name;
        if (target.member) {
            name = target.member.displayName;
        }else{
            name = target.author.username;
        }
    
        let channel_name = '';
        if (cnl.parent.parent) {
            channel_name += cnl.parent.parent.name + ' > ';
        }
        if (cnl.parent) {
            channel_name += cnl.parent.name + ' > ';
        }
        channel_name += cnl.name;
    
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
    
        let attach = target.attachments.find(att => att.width > 0);
        if (attach) msgembed.setImage(attach.url);
    
        let embeds = target.embeds;
        if (embeds.length) msgembed.description += `\n(${embeds.length} ${embeds.length == 1 ? 'embed follows.' : 'embeds follow.'})`;
    
        msg.channel.send({
            embeds: [msgembed].concat(embeds)
        }).catch(e => console.error(e));
    };
}