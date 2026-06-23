import { MessageFlags } from 'discord.js'
import type { ButtonInteraction, GuildMember, TextChannel } from 'discord.js'
import { TICKET_SETTINGS } from '../../config/ticketConfig.js'
import { CUSTOM_IDS } from '../../constants/customIds.js'
import { getErrorEmbed } from '../../embeds/errorEmbed.js'
import { clearTicketData, getValidTicketContext } from '../../services/ticketService.js'
import { isSupportStaff } from '../../utils/permissions.js'

export default {
  customId: CUSTOM_IDS.ticketDelete,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const context = await getValidTicketContext(channel)
    if (!context) {
      await interaction.editReply(getErrorEmbed('This channel is not a valid ticket.'))
      return
    }

    if (!isSupportStaff(interaction.member as GuildMember)) {
      await interaction.editReply(getErrorEmbed('You do not have permission to delete this ticket.'))
      return
    }

    await interaction.deleteReply()
    await channel.send(`Deleting this ticket in ${TICKET_SETTINGS.deleteDelaySeconds} seconds...`)

    clearTicketData(channel.id)

    setTimeout(() => {
      channel.delete().catch(() => {})
    }, TICKET_SETTINGS.deleteDelaySeconds * 1000)
  }
}
