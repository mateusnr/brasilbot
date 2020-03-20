import * as Discord from 'discord.js'
import { getCorona } from '../functions/get-corona'

export async function corona (message: Discord.Message, [countryName]: string[]) {
  const countryData = await getCorona(countryName || 'brazil')
  message.channel.send(countryData)
}
