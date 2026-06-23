import { EmbedBuilder } from 'discord.js'
import type { BaseMessageOptions } from 'discord.js'
import { COLORS } from '../constants/colors.js'

export const getSuccessEmbed = (description: string): BaseMessageOptions => ({
  embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(description)]
})
