import * as dotenv from 'dotenv-safe'
import BRAZILIAN_STATES_ROLES from './constants/state-roles.json'
import GENDER_PRONOUNS_ROLES from './constants/gender-roles.json'
import AVAILABLE_ROLES from './constants/available-roles.json'

dotenv.config()

export default {
    selfDestructMessageTimeoutMs: 3000,
    prefix: '!',
    roles: [...BRAZILIAN_STATES_ROLES, ...GENDER_PRONOUNS_ROLES, ...AVAILABLE_ROLES],
    adminRoles: ['Moderador do Discord', 'Moderador do Sub'],
    reddit: {
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD,
        titleCharLimit: 256
    },
    discord: {
        guild_id: process.env.DISCORD_GUILD_ID as string,
        channel: 'reddit',
        token: process.env.DISCORD_TOKEN
    }
}
