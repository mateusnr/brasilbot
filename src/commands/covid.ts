import { getCovidDataAndEmbed } from '../helpers/get-covid'
import { CommandHandler } from '../command-handler'

export const covidCommandHandler: CommandHandler = async (message, countryName) => {
    const cName = countryName.join(' ')
    const countryData = await getCovidDataAndEmbed(cName || 'Brasil')
    message.channel.send(countryData)
}
