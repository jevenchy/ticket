import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'
import type { BaseMessageOptions, User } from 'discord.js'
import { COLORS } from '../constants/colors.js'
import { CUSTOM_IDS } from '../constants/customIds.js'
import type { TicketTopicData, TicketType } from '../types/ticket.js'
import { getEmbedFooter } from '../utils/discord.js'

interface TicketWelcomeEmbedOptions {
  opener: User
  ticketType: TicketType
  botUser: User
}

export const getTicketWelcomeEmbed = ({ opener, ticketType, botUser }: TicketWelcomeEmbedOptions): BaseMessageOptions => ({
  embeds: [
    new EmbedBuilder()
      .setTitle(ticketType.label)
      .setDescription(ticketType.welcomeMessage.replace('{user}', `<@${opener.id}>`))
      .setColor(COLORS.ticket)
      .setFooter(getEmbedFooter(botUser))
      .setTimestamp()
  ]
})

export const getTicketControlRow = (status: TicketTopicData['status']): ActionRowBuilder<ButtonBuilder> => {
  if (status === 'closed') {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(CUSTOM_IDS.ticketReopen).setLabel('Reopen').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(CUSTOM_IDS.ticketTranscript).setLabel('Transcript').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(CUSTOM_IDS.ticketDelete).setLabel('Delete').setStyle(ButtonStyle.Danger)
    )
  }

  if (status === 'archived') {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(CUSTOM_IDS.ticketReopen).setLabel('Reopen').setStyle(ButtonStyle.Success).setDisabled(true),
      new ButtonBuilder().setCustomId(CUSTOM_IDS.ticketTranscript).setLabel('Transcript Sent').setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId(CUSTOM_IDS.ticketDelete).setLabel('Delete').setStyle(ButtonStyle.Danger)
    )
  }

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(CUSTOM_IDS.ticketClose).setLabel('Close').setStyle(ButtonStyle.Danger)
  )
}
