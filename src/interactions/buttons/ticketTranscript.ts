import { MessageFlags } from 'discord.js'
import type { ButtonInteraction, GuildMember, TextChannel } from 'discord.js'
import { ticketTranscriptChannelId } from '../../config/config.js'
import { CUSTOM_IDS } from '../../constants/customIds.js'
import { getErrorEmbed } from '../../embeds/errorEmbed.js'
import { getSuccessEmbed } from '../../embeds/successEmbed.js'
import { getValidTicketContext, sendTicketTranscript } from '../../services/ticketService.js'
import { fetchChannel } from '../../utils/discord.js'
import { isSupportStaff } from '../../utils/permissions.js'

export default {
  customId: CUSTOM_IDS.ticketTranscript,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const channel = interaction.channel as TextChannel

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    const context = await getValidTicketContext(channel)
    if (!context) {
      await interaction.editReply(getErrorEmbed('This channel is not a valid ticket.'))
      return
    }

    const { topicData, ticketType } = context

    if (!isSupportStaff(interaction.member as GuildMember)) {
      await interaction.editReply(getErrorEmbed('You do not have permission to send the transcript.'))
      return
    }

    if (topicData.status === 'open') {
      await interaction.editReply(getErrorEmbed('Close this ticket before sending the transcript.'))
      return
    }

    if (topicData.status === 'archived') {
      await interaction.editReply(getErrorEmbed('The transcript has already been sent for this ticket.'))
      return
    }

    const transcriptChannel = await fetchChannel<TextChannel>(interaction.client, ticketTranscriptChannelId)
    if (!transcriptChannel) {
      await interaction.editReply(getErrorEmbed('Transcript channel is not configured correctly.'))
      return
    }

    await sendTicketTranscript(channel, ticketType, topicData, transcriptChannel, interaction.message)

    await interaction.editReply(getSuccessEmbed('Transcript sent. This ticket can no longer be reopened.'))
  }
}
