import * as Discord from 'discord.js'
import config from '../config'
import { CommandHandler } from '../command-handler'
import { fail, removeDiacritics } from '../helpers/utils'

const findRole = (message: Discord.Message, args: string[]): { role?: Discord.Role; roleName: string } => {
    const roleName = args.join(' ')

    const role = message.guild!.roles.cache.find(i => removeDiacritics(i.name) === removeDiacritics(roleName))

    return { role, roleName }
}

type RoleCommandHandler =
    (message: Discord.Message, role: Discord.Role) => Promise<void>

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

            fn(message, role)
        } catch (err) {
            await message.channel.send(err.code)
            if (err.code === 50013) { // Missing permissions
                message.reply('Não tenho permissões pra realizar essa ação')
            }
        }
    }
}

export const addRoleHandler: CommandHandler = checkRole(async (message, role) => {
    if (!config.roles.includes(role.name)) {
        return fail(message, `Você não pode adicionar a role **${role.name}**.`)
    }

    if (message.member?.roles.cache.array().includes(role)) {
        return fail(message, `Você já possui a role **${role.name}**`)
    }

    await message.delete()

    await message.member!.roles.add(role)

    const msg = await message.channel.send(`A role **${role.name}** foi adicionada.`)
    msg.delete({ timeout: config.selfDestructMessageTimeoutMs })
})

export const removeRoleHandler: CommandHandler = checkRole(async (message, role) => {
    if (!message.member!.roles.cache.array().includes(role)) {
        return fail(message, `Você não possui a role **${role.name}**`)
    }

    await message.member!.roles.remove(role)
    await message.delete()

    const msg = await message.channel.send(`A role **${role.name}** foi removida.`)
    msg.delete({ timeout: config.selfDestructMessageTimeoutMs })
})
