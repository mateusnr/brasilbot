import * as Discord from "discord.js";
import config from "../config";
import { fs } from "mz";
import * as Winston from "winston";
const Snoowrap = require("snoowrap"); //yikes

const reddit = new Snoowrap({
    userAgent: "brasil Discord bot",
    clientId: config.reddit.clientId,
    clientSecret: config.reddit.clientSecret,
    username: config.reddit.username,
    password: config.reddit.password,
});

export const monitorReddit = async (client: Discord.Client, logger: Winston.Logger) => {
    try {
        const cache = JSON.parse(await fs.readFile("./common/cache.json", "utf8"));
        const lastPost = await reddit.getSubreddit('brasil').getNew()[0];
        if (lastPost.id === cache.id) { return; } // Checks if post has already been sent

        logger.debug(`Found new post. ID: ${lastPost.id}`);
        const embed = new Discord.RichEmbed;
        embed.setAuthor("Novo post no " + lastPost.subreddit_name_prefixed, "http://flags.fmcdn.net/data/flags/w580/br.png");
        embed.setThumbnail(lastPost.thumbnail !== "self" ? lastPost.thumbnail : "http://1000logos.net/wp-content/uploads/2017/05/Reddit-logo.png");
        embed.setTitle(lastPost.title);
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
