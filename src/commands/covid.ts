import * as Discord from 'discord.js'
import { getCovidData } from '../functions/get-covid'

export async function sendCovidData (message: Discord.Message, countryName: string[]): Promise<void> {
    const cName = countryName.join(' ')
    const countryData = await getCovidData(cName || 'Brasil')
    message.channel.send(countryData)
}
