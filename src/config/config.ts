import 'dotenv/config'

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const token = requireEnv('DISCORD_TOKEN')
export const ticketPanelChannelId = requireEnv('TICKET_PANEL_CHANNEL_ID')
export const ticketTranscriptChannelId = requireEnv('TICKET_TRANSCRIPT_CHANNEL_ID')
export const ticketCategoryId = requireEnv('TICKET_CATEGORY_ID')
export const ticketStaffRoleIds = requireEnv('TICKET_STAFF_ROLE_IDS').split(',').map((roleId) => roleId.trim())
