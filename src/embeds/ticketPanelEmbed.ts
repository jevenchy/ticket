import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js'
import type { AttachmentBuilder, BaseMessageOptions, Guild, User } from 'discord.js'
import { TICKET_TYPES } from '../config/ticketConfig.js'
import { COLORS } from '../constants/colors.js'
import { CUSTOM_IDS } from '../constants/customIds.js'
import { getEmbedFooter } from '../utils/discord.js'

export const getTicketPanelRow = (): ActionRowBuilder<StringSelectMenuBuilder> => {
  const typeSelect = new StringSelectMenuBuilder()
    .setCustomId(CUSTOM_IDS.ticketTypeSelect)
    .setPlaceholder('Open a ticket')
    .addOptions(
      TICKET_TYPES.map((ticketType) => ({
        label: ticketType.label,
        description: ticketType.description,
        value: ticketType.id
      }))
    )
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(typeSelect)
}

export const getTicketPanelEmbed = (guild: Guild, botUser: User, panelImage: AttachmentBuilder): BaseMessageOptions => {
  const panelEmbed = new EmbedBuilder()
    .setTitle(`${guild.name} Support`)
    .setDescription('Need help? Select a topic below to open a ticket.')
    .setColor(COLORS.ticket)
    .setThumbnail('attachment://ticket.png')
    .setFooter(getEmbedFooter(botUser))
    .setTimestamp()

  return {
    embeds: [panelEmbed],
    components: [getTicketPanelRow()],
    files: [panelImage]
  }
}
