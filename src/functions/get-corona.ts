import Axios from 'axios'
import * as Discord from 'discord.js'

const CORONA_MONITOR = 'https://bing.com/covid/data'
const VIRUS_ICON = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.ftkmj8qzG4U3MUQnptxqoAHaHa%26pid%3DApi&f=1'

interface BingResponse {
  data: {
    areas: {
      id: string
      displayName: string
      totalConfirmed: number
      totalDeaths: number
      totalRecovered: number
      lastUpdated: string
    }[]
  }
}

export async function getCorona (id: string) {
  const { data: { areas } }: BingResponse = await Axios.get(CORONA_MONITOR)
  const areaData = areas.find(a => a.id === id)

  if (!areaData) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Não encontrei dados para `" + id + "`!")
      .setFooter(`Para ver esta mensagem a qualquer momento, digite \`!corona countryname\`.`)

    return embed
  }

  const embed = new Discord.MessageEmbed()
    .setAuthor("Últimas atualizações sobre o Coronavírus", VIRUS_ICON)
    .setTitle("Casos de Coronavírus " + (id === 'brazil' ? 'no Brasil' : `em ${areaData.displayName}`))
    .addField("Confirmados", areaData.totalConfirmed)
    .addField("Recuperados", areaData.totalRecovered)
    .addField("Mortes", areaData.totalDeaths)
    .setFooter(`Última atualização em ${areaData.lastUpdated}. Para ver esta mensagem a qualquer momento, digite \`!corona countryname\`.`)

  return embed
}
