import * as Discord from "discord.js";
import config from "../config";

const fail = async (message: Discord.Message, warning: string) => {
    await message.delete();
    await message.channel.send(warning).then(msg => (msg as Discord.Message).delete({timeout: 3000}));
}

const findRole = (message: Discord.Message, args: String[]) => {
    const role_name = args.join(" ");

    const role = message.guild!.roles.cache.find(i => i.name === role_name);

    return { role, role_name };
}

// FIXME: Repeated code

export const addRole = async (message: Discord.Message, args: String[]) => {
    try {
        const { role, role_name } = findRole(message, args);

        if (!role) { 
            if (role_name === ""){
                return await fail(message, "Nenhuma role foi especificada")
            }

            return await fail(message, `A role ${role_name} não existe.`); 
        }
        
        if (!config.roles.includes(role.name)) { 
            return await fail(message, `Você não pode adicionar a role ${role_name}.`); 
        }

        await message.delete()
        await message.member!.roles.add(role);
        return await message.channel.send(`A role ${role_name} foi adicionada.`).then(msg => (msg as Discord.Message).delete({timeout: 3000}));
    } catch (err) {
        await message.channel.send(err.code);
        if (err.code === 50013) { // Missing permissions
            return await message.reply("Não tenho permissões pra realizar essa ação");
        }
    }
};

export const removeRole = async (message: Discord.Message, args: String[]) => {
    try {
        const { role, role_name } = findRole(message, args);

        if (!role) { 
            if (role_name === ""){
                return await fail(message, "Nenhuma role foi especificada")
            }

            return await fail(message, `A role ${role_name} não existe.`);
        }
        if (!message.member!.roles.cache.array().includes(role)) { return await fail(message, `Você não possui a role ${role_name}`); }
        if (!config.roles.includes(role.name)) { return await fail(message, `Você não pode adicionar a role ${role_name}.`); }

        // TODO: add timeout to constants.ts
        await message.member!.roles.remove(role);
        await message.delete();
        return await message.channel.send(`A role ${role_name} foi removida.`).then(msg => (msg as Discord.Message).delete({timeout: 3000}));;
    } catch (err) {
        if (err.code === 50013) { // Missing permissions
            return await message.reply("Não tenho permissões pra realizar essa ação");
        }
    } 
};
