import * as Discord from "discord.js";
import config from "./config";
import { addRole, removeRole } from "./commands";
import { monitorReddit, monitorCorona } from "./workers";
import * as winston from "winston";

const ONE_SECOND_MS = 1000
const ONE_HOUR_MS = ONE_SECOND_MS * 60 * 60

const client = new Discord.Client();
const format = winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`);
const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        format
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "bot.log" })
    ]
})

client.on("ready", () => {
    if (client.user) {
        logger.info(`Logged in as ${client.user.tag}`);
    } else {
        logger.error(`No user!`);
    }
});

client.on("message", async (message: Discord.Message) =>
{
    // Command handler
    if (message.content[0] === '!'){
        const args = message.content.slice(config.prefix.length).trim().split(/\s+/g);
        const command = args.shift()?.toLowerCase() || "";

        switch(command)
        {
            case "add":
            {
                try {
                    await addRole(message, args);
                    logger.debug(`Added role to user ${message.author.id}`);
                } catch (err) {
                    logger.error(err);
                } 
                break;
            }
            case "remove":
            {
                try {
                    await removeRole(message, args);
                    logger.debug(`Removed role from user ${message.author.id}`);
                } catch (err) {
                    logger.error(err);
                }
            }
        }
    }
});

// Every 10 seconds, it checks if there's a new post in the sub
client.setInterval(monitorReddit, 10 * ONE_SECOND_MS, client, logger);
client.setInterval(monitorCorona, ONE_HOUR_MS, client, logger);

client.login(config.token);
