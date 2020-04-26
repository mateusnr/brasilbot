import Axios from 'axios'
import * as Discord from 'discord.js'
import { logger } from '../logger'

const COVID_MONITOR_URL = 'https://www.bing.com/covid/?setlang=pt-br'
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

function removeDiacritics (str: string): string {
    return str.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '')
}

function formatNumber (n: number): string {
    return new Intl.NumberFormat('pt-BR').format(n)
}

function searchArea (areaInfo: AreaInfo, input: string, comparator: (area: AreaInfo) => boolean): AreaInfo | undefined {
    if (comparator(areaInfo)) {
        return areaInfo
    }

    for (const area of areaInfo.areas) {
        const found = searchArea(area, input, comparator)

        if (found) return found
    }

    return undefined
}

/*
    An area's full name is defined as the place it's contained in
    In technical terms, it is the display name of the area and its parent

    Examples include: Lombardy, Italy; NYC, NY, United States
*/
function getAreaFullName (areaInfo: AreaInfo, worldData: AreaInfo): string {
    let fullName = areaInfo.displayName
    let tempArea = areaInfo

    while (tempArea.parentId !== 'world') {
        tempArea = searchArea(worldData, tempArea.parentId, (area) => {
            return area.id === tempArea.parentId
        })!

        fullName += `, ${tempArea.displayName}`
    }

    return fullName
}

function createCovidEmbed (areaData: AreaInfo, worldData: AreaInfo): Discord.MessageEmbed {
    const {
        totalConfirmed,
        totalRecovered,
        totalDeaths,
        totalConfirmedDelta,
        totalRecoveredDelta,
        totalDeathsDelta
    } = areaData

    const lastUpdated = new Date(areaData.lastUpdated).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    const confirmedDeltaStr = ` **(+${formatNumber(totalConfirmedDelta)})**`
    const recoveredDeltaStr = ` **(+${formatNumber(totalRecoveredDelta)})**`
    const deathsDeltaStr = ` **(+${formatNumber(totalDeathsDelta)})**`

    const embed = new Discord.MessageEmbed()
        .setColor('RED')
        .setAuthor('Últimas atualizações sobre o COVID-19', VIRUS_ICON)
        .setURL(`https://www.bing.com/covid/local/${areaData.id}`)
        .setTitle(`Casos de Coronavírus: ${getAreaFullName(areaData, worldData)}`)
        .addField('Confirmados',
            `${formatNumber(totalConfirmed)}` + (totalConfirmedDelta ? confirmedDeltaStr : ''), true)
        .addField('Recuperados',
            `${formatNumber(totalRecovered)}` + (totalRecoveredDelta ? recoveredDeltaStr : ''), true)
        .addField('Mortes',
            `${formatNumber(totalDeaths)}` + (totalDeathsDelta ? deathsDeltaStr : ''), true)
        .addField('\u200b', '\u200b')
        .addField('Taxa de mortalidade', `${((totalDeaths / totalConfirmed) * 100).toFixed(2)}%`, true)
        .addField('Taxa de recuperação', `${((totalRecovered / totalConfirmed) * 100).toFixed(2)}%`, true)
        .setFooter(`Última atualização em ${lastUpdated} BRT.\nPara ver esta mensagem a qualquer momento, digite \`!covid countryname\`.`)

    return embed
}
/*
    As Bing's data JSON is being return in the source, there's a separate function to parse it
*/
const fetchCovidData = async (): Promise<AreaInfo> => {
    const responseHtml: string = (await Axios.get(COVID_MONITOR_URL)).data
    const regex = /var data=(.*);/g

    const covidJson: AreaInfo = JSON.parse(regex.exec(responseHtml)![1])

    return covidJson
}

export async function getCovidDataAndEmbed (countryName: string): Promise<Discord.MessageEmbed> {
    // Bing's API lately hasn't been that much stable regarding availability but we managed to find a fallback
    const bingData: AreaInfo = await fetchCovidData().catch(err => {
        logger.warn(`Error while fetching from Bing: ${err}`)
        return Axios.get(COVID_MONITOR_FALLBACK_URL).then(response => {
            return response.data
        })
    })

    const filteredCountryName = removeDiacritics(countryName)
    const areaData = searchArea(bingData, filteredCountryName, (area) => {
        return filteredCountryName === removeDiacritics(area.displayName) || removeDiacritics(area.displayName) === COUNTRY_ALIASES[filteredCountryName]
    })

    if (!areaData) {
        const embed = new Discord.MessageEmbed()
            .setTitle('Não encontrei dados para `' + countryName + '`!')
            .setFooter('Para ver esta mensagem a qualquer momento, digite `!covid countryname`.')

        return embed
    }

    return createCovidEmbed(areaData, bingData)
}
