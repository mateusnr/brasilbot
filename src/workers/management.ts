import * as Discord from "discord.js";
import config from "../config"
import * as Wiston from "winston";
import { TextChannel } from "discord.js";

export const loadListeners = (client: Discord.Client, logger: Wiston.Logger) => 
{
    client.on("messageDelete", (message) => {

        logger.debug(`A message was deleted! ID: ${message.id}`)
        const embed_message = new Discord.RichEmbed;
        // Assigning the type is necessary as the property 'name' only exists on TextChannel.
        const source_channel = message.channel as TextChannel;

        embed_message.setColor("RED");
        embed_message.setAuthor("Uma mensagem foi removida!", "http://flags.fmcdn.net/data/flags/w580/br.png");
        embed_message.setTitle(message.author.tag);
        embed_message.addField("Canal", "#" + source_channel.name);
        embed_message.addField("Mensagem", message.content);
        embed_message.addField("Horário", new Date(message.createdTimestamp));

        const guild = client.guilds.find(guild => guild.id === config.discord.guild_id) as Discord.Guild;
        if (!guild) { 
            return logger.warn(`Could not find guild with id ${config.discord.guild_id}`);
        }

        const output_channel = <TextChannel>guild.channels.find(channel => channel.name === config.discord.management_channel);
        if (!output_channel){
            return logger.warn(`Could not find channel with name ${config.discord.channel}`);
        }

        try {
            output_channel.send(embed_message);
        } catch (error) {
            logger.warn(error);
        }
        return;
    });
}
