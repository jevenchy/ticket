export interface TicketType {
  id: string
  label: string
  description: string
  welcomeMessage: string
}

export interface TicketTopicData {
  opener: string
  type: string
  status: 'open' | 'closed' | 'archived'
}
