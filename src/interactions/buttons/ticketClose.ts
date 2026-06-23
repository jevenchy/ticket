import { MessageFlags } from 'discord.js'
import type { ButtonInteraction, GuildMember, TextChannel } from 'discord.js'
import { CUSTOM_IDS } from '../../constants/customIds.js'
import { getErrorEmbed } from '../../embeds/errorEmbed.js'
import { getSuccessEmbed } from '../../embeds/successEmbed.js'
import { closeTicket, getValidTicketContext } from '../../services/ticketService.js'
import { isSupportStaff } from '../../utils/permissions.js'

export default {
  customId: CUSTOM_IDS.ticketClose,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const context = await getValidTicketContext(channel)
    if (!context) {
      await interaction.editReply(getErrorEmbed('This channel is not a valid ticket.'))
      return
    }

    const { topicData } = context

    const isStaff = isSupportStaff(interaction.member as GuildMember)
    const isOpener = interaction.user.id === topicData.opener
    if (!isOpener && !isStaff) {
      await interaction.editReply(getErrorEmbed('You do not have permission to close this ticket.'))
      return
    }

    if (topicData.status === 'closed' || topicData.status === 'archived') {
      await interaction.editReply(getErrorEmbed('This ticket is already closed.'))
      return
    }

    await closeTicket(channel, topicData, interaction.message)

    await channel.send(getSuccessEmbed(`Ticket closed by <@${interaction.user.id}> (${isStaff ? 'staff' : 'opener'}).`))

    const closeMessage = isStaff
      ? 'Ticket closed. Press "Transcript" to send the transcript and lock this ticket.'
      : 'Ticket closed. A staff member will review and finalize this ticket.'

    await interaction.editReply(getSuccessEmbed(closeMessage))
  }
}
