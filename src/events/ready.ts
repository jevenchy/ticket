import type { Client, TextChannel } from 'discord.js'
import { ticketPanelChannelId, ticketTranscriptChannelId } from '../config/config.js'
import { startTicketScheduler } from '../services/ticketSchedulerService.js'
import { postTicketPanel } from '../services/ticketService.js'
import { DISCORD_ERROR_CODES, fetchChannel } from '../utils/discord.js'
import { LOGGER } from '../utils/logger.js'

export default {
  name: 'clientReady',
  async execute(client: Client): Promise<void> {
    LOGGER.info('Logged in', { tag: client.user!.tag })

    if (client.guilds.cache.size === 0) {
      LOGGER.info('Bot is not in any guild.')
    }

    const panelChannel = await fetchChannel<TextChannel>(client, ticketPanelChannelId)
    if (!panelChannel) {
      LOGGER.error('Ticket panel channel could not be loaded.', { channelId: ticketPanelChannelId })
      process.exit(1)
    }

    try {
      await postTicketPanel(client, panelChannel)
      LOGGER.info('Ticket panel', { name: panelChannel.name, channelId: panelChannel.id })
    } catch (error) {
      if ((error as { code?: number }).code === DISCORD_ERROR_CODES.missingPermissions) {
        LOGGER.error('Missing permissions to send messages in the ticket panel channel.', { name: panelChannel.name, channelId: panelChannel.id })
      } else {
        LOGGER.error('Failed to post ticket panel', { channelId: panelChannel.id, error })
      }
      process.exit(1)
    }

    const transcriptChannel = await fetchChannel<TextChannel>(client, ticketTranscriptChannelId)
    if (!transcriptChannel) {
      LOGGER.error('Ticket transcript channel could not be loaded.', { channelId: ticketTranscriptChannelId })
      process.exit(1)
    }

    LOGGER.info('Ticket transcript channel', { name: transcriptChannel.name, channelId: transcriptChannel.id })

    startTicketScheduler(client)
  }
}
