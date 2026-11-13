import { ActionIcon } from '@mantine/core'
import type { KeyboardEvent } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useSessionStore } from '@/entities/session'
import { i18n } from '@/shared/config'
import { MAX_SEND_TEXT_LENGTH, validateSendText } from '../lib/validate-send-text'
import { sendChatText } from '../send-chat-text'
import classes from './message-composer.module.css'

const glyphProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const MicGlyph = () => (
  <svg {...glyphProps}>
    <title>{i18n.messenger.composer.micTitle}</title>
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 11a7 7 0 0 1-14 0" />
    <path d="M12 18v4" />
  </svg>
)

const SendGlyph = () => (
  <svg {...glyphProps}>
    <title>{i18n.messenger.composer.sendAction}</title>
    <path d="m22 2-7 20-4-9-9-4z" />
    <path d="M22 2 11 13" />
  </svg>
)

export interface MessageComposerProps {
  readonly chatId: string
}

export function MessageComposer({ chatId }: MessageComposerProps) {
  const status = useSessionStore((state) => state.status)
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const hasText = value.trim().length > 0
  const offline = status !== 'connected'

  const autosize = (): void => {
    const element = textareaRef.current
    if (element === null) {
      return
    }
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }

  useLayoutEffect(autosize)

  const submit = (): void => {
    const validation = validateSendText(value)
    if (!validation.ok) {
      return
    }
    setValue('')
    void sendChatText(chatId, validation.text)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return
    }
    event.preventDefault()
    submit()
  }

  return (
    <form
      className={classes.composer}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <textarea
        ref={textareaRef}
        className={classes.input}
        value={value}
        rows={1}
        maxLength={MAX_SEND_TEXT_LENGTH}
        placeholder={i18n.messenger.composer.placeholder}
        aria-label={i18n.messenger.composer.inputLabel}
        onChange={(event) => setValue(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />
      {hasText ? (
        <ActionIcon
          type="submit"
          className={classes.send}
          variant="subtle"
          color="brand"
          radius="xl"
          size="md"
          disabled={offline}
          title={offline ? i18n.messenger.composer.offlineTooltip : undefined}
          aria-label={i18n.messenger.composer.sendAction}
        >
          <SendGlyph />
        </ActionIcon>
      ) : (
        <span className={classes.mic} aria-hidden="true">
          <MicGlyph />
        </span>
      )}
    </form>
  )
}
