import { MessageFlags } from 'discord.js'
import type { StringSelectMenuInteraction } from 'discord.js'
import { TICKET_SETTINGS } from '../../config/ticketConfig.js'
import { CUSTOM_IDS } from '../../constants/customIds.js'
import { getErrorEmbed } from '../../embeds/errorEmbed.js'
import { getSuccessEmbed } from '../../embeds/successEmbed.js'
import { getTicketPanelRow } from '../../embeds/ticketPanelEmbed.js'
import { countOpenTickets, createTicket, getTicketType } from '../../services/ticketService.js'

export default {
  customId: CUSTOM_IDS.ticketTypeSelect,
  async execute(interaction: StringSelectMenuInteraction): Promise<void> {
    if (!interaction.guild) return

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    await interaction.message.edit({ components: [getTicketPanelRow()] }).catch(() => {})

    const ticketType = getTicketType(interaction.values[0])
    if (!ticketType) {
      await interaction.editReply(getErrorEmbed('This ticket type is no longer available.'))
      return
    }

    if (await countOpenTickets(interaction.guild, interaction.user.id) >= TICKET_SETTINGS.maxOpenPerUser) {
      await interaction.editReply(
        getErrorEmbed(`You already have ${TICKET_SETTINGS.maxOpenPerUser} open ticket(s). Please close them before opening a new one.`)
      )
      return
    }

    const channel = await createTicket(interaction.guild, interaction.user, ticketType)

    await interaction.editReply(getSuccessEmbed(`Your ticket has been created: <#${channel.id}>`))
  }
}
