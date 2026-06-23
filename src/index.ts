import { client, start } from './core/app.js'
import { LOGGER } from './utils/logger.js'

process.on('unhandledRejection', (error) => {
  LOGGER.error('Unhandled rejection', { error })
})

const shutdown = async (): Promise<void> => {
  LOGGER.info('Shutting down')
  await client.destroy()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

start()
