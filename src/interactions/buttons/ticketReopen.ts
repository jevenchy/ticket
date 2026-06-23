import { MessageFlags } from 'discord.js'
import type { ButtonInteraction, GuildMember, TextChannel } from 'discord.js'
import { CUSTOM_IDS } from '../../constants/customIds.js'
import { getErrorEmbed } from '../../embeds/errorEmbed.js'
import { getSuccessEmbed } from '../../embeds/successEmbed.js'
import { getValidTicketContext, reopenTicket } from '../../services/ticketService.js'
import { isSupportStaff } from '../../utils/permissions.js'

export default {
  customId: CUSTOM_IDS.ticketReopen,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const context = await getValidTicketContext(channel)
    if (!context) {
      await interaction.editReply(getErrorEmbed('This channel is not a valid ticket.'))
      return
    }

    const { topicData } = context

    if (!isSupportStaff(interaction.member as GuildMember)) {
      await interaction.editReply(getErrorEmbed('You do not have permission to reopen this ticket.'))
      return
    }

    if (topicData.status === 'archived') {
      await interaction.editReply(getErrorEmbed('This ticket has already had its transcript sent and can no longer be reopened.'))
      return
    }

    if (topicData.status === 'open') {
      await interaction.editReply(getErrorEmbed('This ticket is already open.'))
      return
    }

    await reopenTicket(channel, topicData, interaction.message)

    await interaction.editReply(getSuccessEmbed('Ticket reopened.'))
  }
}
