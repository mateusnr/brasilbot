import * as Discord from "discord.js";
import config from "./config";
import { addRole, removeRole } from "./commands";
import { monitorReddit, loadListeners } from "./workers";
import * as winston from "winston";

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
    logger.info(`Logged in as ${client.user.tag}`);
});

client.on("message", async (message) => {
    if (message.content.startsWith(`${config.prefix}add`)) {
        logger.debug(`Added role to user ${message.author.id}`);
        await addRole(message);
    }

    if (message.content.startsWith(`${config.prefix}remove`)) {
        logger.debug(`Removed role from user ${message.author.id}`);
        await removeRole(message);
    }
});

loadListeners(client, logger);

client.setInterval(monitorReddit, 10000, client, logger);

client.login(config.token);
