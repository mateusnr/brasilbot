import * as Discord from "discord.js";
import * as Winston from "winston";
import config from "../config";
import Axios from 'axios'


const CORONA_MONITOR = 'https://coronavirus-tracker-api.herokuapp.com/v2/locations/35'
const VIRUS_ICON = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.ftkmj8qzG4U3MUQnptxqoAHaHa%26pid%3DApi&f=1'


export const monitorCorona = async (client: Discord.Client, logger: Winston.Logger) => {
  try {
    const { data } = await Axios.get(CORONA_MONITOR)
    const embed = new Discord.RichEmbed;
    embed.setAuthor("Últimas atualizações sobre o Coronavírus", VIRUS_ICON)
    embed.setTitle("Casos de Coronavírus no Brasil")
    embed.addField("Confirmados", data.location.latest.confirmed)
    embed.addField("Recuperados", data.location.latest.recovered)
    embed.addField("Mortes", data.location.latest.deaths)

      // Find the correct
      const guild = client.guilds.find(guild => guild.id === config.discord.guild_id) as Discord.Guild;
      if (!guild) {
          return logger.warn(`Could not find guild with id ${config.discord.guild_id}`);
      }

      const channel = guild.channels.find(channel => channel.name === 'covid-19') as Discord.TextChannel;
      if (!channel) {
          return logger.warn(`Could not find channel with name ${config.discord.channel}`);
      }
      await channel.send(embed);
  } catch (err) {
      logger.warn(err);
  }
  return;
}
