import { CommandHandler } from '../command-handler'

export const massUnbanHandler: CommandHandler = async (message, _) => {
    const userId = message.author.id
    const botCreatorId = '233342139889614848'
    const guild = message.guild

    if (userId !== botCreatorId) {
        await message.channel.send('Você não é o Mateus pra rodar esse comando')
    }

    const banList = guild!.fetchBans().then(coll => {
        coll.each(async ban => {
            await guild!.members.unban(ban.user).then()
        })
    })
        .catch(async err => {
            if (err.code === 50013) {
                await message.channel.send('Não tenho permissões suficientes para isso!')
            }
        })
}
