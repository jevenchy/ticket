import { MessageFlags } from 'discord.js'
import type { Interaction } from 'discord.js'
import { CUSTOM_IDS } from '../constants/customIds.js'
import { getErrorEmbed } from '../embeds/errorEmbed.js'
import ticketClose from '../interactions/buttons/ticketClose.js'
import ticketDelete from '../interactions/buttons/ticketDelete.js'
import ticketReopen from '../interactions/buttons/ticketReopen.js'
import ticketTranscript from '../interactions/buttons/ticketTranscript.js'
import ticketTypeSelect from '../interactions/selectMenus/ticketTypeSelect.js'
import { LOGGER } from '../utils/logger.js'

const ACTION_TIMEOUT_MS = 8000

const getHandler = (interaction: Interaction): (() => Promise<void>) | null => {
  if (interaction.isStringSelectMenu() && interaction.customId === CUSTOM_IDS.ticketTypeSelect) {
    return () => ticketTypeSelect.execute(interaction)
  }

  if (interaction.isButton()) {
    switch (interaction.customId) {
      case CUSTOM_IDS.ticketClose: return () => ticketClose.execute(interaction)
      case CUSTOM_IDS.ticketReopen: return () => ticketReopen.execute(interaction)
      case CUSTOM_IDS.ticketTranscript: return () => ticketTranscript.execute(interaction)
      case CUSTOM_IDS.ticketDelete: return () => ticketDelete.execute(interaction)
    }
  }

  return null
}

const replyWithError = async (interaction: Interaction, description: string): Promise<void> => {
  if (!interaction.isRepliable()) return
  const errorReply = getErrorEmbed(description)
  if (interaction.deferred || interaction.replied) {
    await interaction.editReply(errorReply).catch(() => {})
  } else {
    await interaction.reply({ ...errorReply, flags: MessageFlags.Ephemeral }).catch(() => {})
  }
}

export const handleInteraction = async (interaction: Interaction): Promise<void> => {
  const handler = getHandler(interaction)
  if (!handler) return

  let isTimedOut = false

  const timeout = new Promise<void>((resolve) =>
    setTimeout(() => {
      isTimedOut = true
      resolve()
    }, ACTION_TIMEOUT_MS)
  )

  try {
    await Promise.race([handler(), timeout])
  } catch (error) {
    LOGGER.error('Interaction handler failed', { error })
    await replyWithError(interaction, 'Something went wrong while processing this action.')
    return
  }

  if (isTimedOut && interaction.isRepliable() && (interaction.deferred || interaction.replied)) {
    await interaction.editReply(
      getErrorEmbed('This is taking longer than expected. It will finish shortly.')
    ).catch(() => {})
  }
}
