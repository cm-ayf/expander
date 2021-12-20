import { Client, Message, MessageEmbed, NewsChannel, Permissions, TextChannel, ThreadChannel } from "discord.js";


export default function expand(client: Client, message: Message) {
    async function getMessage(url: string): Promise<[TextChannel | NewsChannel | ThreadChannel, Message]> {
        let ids = url.split('/').slice(4);
        if (ids[0] != message.guild.id) throw new Error(`\`${url}\`\nis not from this server. I could not expand it.`);

        let channel = await message.guild.channels.fetch(ids[1]);
        if (!(channel.isText() || channel.isThread())) throw new Error(`\`${channel}\` is not a text channel.`);

        let allowed = channel.permissionsFor(client.user).has(Permissions.FLAGS.READ_MESSAGE_HISTORY);
        if (!allowed) throw new Error(`I didn't have permission to see \n\`${url}\`.\nI could not expand it.`);

        return [channel, await channel.messages.fetch(ids[2])];
    }

    return async (url: string) => {
        let [channel, target] = await getMessage(url);

        let name = target.member ? target.member.displayName : target.author.username;
    
        let channelDesc = '';
        if (channel.parent.parent) channelDesc += channel.parent.parent.name + ' > ';
        if (channel.parent) channelDesc += channel.parent.name + ' > ';
        channelDesc += channel.name;
    
        let embed = new MessageEmbed({
            author: {
                name: name,
                icon_url: target.author.displayAvatarURL()
            },
            description: target.content,
            timestamp: target.createdAt,
            footer: {
                text: channelDesc,
                icon_url: message.guild.iconURL()
            }
        });
    
        let attach = target.attachments.find(att => att.width > 0);
        if (attach) embed.setImage(attach.url);
    
        let embeds = target.embeds;
        if (embeds.length) embed.description += `\n(${embeds.length} ${embeds.length == 1 ? 'embed follows.' : 'embeds follow.'})`;
    
        message.channel.send({
            embeds: [embed, ...embeds]
        }).catch(e => console.error(e));
    };
}
