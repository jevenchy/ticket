import { ChannelType } from 'discord.js'
import type { CategoryChannel, Client, TextChannel } from 'discord.js'
import { ticketCategoryId, ticketTranscriptChannelId } from '../config/config.js'
import { TICKET_SETTINGS } from '../config/ticketConfig.js'
import { fetchChannel } from '../utils/discord.js'
import { LOGGER } from '../utils/logger.js'
import { clearTicketData, closeTicket, getTicketData, getTicketType, sendTicketTranscript } from './ticketService.js'

const checkInactiveTickets = async (client: Client): Promise<void> => {
  const isAutoCloseEnabled = TICKET_SETTINGS.autoCloseHours > 0
  const isAutoDeleteEnabled = TICKET_SETTINGS.shouldAutoDelete && TICKET_SETTINGS.autoDeleteHours > 0
  if (!isAutoCloseEnabled && !isAutoDeleteEnabled) return

  const transcriptChannel = await fetchChannel<TextChannel>(client, ticketTranscriptChannelId)
  if (!transcriptChannel) return

  const category = await fetchChannel<CategoryChannel>(client, ticketCategoryId)
  if (!category || category.type !== ChannelType.GuildCategory) return

  const now = Date.now()
  const closeCutoff = now - TICKET_SETTINGS.autoCloseHours * 60 * 60 * 1000
  const deleteCutoff = now - TICKET_SETTINGS.autoDeleteHours * 60 * 60 * 1000

  for (const channel of category.children.cache.values()) {
    if (channel.type !== ChannelType.GuildText) continue

    const topicData = await getTicketData(channel)
    if (!topicData) continue

    const ticketType = getTicketType(topicData.type)
    if (!ticketType) continue

    const lastMessages = await channel.messages.fetch({ limit: 1 })
    const lastTimestamp = lastMessages.first()?.createdTimestamp ?? channel.createdTimestamp ?? 0

    if (topicData.status === 'open') {
      if (isAutoCloseEnabled && lastTimestamp < closeCutoff) {
        LOGGER.warn('Auto-closing inactive ticket', { channel: channel.name, channelId: channel.id })
        await closeTicket(channel, topicData)
        await sendTicketTranscript(channel, ticketType, { ...topicData, status: 'closed' }, transcriptChannel)
      }
      continue
    }

    if (isAutoDeleteEnabled && lastTimestamp < deleteCutoff) {
      if (topicData.status === 'closed') {
        await sendTicketTranscript(channel, ticketType, topicData, transcriptChannel)
      }
      LOGGER.warn('Auto-deleting inactive ticket', { channel: channel.name, channelId: channel.id })
      clearTicketData(channel.id)
      await channel.delete().catch((error: unknown) => LOGGER.error('Failed to delete inactive ticket', { channelId: channel.id, error }))
    }
  }
}

export const startTicketScheduler = (client: Client): void => {
  setInterval(() => {
    checkInactiveTickets(client).catch((error: unknown) => LOGGER.error('Auto-close check failed', { error }))
  }, TICKET_SETTINGS.autoCloseCheckIntervalMinutes * 60 * 1000)
}
