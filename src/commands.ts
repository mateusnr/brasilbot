import Discord from 'discord.js'
import { covidCommand } from './commands/covid'
import { addRole, removeRole } from './commands/roles'
import { addCommandHandler, handleCommands } from './command-handler'

export function registerAllCommands (client: Discord.Client): void {
    addCommandHandler('covid', covidCommand)

    addCommandHandler('add', addRole)
    addCommandHandler('remove', removeRole)

    handleCommands(client)
}
