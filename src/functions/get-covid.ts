import Axios from 'axios';
import * as Discord from 'discord.js';

const COVID_MONITOR_URL = 'http://bing.com/covid/data/?setlang=pt-br';
const VIRUS_ICON = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.ftkmj8qzG4U3MUQnptxqoAHaHa%26pid%3DApi&f=1';

interface AreaInfo {
    id:				string;
    displayName:	string;
    totalConfirmed: number;
    totalDeaths:	number;
    totalRecovered: number;
    lastUpdated:	string;
}

interface BingResponse {
    data: {
        areas: AreaInfo[];
        totalConfirmed:  number;
        totalDeaths:     number;
        totalRecovered:  number;
        lastUpdated:	string;
    };
};

function removeDiacritics(str: String) {
    return str.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, '');
}

function createCovidEmbed(bingData: BingResponse, areaData?: AreaInfo){
    const {
        totalConfirmed,
        totalRecovered,
        totalDeaths
    } = areaData || bingData.data
    
    const lastUpdated = new Date (areaData?.lastUpdated || bingData.data.lastUpdated).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo'});

    const embed = new Discord.MessageEmbed()
        .setColor('RED')
        .setAuthor("Últimas atualizações sobre o Coronavírus", VIRUS_ICON)
        .setTitle(`Casos de Coronavírus: ${areaData?.displayName || "Global"}`)
        .addField("Confirmados", totalConfirmed)
        .addField("Recuperados", totalRecovered)
        .addField("Mortes", totalDeaths)
        .setFooter(`Última atualização em ${lastUpdated} BRT.\nPara ver esta mensagem a qualquer momento, digite \`!covid countryname\`.`);

    return embed;

}

export async function getCovidData(countryName: string) {
    const bingData: BingResponse = await Axios.get(COVID_MONITOR_URL)
    const { data: { areas } }: BingResponse = bingData;

    const filteredCountryName = removeDiacritics(countryName);
    const areaData = areas.find(a => removeDiacritics(a.displayName) === filteredCountryName);

    if (!areaData) {
        // user asked for worlwide info
        if (filteredCountryName === "global")
            return createCovidEmbed(bingData, areaData);

        const embed = new Discord.MessageEmbed()
            .setTitle("Não encontrei dados para `" + countryName + "`!")
            .setFooter(`Para ver esta mensagem a qualquer momento, digite \`!covid countryname\`.`);

        return embed;
    }


    return createCovidEmbed(bingData, areaData);
}
