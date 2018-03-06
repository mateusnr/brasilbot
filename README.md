# Brasil Bot
> hue

## Dependências
1. [Node.js 9+](https://nodejs.org/en/)

## Instalação
1. `git clone https://github.com/Kxze/brasilbot.git`
2. `cd brasilbot`
3. `npm install`

## Configuração
O arquivo de configuração se encontra em `./src/config.ts`

- `prefix` - Prefixo dos comandos do bot
- `roles` - Array com o nome das roles que podem ser adicionadas através do comando `add`
- `token` - Token de login do Discord
- `reddit` - Credenciais do reddit
- `discord.guild` - Nome do servidor em que o bot postará os anúncios
- `discord.channel` - Nome do canal em que o bot postará os anúncios

## Credenciais
- [Como conseguir as credenciais do Discord](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)

### Credenciais do reddit
https://github.com/reddit-archive/reddit/wiki/OAuth2#getting-started

1. Criar um aplicativo em https://www.reddit.com/prefs/apps
2. Copiar o client id e client secret para o arquivo de configuração
3. Criar um usuário e o adicionar ao aplicativo como desenvolvedor

## Rodando o bot
1. `npm start`
