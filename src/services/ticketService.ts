import { AttachmentBuilder, ChannelType, OverwriteType, PermissionFlagsBits } from 'discord.js'
import type { Client, Guild, Message, TextChannel, User } from 'discord.js'
import { ticketCategoryId, ticketStaffRoleIds } from '../config/config.js'
import { TICKET_SETTINGS, TICKET_TYPES } from '../config/ticketConfig.js'
import { CUSTOM_IDS } from '../constants/customIds.js'
import { getTicketControlRow, getTicketWelcomeEmbed } from '../embeds/ticketEmbed.js'
import { getTicketPanelEmbed } from '../embeds/ticketPanelEmbed.js'
import type { TicketTopicData, TicketType } from '../types/ticket.js'
import { LOGGER } from '../utils/logger.js'
import { sendTranscript } from './ticketTranscriptService.js'

const TICKET_STATE_CACHE = new Map<string, TicketTopicData>()

const isOwnPanelMessage = (message: Message, client: Client): boolean =>
  message.author.id === client.user!.id && message.components.length > 0

export const postTicketPanel = async (client: Client, channel: TextChannel): Promise<void> => {
  const recentMessages = await channel.messages.fetch({ limit: 10 }).catch((error: unknown) => {
    LOGGER.error('Failed to fetch ticket panel channel history', { channelId: channel.id, error })
    return null
  })
  if (recentMessages) {
    for (const message of recentMessages.values()) {
      if (isOwnPanelMessage(message, client)) await message.delete().catch(() => {})
    }
  }
  const panelImage = TICKET_SETTINGS.panelThumbnailUrl
    ? new AttachmentBuilder(TICKET_SETTINGS.panelThumbnailUrl, { name: 'ticket.png' })
    : new AttachmentBuilder(TICKET_SETTINGS.panelThumbnailPath, { name: 'ticket.png' })
  await channel.send(getTicketPanelEmbed(channel.guild, client.user!, panelImage))
}

export const getTicketType = (typeId: string): TicketType | undefined =>
  TICKET_TYPES.find((ticketType) => ticketType.id === typeId)

const getPinnedWelcomeMessage = async (channel: TextChannel): Promise<Message | undefined> =>
  (await channel.messages.fetchPins().catch(() => undefined))?.items[0]?.message

const deriveTicketData = async (channel: TextChannel): Promise<TicketTopicData | null> => {
  const ticketType = TICKET_TYPES.find((type) => channel.name.startsWith(`ticket-${type.id}-`))
  if (!ticketType) return null

  const botId = channel.guild.members.me?.id
  const opener = channel.permissionOverwrites.cache.find(
    (overwrite) => overwrite.type === OverwriteType.Member && overwrite.id !== botId
  )?.id
  if (!opener) return null

  const openerCanSend = channel.permissionOverwrites.cache.get(opener)?.allow.has(PermissionFlagsBits.SendMessages) ?? false
  if (openerCanSend) return { opener, type: ticketType.id, status: 'open' }

  const welcomeMessage = await getPinnedWelcomeMessage(channel)
  const reopenButton = welcomeMessage?.resolveComponent(CUSTOM_IDS.ticketReopen)
  const isArchived = Boolean(reopenButton && 'disabled' in reopenButton && reopenButton.disabled)

  return { opener, type: ticketType.id, status: isArchived ? 'archived' : 'closed' }
}

export const getTicketData = async (channel: TextChannel): Promise<TicketTopicData | null> => {
  const cached = TICKET_STATE_CACHE.get(channel.id)
  if (cached) return cached

  const derived = await deriveTicketData(channel)
  if (derived) TICKET_STATE_CACHE.set(channel.id, derived)
  return derived
}

export const getValidTicketContext = async (channel: TextChannel): Promise<{ topicData: TicketTopicData, ticketType: TicketType } | null> => {
  const topicData = await getTicketData(channel)
  const ticketType = topicData ? getTicketType(topicData.type) : undefined
  if (!topicData || !ticketType) return null
  return { topicData, ticketType }
}

