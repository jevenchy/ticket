import { EmbedBuilder } from 'discord.js'
import type { BaseMessageOptions } from 'discord.js'
import { COLORS } from '../constants/colors.js'

export const getErrorEmbed = (description: string): BaseMessageOptions => ({
  embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(description)]
})
