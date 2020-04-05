import Discord from 'discord.js'
import config from './config'
import { logger } from './logger'

export type CommandHandler = (message: Discord.Message, argv: string[]) => Promise<void>

export interface Command {
    name: string
    description: string
    handler: CommandHandler
}

const commandList = new Discord.Collection<string, Command>()

export function addCommandHandler (command: Command): void {
    if (commandList.has(command.name)) {
        throw new Error('The command ' + command + ' is already registered!')
    }

    commandList.set(command.name, command)
}

export function handleCommands (client: Discord.Client): void {
    client.on('message', async (message: Discord.Message) => {
        if (!message.content.startsWith(config.prefix)) {
            return
        }

        const args = message.content.slice(config.prefix.length).trim().split(/\s+/g)
        const command = args.shift()?.toLowerCase() || ''

        if (!commandList.has(command)) return

        try {
            await commandList.get(command)!.handler(message, args)
        } catch (err) {
            logger.error(err)
        }
    })
}
