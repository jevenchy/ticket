import { AttachmentBuilder } from 'discord.js'
import type { Message, TextChannel } from 'discord.js'
import { getTicketTranscriptEmbed } from '../embeds/ticketTranscriptEmbed.js'
import type { TicketType } from '../types/ticket.js'

const FETCH_BATCH_SIZE = 100

const fetchAllMessages = async (channel: TextChannel): Promise<Message[]> => {
  const messages: Message[] = []
  let beforeId: string | undefined

  while (true) {
    const batch = await channel.messages.fetch({ limit: FETCH_BATCH_SIZE, before: beforeId })
    if (batch.size === 0) break

    messages.push(...batch.values())
    beforeId = batch.last()?.id
  }

  return messages.reverse()
}

const formatMessage = (message: Message): string => {
  const timestamp = message.createdAt.toISOString()
  const attachments = message.attachments.map((attachment) => attachment.url).join(' ')
  const content = [message.content, attachments].filter(Boolean).join(' ')

  return `[${timestamp}] ${message.author.username}: ${content || '(no content)'}`
}

const generateTranscript = async (channel: TextChannel): Promise<string> =>
  (await fetchAllMessages(channel)).map(formatMessage).join('\n')

export const sendTranscript = async (channel: TextChannel, transcriptChannel: TextChannel, ticketType: TicketType): Promise<void> => {
  const transcript = await generateTranscript(channel)
  const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), { name: `${channel.name}.txt` })

  await transcriptChannel.send({ ...getTicketTranscriptEmbed(channel.name, ticketType), files: [attachment] })
}
