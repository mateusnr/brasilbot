import * as Discord from "discord.js";
import * as Winston from "winston";
import config from "../config";
import { getCorona } from '../functions/get-corona'


const CORONA_CHANNEL = 'covid-19'

export const monitorCorona = async (client: Discord.Client, logger: Winston.Logger) => {
  try {
    const brData = await getCorona('brazil')
    const guild = client.guilds.cache.get(config.discord.guild_id)
    if (!guild) {
      return logger.warn(`Could not find guild with id ${config.discord.guild_id}`);
    }

    const channel = guild.channels.cache.find(channel => channel.name === CORONA_CHANNEL) as Discord.TextChannel;
    if (!channel) {
      return logger.warn(`Could not find channel with name ${config.discord.channel}`);
    }
    await channel.send(brData);
  } catch (err) {
    logger.warn(err)
  }
  return;
}
