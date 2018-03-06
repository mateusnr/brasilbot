import * as Discord from "discord.js";
import config from "../config";
import { fs } from "mz";
const Snoowrap = require("snoowrap");

const reddit = new Snoowrap({
    userAgent: "brasil Discord bot",
    clientId: config.reddit.clientId,
    clientSecret: config.reddit.clientSecret,
    username: config.reddit.username,
    password: config.reddit.password,
});

export const monitorReddit = async (client: Discord.Client) => {
    const cache = JSON.parse(await fs.readFile("./common/cache.json", "utf8"));

    const lastPost = await reddit.getSubreddit('brasil').getNew()[0];
    if (lastPost.id === cache.id) { return; } // Checks if post has already been sent

    const embed = new Discord.RichEmbed;
    embed.setAuthor("Novo post no " + lastPost.subreddit_name_prefixed, "http://flags.fmcdn.net/data/flags/w580/br.png");
    embed.setThumbnail(lastPost.thumbnail !== "self" ? lastPost.thumbnail : "http://1000logos.net/wp-content/uploads/2017/05/Reddit-logo.png");
    embed.setTitle(lastPost.title);
    embed.setURL(`https://reddit.com${lastPost.permalink}`);
    embed.addField("Autor", lastPost.author.name, true)
    embed.addField("Flair", lastPost.link_flair_text, true);
    embed.setColor("GREEN");

    // Find the correct channel
    const guild = client.guilds.find(i => i.name === config.discord.guild) as Discord.Guild;
    const channel = guild.channels.find(i => i.name === config.discord.channel) as Discord.TextChannel;
    channel.send(embed);

    await fs.writeFile("./common/cache.json", JSON.stringify({ id: lastPost.id }));
}