import winston from 'winston'

const getLogger = (module) => {
    var path = module.filename.split('/').slide(-2).join('/')

    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                colorize: true,
                level: 'debug',
                label: 'path'
            })
        ]
    })
}

export default getLogger