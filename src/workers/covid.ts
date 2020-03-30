import * as Discord from 'discord.js'
import * as Winston from 'winston'
import config from '../config'
import { getCovidData } from '../functions/get-covid'

const COVID_CHANNEL_NAME = 'covid-19'

export const monitorCovid = async (client: Discord.Client, logger: Winston.Logger) => {
    try {
        const brData = await getCovidData('Brasil')
        const guild = client.guilds.cache.get(config.discord.guild_id)
        if (!guild) {
            return logger.warn(`Could not find guild with id ${config.discord.guild_id}`)
        }

        const channel = guild.channels.cache.find(channel => channel.name === COVID_CHANNEL_NAME) as Discord.TextChannel
        if (!channel) {
            return logger.warn(`Could not find channel with name ${config.discord.channel}`)
        }
        await channel.send(brData)
    } catch (err) {
        logger.warn(err)
    }
}
