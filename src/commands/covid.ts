import { getCovidData } from '../functions/get-covid'
import { CommandHandler, Command } from '../command-handler'

export const covidCommandHandler: CommandHandler = async (message, countryName) => {
    const cName = countryName.join(' ')
    const countryData = await getCovidData(cName || 'Brasil')
    message.channel.send(countryData)
}

export const covidCommand: Command = {
    name: 'covid',
    description: 'Returns info about regions infected with COVID-19',
    handler: covidCommandHandler
}