export const clearTicketData = (channelId: string): void => {
  TICKET_STATE_CACHE.delete(channelId)
}

const setTicketData = (channelId: string, topicData: TicketTopicData): void => {
  TICKET_STATE_CACHE.set(channelId, topicData)
}

export const countOpenTickets = async (guild: Guild, openerId: string): Promise<number> => {
  let openCount = 0

  const openChannels = guild.channels.cache.filter((channel) => channel.parentId === ticketCategoryId)

  for (const channel of openChannels.values()) {
    if (channel.type !== ChannelType.GuildText) continue

    const topicData = await getTicketData(channel)
    if (topicData?.opener === openerId && topicData.status === 'open') openCount++
  }

  return openCount
}

export const createTicket = async (
  guild: Guild,
  opener: User,
  ticketType: TicketType
): Promise<TextChannel> => {
  const channelName = `ticket-${ticketType.id}-${opener.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 90)

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: ticketCategoryId,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: guild.members.me!.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ManageMessages
        ]
      },
      {
        id: opener.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles]
      },
      ...ticketStaffRoleIds.map((roleId) => ({
        id: roleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ManageMessages
        ]
      }))
    ]
  })

  const staffMentions = ticketStaffRoleIds.map((roleId) => `<@&${roleId}>`).join(' ')

  const welcomeMessage = await channel.send({
    content: `<@${opener.id}> ${staffMentions}`,
    ...getTicketWelcomeEmbed({ opener, ticketType, botUser: channel.client.user! }),
    components: [getTicketControlRow('open')]
  })

  await welcomeMessage.pin().catch(() => {})

  setTicketData(channel.id, { opener: opener.id, type: ticketType.id, status: 'open' })

  return channel
}

export const closeTicket = async (
  channel: TextChannel,
  topicData: TicketTopicData,
  welcomeMessage?: Message
): Promise<void> => {
  setTicketData(channel.id, { ...topicData, status: 'closed' })

  await channel.permissionOverwrites.edit(channel.guild.members.me!.id, { ViewChannel: true, SendMessages: true })
  await channel.permissionOverwrites.edit(topicData.opener, { SendMessages: false })
  await Promise.all(ticketStaffRoleIds.map((roleId) => channel.permissionOverwrites.edit(roleId, { SendMessages: false })))

  const controlMessage = welcomeMessage ?? await getPinnedWelcomeMessage(channel)
  if (controlMessage) await controlMessage.edit({ components: [getTicketControlRow('closed')] })
}

export const sendTicketTranscript = async (
  channel: TextChannel,
  ticketType: TicketType,
  topicData: TicketTopicData,
  transcriptChannel: TextChannel,
  welcomeMessage?: Message
): Promise<void> => {
  await sendTranscript(channel, transcriptChannel, ticketType)

  if (TICKET_SETTINGS.shouldDmOnClose) {
    const opener = await channel.client.users.fetch(topicData.opener).catch(() => null)
    await opener?.send(TICKET_SETTINGS.dmOnCloseMessage.replace('{channel}', channel.name)).catch(() => {})
  }

  setTicketData(channel.id, { ...topicData, status: 'archived' })

  const controlMessage = welcomeMessage ?? await getPinnedWelcomeMessage(channel)
  if (controlMessage) await controlMessage.edit({ components: [getTicketControlRow('archived')] })
}

export const reopenTicket = async (
  channel: TextChannel,
  topicData: TicketTopicData,
  welcomeMessage?: Message
): Promise<void> => {
  setTicketData(channel.id, { ...topicData, status: 'open' })

  await channel.permissionOverwrites.edit(topicData.opener, { SendMessages: true })
  await Promise.all(ticketStaffRoleIds.map((roleId) => channel.permissionOverwrites.edit(roleId, { SendMessages: true })))

  const controlMessage = welcomeMessage ?? await getPinnedWelcomeMessage(channel)
  if (controlMessage) await controlMessage.edit({ components: [getTicketControlRow('open')] })
}
