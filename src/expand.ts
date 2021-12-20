import {
    Client,
    GuildTextBasedChannel,
    Message,
    MessageEmbed,
    Permissions,
} from "discord.js";

export default function expand(client: Client<true>, message: Message) {
    async function getMessage(
        url: string
    ): Promise<[GuildTextBasedChannel, Message]> {
        let ids = url.split("/").slice(4);
        if (ids[0] != message.guild?.id)
            throw new Error(
                `\`${url}\`\nis not from this server. I could not expand it.`
            );

        let channel = await message.guild.channels.fetch(ids[1]);
        if (!channel) throw new Error(`channel with id ${ids[1]} not found.`);

        if (!(channel.isText() || channel.isThread()))
            throw new Error(`\`${channel}\` is not a text channel.`);

        let allowed = channel
            .permissionsFor(client.user)
            ?.has(Permissions.FLAGS.READ_MESSAGE_HISTORY);
        if (!allowed)
            throw new Error(
                `I didn't have permission to see \n\`${url}\`.\nI could not expand it.`
            );

        return [channel, await channel.messages.fetch(ids[2])];
    }

    function createEmbeds([
        channel,
        { member, author, content, createdAt, attachments, embeds },
    ]: [GuildTextBasedChannel, Message]) {
        let name = member ? member.displayName : author.username;

        let channelDesc = "";
        if (channel.parent?.parent)
            channelDesc += channel.parent?.parent.name + " > ";
        if (channel.parent) channelDesc += channel.parent.name + " > ";
        channelDesc += channel.name;

        let embed = new MessageEmbed({
            author: {
                name: name,
                icon_url: (member ?? author).displayAvatarURL(),
            },
            description: content,
            timestamp: createdAt,
            footer: {
                text: channelDesc,
                icon_url: message.guild?.iconURL() ?? undefined,
            },
        });

        let attach = attachments.find((att) => !!att.width);
        if (attach) embed.setImage(attach.url);
        if (embeds.length)
            embed.description += `\n(${embeds.length} ${
                embeds.length == 1 ? "embed follows." : "embeds follow."
            })`;

        return [embed, ...embeds];
    }

    return (url: string) =>
        getMessage(url)
            .then(createEmbeds)
            .then((embeds) => message.channel.send({ embeds }))
            .catch((error) => message.channel.send(`${error as Error}`))
            .catch(console.error);
}
