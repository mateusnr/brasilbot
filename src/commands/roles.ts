import * as Discord from 'discord.js'
import config from '../config'
import { CommandHandler } from '../command-handler'
import { fail, removeDiacritics } from '../helpers/utils'

interface RoleCommandData {
    role?: Discord.Role
    roleName: string
    user: Discord.GuildMember
}

const findRole = (message: Discord.Message, args: string[]): RoleCommandData => {
    const userIdStr = args[0]
    const mentionOrUserIDPattern = /<?@?!?(\d{17,19})>?/ // only one user can be mentioend, for now
    const isAnyUserMentioned = mentionOrUserIDPattern.test(userIdStr)

    // Checks if a user was mentioned to retrieve the role name
    const roleName = (!isAnyUserMentioned ? args.join(' ') : args.slice(1).join(' '))
    const role = message.guild!.roles.cache.find(i => removeDiacritics(i.name) === removeDiacritics(roleName))
    let user: Discord.GuildMember = message.member!

    if (isAnyUserMentioned) {
        const userId: string = mentionOrUserIDPattern.exec(userIdStr)![1]
        user = message.guild!.members.cache.get(userId)!
    }

    return { role, roleName, user }
}

type RoleCommandHandler =
    (message: Discord.Message, role: Discord.Role, user: Discord.GuildMember) => Promise<void>

function checkRole (fn: RoleCommandHandler): CommandHandler {
    return async (message, args): Promise<void> => {
        try {
            const { role, roleName, user } = findRole(message, args)

            if (!role) {
                if (roleName === '') {
                    fail(message, 'Nenhuma role foi especificada')
                    return
                }

                fail(message, `A role ${roleName} não existe.`)
                return
            }

            fn(message, role, user)
        } catch (err) {
            await message.channel.send(err.code)
            if (err.code === 50013) { // Missing permissions
                fail(message, 'Não tenho permissões pra realizar essa ação')
            }
        }
    }
}

export const addRoleHandler: CommandHandler = checkRole(async (message, role, user) => {
    if (!config.roles.includes(role.name)) {
        return fail(message, `Você não pode adicionar a role **${role.name}**.`)
    }

    if (message.member?.roles.cache.array().includes(role)) {
        return fail(message, `Você já possui a role **${role.name}**`)
    }

    await message.delete()

    await user.roles.add(role)

    const msg = await message.channel.send(`A role **${role.name}** foi adicionada.`)
    msg.delete({ timeout: config.selfDestructMessageTimeoutMs })
})

export const removeRoleHandler: CommandHandler = checkRole(async (message, role, user) => {
    if (!user.roles.cache.array().includes(role)) {
        return fail(message, `Você não possui a role **${role.name}**`)
    }

    await user.roles.remove(role)
    await message.delete()

    const msg = await message.channel.send(`A role **${role.name}** foi removida.`)
    msg.delete({ timeout: config.selfDestructMessageTimeoutMs })
})
