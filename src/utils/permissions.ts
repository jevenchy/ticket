import { PermissionFlagsBits } from 'discord.js'
import type { GuildMember } from 'discord.js'
import { ticketStaffRoleIds } from '../config/config.js'

export const isSupportStaff = (member: GuildMember): boolean =>
  member.roles.cache.hasAny(...ticketStaffRoleIds) || member.permissions.has(PermissionFlagsBits.ManageChannels)
