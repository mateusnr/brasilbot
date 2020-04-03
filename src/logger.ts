import * as winston from 'winston'

const format = winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
export const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        format
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'bot.log' })
    ]
})
