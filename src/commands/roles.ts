import * as Discord from 'discord.js'
import config from '../config'
import { CommandHandler } from '../command-handler'

interface MaybeRoleData {
    role?: Discord.Role
    roleName: string
}

interface RoleData {
    role: Discord.Role
    roleName: string
}

const fail = async (message: Discord.Message, warning: string): Promise<void> => {
    await message.delete()
    const msg = await message.channel.send(warning)
    msg.delete({ timeout: config.selfDestructMessageTimeoutMs })
}

const findRole = (message: Discord.Message, args: string[]): MaybeRoleData => {
    const roleName = args.join(' ')

    const role = message.guild!.roles.cache.find(i => i.name === roleName)

    return { role, roleName }
}

type RoleCommandHandler =
    (message: Discord.Message, roleData: RoleData) => Promise<void>

function checkRole (fn: RoleCommandHandler): CommandHandler {
    return async (message, args): Promise<void> => {
        try {
            const { role, roleName } = findRole(message, args)

            if (!role) {
                if (roleName === '') {
                    fail(message, 'Nenhuma role foi especificada')
                    return
                }

                fail(message, `A role ${roleName} não existe.`)
                return
            }

            fn(message, { role, roleName })
        } catch (err) {
            await message.channel.send(err.code)
            if (err.code === 50013) { // Missing permissions
                message.reply('Não tenho permissões pra realizar essa ação')
            }
        }
    }
}

export const addRoleHandler: CommandHandler = checkRole(async (message, { role, roleName }) => {
    if (!config.roles.includes(role.name)) {
        await fail(message, `Você não pode adicionar a role ${roleName}.`)
        return
    }

    await message.delete()

    await message.member!.roles.add(role)

    const msg = await message.channel.send(`A role ${roleName} foi adicionada.`)
    msg.delete({ timeout: config.selfDestructMessageTimeoutMs })
})

export const removeRoleHandler: CommandHandler = checkRole(async (message, { role, roleName }) => {
    if (!message.member!.roles.cache.array().includes(role)) {
        return fail(message, `Você não possui a role ${roleName}`)
    }

    await message.member!.roles.remove(role)
    await message.delete()

    const msg = await message.channel.send(`A role ${roleName} foi removida.`)
    msg.delete({ timeout: config.selfDestructMessageTimeoutMs })
})
