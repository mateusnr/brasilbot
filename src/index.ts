import * as Discord from 'discord.js'
import config from './config'
import { monitorReddit, monitorCovid } from './workers'
import { registerAllCommands } from './commands'
import { logger } from './logger'

const SECOND = 1000
const MINUTE = SECOND * 60

const client = new Discord.Client()

client.on('ready', () => {
    if (client.user) {
        logger.info(`Logged in as ${client.user.tag}`)
    } else {
        logger.error('No user!')
    }
})

registerAllCommands(client)

client.login(config.discord.token)

client.once('ready', () => {
    client.setInterval(monitorReddit, 10 * SECOND, client, logger)
    client.setInterval(monitorCovid, 120 * MINUTE, client, logger)
    monitorCovid(client, logger)
})
