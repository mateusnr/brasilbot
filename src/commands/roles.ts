import * as Discord from 'discord.js'
import config from '../config'

interface RoleData {
    role?: Discord.Role
    roleName: string
}

const fail = async (message: Discord.Message, warning: string): Promise<Discord.Message> => {
    await message.delete()
    return message.channel.send(warning).then(msg => (msg).delete({ timeout: 3000 }))
}

const findRole = (message: Discord.Message, args: string[]): RoleData => {
    const roleName = args.join(' ')

    const role = message.guild!.roles.cache.find(i => i.name === roleName)

    return { role, roleName }
}

// FIXME: Repeated code

export const addRole = async (message: Discord.Message, args: string[]): Promise<Discord.Message> => {
    try {
        const { role, roleName } = findRole(message, args)

        if (!role) {
            if (roleName === '') {
                return fail(message, 'Nenhuma role foi especificada')
            }

            return fail(message, `A role ${roleName} não existe.`)
        }

        if (!config.roles.includes(role.name)) {
            return fail(message, `Você não pode adicionar a role ${roleName}.`)
        }

        await message.delete()
        await message.member!.roles.add(role)
        return message.channel.send(`A role ${roleName} foi adicionada.`).then(msg => (msg).delete({ timeout: 3000 }))
    } catch (err) {
        const msg = await message.channel.send(err.code)
        if (err.code === 50013) { // Missing permissions
            return message.reply('Não tenho permissões pra realizar essa ação')
        } else {
            return msg
        }
    }
}

export const removeRole = async (message: Discord.Message, args: string[]): Promise<Discord.Message> => {
    try {
        const { role, roleName } = findRole(message, args)

        if (!role) {
            if (roleName === '') {
                return await fail(message, 'Nenhuma role foi especificada')
            }

            return await fail(message, `A role ${roleName} não existe.`)
        }
        if (!message.member!.roles.cache.array().includes(role)) { return await fail(message, `Você não possui a role ${roleName}`) }
        if (!config.roles.includes(role.name)) { return await fail(message, `Você não pode adicionar a role ${roleName}.`) }

        // TODO: add timeout to constants.ts
        await message.member!.roles.remove(role)
        await message.delete()
        return await message.channel.send(`A role ${roleName} foi removida.`).then(msg => (msg).delete({ timeout: 3000 }))
    } catch (err) {
        const msg = await message.channel.send(err.code)
        if (err.code === 50013) { // Missing permissions
            return message.reply('Não tenho permissões pra realizar essa ação')
        } else {
            return msg
        }
    }
}
