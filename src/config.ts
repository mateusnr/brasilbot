import { TOKEN } from './secret'
import BRAZILIAN_STATES_ROLES from './constants/state-roles.json'
import GENDER_PRONOUNS_ROLES from './constants/gender-roles.json'

export default {
    prefix: '!',
    roles: [...BRAZILIAN_STATES_ROLES, ...GENDER_PRONOUNS_ROLES],
    token: TOKEN,
    reddit: {
        clientId: '-FWI0u-CL7U-tQ',
        clientSecret: 'o13fNTPHsxSiTC7JyWxRkmJAGYU',
        username: 'honcripatbot',
        password: '123456',
        titleCharLimit: 256
    },
    discord: {
        guild_id: '409519700750630922',
        channel: 'reddit'
    }
}
