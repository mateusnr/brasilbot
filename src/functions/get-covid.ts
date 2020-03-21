import Axios from 'axios';
import * as Discord from 'discord.js';

const COVID_MONITOR_URL = 'http://bing.com/covid/data/?setlang=pt-br';
const VIRUS_ICON = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.ftkmj8qzG4U3MUQnptxqoAHaHa%26pid%3DApi&f=1';

interface BingResponse {
    data: {
        areas: {
            id:				string
            displayName:	string
            totalConfirmed: number
            totalDeaths:	number
            totalRecovered: number
            lastUpdated:	string
		}[];
		totalConfirmed:  number;
		totalDeaths:     number;
		totalRecovered:  number;
    }
};

function removeDiacritics(str: String) {
    return str.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, '');
}

export async function getCovidData(countryName: string) {
    const { data: { areas, totalConfirmed, totalDeaths, totalRecovered } }: BingResponse = await Axios.get(COVID_MONITOR_URL)
    const filteredCountryName = removeDiacritics(countryName)
    const areaData = areas.find(a => removeDiacritics(a.displayName) === filteredCountryName);

    if (!areaData) {
        const embed = new Discord.MessageEmbed()
            .setTitle("Não encontrei dados para `" + countryName + "`!")
            .setFooter(`Para ver esta mensagem a qualquer momento, digite \`!covid countryname\`.`);

        return embed
    }

    const readableLastUpdated = new Date(areaData.lastUpdated).toLocaleString('pt-BR');

    const embed = new Discord.MessageEmbed()
        .setAuthor("Últimas atualizações sobre o Coronavírus", VIRUS_ICON)
        .setTitle(`Casos de Coronavírus: ${areaData.displayName}`)
        .addField("Confirmados", areaData.totalConfirmed)
        .addField("Recuperados", areaData.totalRecovered)
        .addField("Mortes", areaData.totalDeaths)
        .setFooter(`Última atualização em ${readableLastUpdated}.\nPara ver esta mensagem a qualquer momento, digite \`!covid countryname\`.`);

    return embed
}
