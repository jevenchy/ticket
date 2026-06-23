export const TICKET_SETTINGS = {
  shouldAutoDelete: true,
  shouldDmOnClose: true,
  maxOpenPerUser: 1,
  autoCloseHours: 24,
  autoCloseCheckIntervalMinutes: 30,
  autoDeleteHours: 24,
  deleteDelaySeconds: 5,
  panelThumbnailPath: 'img/ticket.png',
  panelThumbnailUrl: '',
  dmOnCloseMessage: 'Your ticket **{channel}** has been closed. A transcript has been saved.'
} as const

export const TICKET_TYPES = [
  {
    id: 'support',
    label: 'General Support',
    description: 'Get help with general questions or issues',
    welcomeMessage:
      'Thanks for reaching out, {user}!\n' +
      'Our team will be with you shortly.\n\n' +
      'Please describe your issue or question in as much detail as possible.\n' +
      'Attach screenshots or files if you have any.'
  },
  {
    id: 'report',
    label: 'Report a Member',
    description: 'Report a member who broke the rules',
    welcomeMessage:
      'Thanks for your report, {user}!\n' +
      'A moderator will review this shortly.\n\n' +
      'To help us process your report quickly, please include:\n\n' +
      '- Username/ID of the member you are reporting\n' +
      '- A brief description of the rule violation\n' +
      '- Evidence (screenshots, message links, or timestamps)\n\n' +
      'This report is confidential and only visible to you and staff.'
  }
] as const
