import * as Discord from "discord.js";
import config from "../config";

const fail = async (message: Discord.Message, warning: string) => {
    await message.delete();
    await message.channel.send(warning).then(msg => (msg as Discord.Message).delete(3000));
}

const findRole = (message: Discord.Message) => {
    const argument = message.content.split(" ").slice(1).join(" ");

    const role = message.guild.roles
        .find(i => i.name === argument);

    return { role, argument };
}

export const addRole = async (message: Discord.Message) => {
    try {
        const { role, argument } = findRole(message);
        
        if (!role) { 
            return await fail(message, `A role ${argument} não existe.`); 
        }
        
        if (!config.roles.includes(role.name)) { 
            return await fail(message, `Você não pode adicionar a role ${argument}.`); 
        }
        
        await message.delete()
        await message.member.addRole(role);
        return await message.channel.send(`A role ${argument} foi adicionada.`).then(msg => (msg as Discord.Message).delete(3000));
    } catch (err) {
        await message.channel.send(err.code);
        if (err.code === 50013) { // Missing permissions
            return await message.reply("Não tenho permissões pra realizar essa ação");
        }
    }
};

export const removeRole = async (message: Discord.Message) => {
    try {
        const { role, argument } = findRole(message);
        
        //TODO: change text
        if (!role) { return await fail(message, `A role ${argument} não existe.`); }
        if (!message.member.roles.array().includes(role)) { return await fail(message, `Você não possui a role ${argument}`); }
        if (!config.roles.includes(role.name)) { return await fail(message, `Você não pode adicionar a role ${argument}.`); }

        // TODO: add timeout to constants.ts
        await message.member.removeRole(role);
        await message.delete();
        return await message.channel.send(`A role ${argument} foi removida.`).then(msg => (msg as Discord.Message).delete(3000));;
    } catch (err) {
        if (err.code === 50013) { // Missing permissions
            return await message.reply("Não tenho permissões pra realizar essa ação");
        }
    } 
};
