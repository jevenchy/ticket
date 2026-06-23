import { EmbedBuilder } from 'discord.js'
import type { BaseMessageOptions } from 'discord.js'
import { COLORS } from '../constants/colors.js'
import type { TicketType } from '../types/ticket.js'

export const getTicketTranscriptEmbed = (channelName: string, ticketType: TicketType): BaseMessageOptions => ({
  embeds: [
    new EmbedBuilder()
      .setTitle(`Ticket Closed: ${channelName}`)
      .setDescription(`Type: ${ticketType.label}`)
      .setColor(COLORS.ticket)
      .setTimestamp()
  ]
})
