import * as Discord from 'discord.js'
import { getCorona } from '../functions/get-corona'

export async function corona (message: Discord.Message, countryName: string[]) {
  const cName = countryName.join(" ");
  const countryData = await getCorona(cName || 'Brasil');
  message.channel.send(countryData);
}
