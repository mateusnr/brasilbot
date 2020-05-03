import Discord from 'discord.js'
import config from '../config'

export const fail = async (message: Discord.Message, warning: string): Promise<void> => {
    await message.delete()
    const msg = await message.channel.send(warning)
    msg.delete({ timeout: config.selfDestructMessageTimeoutMs })
}

export function removeDiacritics (str: string): string {
    return str.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '')
}

export function formatNumber (n: number): string {
    return new Intl.NumberFormat('pt-BR').format(n)
}
