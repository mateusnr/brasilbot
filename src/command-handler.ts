import Discord from 'discord.js'
import config from './config'
import { logger } from './logger'

export type CommandHandler = (message: Discord.Message, argv: string[]) => Promise<void>

const CommandHandlers: { [key: string]: CommandHandler } = {}

export function addCommandHandler (command: string, handler: CommandHandler): void {
    if (CommandHandlers[command]) {
        throw new Error('The command ' + command + ' is already registered!')
    }

    CommandHandlers[command] = handler
}

export function handleCommands (client: Discord.Client): void {
    client.on('message', async (message: Discord.Message) => {
        if (!message.content.startsWith(config.prefix)) {
            return
        }

        const args = message.content.slice(config.prefix.length).trim().split(/\s+/g)
        const command = args.shift()?.toLowerCase() || ''

        try {
            await CommandHandlers[command](message, args)
        } catch (err) {
            logger.error(err)
        }
    })
}
