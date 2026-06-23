import type { Interaction } from 'discord.js'
import { handleInteraction } from '../handlers/interactionHandler.js'

export default {
  name: 'interactionCreate',
  async execute(interaction: Interaction): Promise<void> {
    await handleInteraction(interaction)
  }
}
