import { Client, GatewayIntentBits, RESTEvents } from 'discord.js'
import { token } from '../config/config.js'
import interactionCreate from '../events/interactionCreate.js'
import ready from '../events/ready.js'
import { LOGGER } from '../utils/logger.js'

export const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})

export const start = async (): Promise<void> => {
  client.once(ready.name, () => ready.execute(client))
  client.on(interactionCreate.name, (interaction) => interactionCreate.execute(interaction))

  client.rest.on(RESTEvents.RateLimited, (rateLimitInfo) => {
    LOGGER.warn('REST rate limited', { method: rateLimitInfo.method, route: rateLimitInfo.route, retryAfter: rateLimitInfo.retryAfter })
  })

  try {
    await client.login(token)
  } catch (error) {
    LOGGER.error('Discord authentication failed', { error })
    process.exit(1)
  }
}
