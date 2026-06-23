import type { Channel, Client, User } from 'discord.js'
import { LOGGER } from './logger.js'

export const DISCORD_ERROR_CODES = {
  unknownChannel: 10003,
  missingAccess: 50001,
  missingPermissions: 50013
} as const

export const fetchChannel = async <T extends Channel = Channel>(
  client: Client,
  channelId: string
): Promise<T | null> => {
  try {
    return (await client.channels.fetch(channelId)) as T | null
  } catch (error) {
    const code = (error as { code?: number }).code
    if (code === DISCORD_ERROR_CODES.missingAccess) {
      LOGGER.error('Cannot view this channel. Grant the bot View Channel permission.', { channelId })
    } else if (code === DISCORD_ERROR_CODES.unknownChannel) {
      LOGGER.error('Unknown channel. The channel may have been deleted.', { channelId })
    } else {
      LOGGER.error('Failed to fetch channel', { channelId, error })
    }
    return null
  }
}

export const getEmbedFooter = (botUser: User): { text: string, iconURL: string } => ({
  text: botUser.username,
  iconURL: botUser.displayAvatarURL({ size: 64 })
})
