import * as Discord from "discord.js";
import config from "../config";
import { fs } from "mz";
import * as Winston from "winston";
import { EMBED_TITLE_CHAR_LIMIT } from "../constants"
const Snoowrap = require("snoowrap"); //yikes

const reddit = new Snoowrap({
    userAgent: "brasil Discord bot",
    clientId: config.reddit.clientId,
    clientSecret: config.reddit.clientSecret,
    username: config.reddit.username,
    password: config.reddit.password,
});

/**
 * Checks if a thread title is bigger than 256 characters.
 * 
 * If that's the case, it truncates the string with a `...` in the end, otherwise, it returns the given string
 * 
 * @param title Reddit thread title
 * @returns String containing the title
 */
const parseTitle = function(title: String){
    if (title.length > EMBED_TITLE_CHAR_LIMIT){
        const newTitle = title.substr(0, EMBED_TITLE_CHAR_LIMIT - 3) + '...';
        return newTitle;
    }

    return title;
}

export const monitorReddit = async (client: Discord.Client, logger: Winston.Logger) => {
    try {
        /*
            TODO: create a new cache.json if the file doesn't exist
            Cache more than one thread to avoid duplicates (in case a thread is quickly removed)
        */
        const cache = JSON.parse(await fs.readFile("./common/cache.json", "utf8"));
        const lastPost = await reddit.getSubreddit('brasil').getNew()[0];

        if (lastPost.id === cache.id) { return; } // Checks if post has already been sent

        //TODO: create a separate function for a reddit embed
        logger.debug(`Found new post. ID: ${lastPost.id}`);
        const embed = new Discord.RichEmbed;
        embed.setAuthor("Novo post no " + lastPost.subreddit_name_prefixed, "http://flags.fmcdn.net/data/flags/w580/br.png");
        embed.setThumbnail(lastPost.thumbnail !== "self" ? lastPost.thumbnail : "http://1000logos.net/wp-content/uploads/2017/05/Reddit-logo.png");
        embed.setTitle(parseTitle(lastPost.title));
        embed.setURL(`https://reddit.com${lastPost.permalink}`);
            embed.addField("Autor", lastPost.author.name, true)
        embed.addField("Flair", lastPost.link_flair_text !== null ? lastPost.link_flair_text : "Sem flair", true);
        embed.setColor("GREEN");

        // Find the correct 
        const guild = client.guilds.find(guild => guild.id === config.discord.guild_id) as Discord.Guild;
        if (!guild) { 
            return logger.warn(`Could not find guild with id ${config.discord.guild_id}`);
        }

        const channel = guild.channels.find(channel => channel.name === config.discord.channel) as Discord.TextChannel;
        if (!channel) { 
            return logger.warn(`Could not find channel with name ${config.discord.channel}`);
        }
        await channel.send(embed);
        await fs.writeFile("./common/cache.json", JSON.stringify({ id: lastPost.id }));
    } catch (err) {
        logger.warn(err);
    }
    return;
}
