const { createLogger, transports, format} = require('winston');
require('winston-mongodb');
require("dotenv").config()
const {DATABASE_URL} = process.env 

const myFormat = format.printf(({ level, message, timestamp, userId }) => {
    return `[${timestamp}]: ${level}: User ID ${userId}: ${message}`;
  });

const logger = createLogger({
    transports:[
        new transports.File({
            filename : 'logging/logs/server.log',
            level: 'info',
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                  }),
                format.json(),
                myFormat
            )
        }),
        new transports.File({
            filename :'logging/logs/errors.log',
            level : 'error',
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                  }),
                format.json(),
                myFormat
            )
        }),
        new transports.MongoDB({
            level: 'info',
            db: DATABASE_URL,
            collection:'server_logs',
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                  }),
                format.json(),
                format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
            )
        }),
        new transports.MongoDB({
            level: 'error',
            db: DATABASE_URL,
            collection:'server_errors',
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                  }),
                format.json(),
                format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
            )
        }),
    ]
})

module.exports = logger;