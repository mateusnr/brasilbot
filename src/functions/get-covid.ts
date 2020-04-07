import Axios from 'axios'
import * as Discord from 'discord.js'
import { logger } from '../logger'

const COVID_MONITOR_URL = 'https://www.bing.com/covid/data?setlang=pt-br'
const COVID_MONITOR_FALLBACK_URL = 'https://conteudos.xpi.com.br/wp-json/xpinsights/v1/coronavirus'
const VIRUS_ICON = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.ftkmj8qzG4U3MUQnptxqoAHaHa%26pid%3DApi&f=1'
const COUNTRY_ALIASES: {[key: string]: string} = {
    eua: 'estados unidos',
    holanda: 'paises baixos',
    china: 'china continental',
    mundo: 'global'
}

interface AreaInfo {
    id: string
    displayName: string
    totalConfirmed: number
    totalDeaths: number
    totalRecovered: number
    totalConfirmedDelta: number
    totalDeathsDelta: number
    totalRecoveredDelta: number
    lastUpdated: string
    areas: AreaInfo[]
    parentId: string
}

interface BingResponse {
    data: AreaInfo
}

function removeDiacritics (str: string): string {
    return str.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '')
}

function formatNumber (n: number): string {
    return new Intl.NumberFormat('pt-BR').format(n)
}

function searchArea (areaInfo: AreaInfo, areaName: string): AreaInfo | undefined {
    if (removeDiacritics(areaInfo.displayName) === removeDiacritics(areaName)) {
        return areaInfo
    } else if (areaName in COUNTRY_ALIASES) {
        if (removeDiacritics(areaInfo.displayName) === COUNTRY_ALIASES[areaName]) {
            return areaInfo
        }
    }

    for (const area of areaInfo.areas) {
        const found = searchArea(area, areaName)

        if (found) return found
    }

    return undefined
}

function createCovidEmbed (areaData: AreaInfo): Discord.MessageEmbed {
    const {
        totalConfirmed,
        totalRecovered,
        totalDeaths,
        totalConfirmedDelta,
        totalRecoveredDelta,
        totalDeathsDelta
    } = areaData

    const lastUpdated = new Date(areaData.lastUpdated).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    const embed = new Discord.MessageEmbed()
        .setColor('RED')
        .setAuthor('Últimas atualizações sobre o COVID-19', VIRUS_ICON)
        .setURL(`https://www.bing.com/covid/local/${areaData.id}`)
        .setTitle(`Casos de Coronavírus: ${areaData?.displayName}`)
        .addField('Confirmados', `${formatNumber(totalConfirmed)} **(+${formatNumber(totalConfirmedDelta)})**`, true)
        .addField('Recuperados', `${formatNumber(totalRecovered)} **(+${formatNumber(totalRecoveredDelta)})**`, true)
        .addField('Mortes', `${formatNumber(totalDeaths)} **(+${formatNumber(totalDeathsDelta)})**`, true)
        .addField('\u200b', '\u200b')
        .addField('Taxa de mortalidade', `${((totalDeaths / totalConfirmed) * 100).toFixed(2)}%`, true)
        .addField('Taxa de recuperação', `${((totalRecovered / totalConfirmed) * 100).toFixed(2)}%`, true)
        .setFooter(`Última atualização em ${lastUpdated} BRT.\nPara ver esta mensagem a qualquer momento, digite \`!covid countryname\`.`)

    return embed
}

// TODO: Change function names

export async function getCovidData (countryName: string): Promise<Discord.MessageEmbed> {
    // Bing's API lately hasn't been that much stable regarding availability but we managed to find a fallback
    const bingData: BingResponse = await Axios.get(COVID_MONITOR_URL)
        .catch(err => {
            logger.warn(`Error ${err.response.status} when fetching data from Bing's API`)
            return Axios.get(COVID_MONITOR_FALLBACK_URL)
        })

    const filteredCountryName = removeDiacritics(countryName)
    const areaData = searchArea(bingData.data, filteredCountryName)

    if (!areaData) {
        const embed = new Discord.MessageEmbed()
            .setTitle('Não encontrei dados para `' + countryName + '`!')
            .setFooter('Para ver esta mensagem a qualquer momento, digite `!covid countryname`.')

        return embed
    }

    return createCovidEmbed(areaData)
}
