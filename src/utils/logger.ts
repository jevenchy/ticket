const ANSI_CODES = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  white: '\x1b[37m'
} as const

const getTimestamp = (): string =>
  new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

type LogContext = Record<string, unknown>

const serializeContext = (context: LogContext): string =>
  JSON.stringify(context, (_, value) =>
    value instanceof Error
      ? { name: value.name, message: value.message, stack: value.stack }
      : value
  )

const formatLine = (useColor: boolean, color: string, tag: string, msg: string, context?: LogContext): string => {
  const timestamp = useColor ? `${ANSI_CODES.dim}${getTimestamp()}${ANSI_CODES.reset}` : getTimestamp()
  const label = useColor ? `${color}${ANSI_CODES.bright}[${tag}]${ANSI_CODES.reset}` : `[${tag}]`
  const line = `${timestamp} ${label} ${msg}`
  return context ? `${line}: ${serializeContext(context)}` : line
}

export const LOGGER = {
  info(msg: string, context?: LogContext): void {
    console.log(formatLine(process.stdout.isTTY === true, ANSI_CODES.white, 'INFO', msg, context))
  },

  warn(msg: string, context?: LogContext): void {
    console.warn(formatLine(process.stderr.isTTY === true, ANSI_CODES.yellow, 'WARN', msg, context))
  },

  error(msg: string, context?: LogContext): void {
    console.error(formatLine(process.stderr.isTTY === true, ANSI_CODES.red, 'ERROR', msg, context))
  }
}
