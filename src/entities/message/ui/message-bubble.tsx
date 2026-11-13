import { ActionIcon, type CSSProperties, useMantineTheme } from '@mantine/core'
import { IconRotateClockwise2 } from '@tabler/icons-react'
import type { MessageDeliveryStatus, MessageDirection } from '@/shared/api/greenapi'
import { i18n } from '@/shared/config'
import { formatMessageTime } from '@/shared/lib'
import classes from './message-bubble.module.css'
import { StatusTicks } from './status-ticks'

export type MessageBubbleModel = {
  readonly id: string
  readonly direction: MessageDirection
  readonly text: string
  readonly timestamp: number
  readonly status: MessageDeliveryStatus | null
}

export type MessageBubbleProps = {
  readonly message: MessageBubbleModel
  readonly onRetry?: () => void
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const max = useMantineTheme().other.max
  const outgoing = message.direction === 'outgoing'
  const paletteVars = {
    '--max-bubble-in': max.bubbleIn,
    '--max-bubble-out': max.bubbleOut,
    '--max-bubble-out-opacity': String(max.bubbleOutOpacity),
  } as CSSProperties
  const failed = outgoing && message.status === 'failed'
  const retryable = failed && onRetry !== undefined
  return (
    <div className={classes.row} data-direction={message.direction} style={paletteVars}>
      <div
        className={classes.bubble}
        data-failed={failed || undefined}
        title={failed ? i18n.chat.sendFailed : undefined}
      >
        <span className={classes.text}>{message.text}</span>
        <span className={classes.meta}>
          {retryable ? (
            <ActionIcon
              variant="transparent"
              color="red"
              size="compact-sm"
              radius="xl"
              aria-label={i18n.messenger.conversation.retryFailed}
              title={i18n.messenger.conversation.retryFailed}
              onClick={onRetry}
            >
              <IconRotateClockwise2 size={14} aria-hidden />
            </ActionIcon>
          ) : null}
          {outgoing && message.status !== null ? <StatusTicks status={message.status} /> : null}
          <time className={classes.time} dateTime={new Date(message.timestamp).toISOString()}>
            {formatMessageTime(message.timestamp)}
          </time>
        </span>
      </div>
    </div>
  )
}
