import * as Discord from "discord.js";
import config from "./config";
import { addRole, removeRole } from "./commands";
import{ monitorReddit } from "./workers";

const client = new Discord.Client();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async (message) => {
    if (message.content.startsWith(`${config.prefix}add`)) {
        await addRole(message);
    }

    if (message.content.startsWith(`${config.prefix}remove`)) {
        await removeRole(message);
    }
});

client.setInterval(monitorReddit, 10000, client);

client.login(config.token);