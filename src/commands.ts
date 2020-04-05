import Discord from 'discord.js'
import { covidCommandHandler } from './commands/covid'
import { addRoleHandler, removeRoleHandler } from './commands/roles'
import { addCommandHandler, handleCommands, Command } from './command-handler'

const addRole: Command = {
    name: 'add',
    description: 'Gives a self assignable role to the user who issued the command',
    handler: addRoleHandler
}

const removeRole: Command = {
    name: 'remove',
    description: 'Removes a self assignable role to the user who issued the command',
    handler: removeRoleHandler
}

const covidCommand: Command = {
    name: 'covid',
    description: 'Returns info about regions infected with COVID-19',
    handler: covidCommandHandler
}

export function registerAllCommands (client: Discord.Client): void {
    addCommandHandler(covidCommand)

    addCommandHandler(addRole)
    addCommandHandler(removeRole)

    handleCommands(client)
}
