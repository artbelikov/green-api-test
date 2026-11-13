import { ActionIcon } from '@mantine/core'
import { IconSend } from '@tabler/icons-react'
import type { KeyboardEvent } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { i18n } from '@/shared/config'
import { MAX_SEND_TEXT_LENGTH, validateSendText } from '../lib/validate-send-text'
import { sendChatText } from '../send-chat-text'
import classes from './message-composer.module.css'

export type MessageComposerProps = {
  readonly chatId: string
}

export function MessageComposer({ chatId }: MessageComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const emptyHeightRef = useRef<number | null>(null)
  const hasText = value.trim().length > 0

  const autosize = (): void => {
    const element = textareaRef.current
    if (element === null) {
      return
    }
    element.style.height = 'auto'
    if (emptyHeightRef.current === null && element.value.length === 0) {
      emptyHeightRef.current = element.scrollHeight
    }
    element.style.height = `${Math.max(emptyHeightRef.current ?? 0, element.scrollHeight)}px`
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
          aria-label={i18n.messenger.composer.sendAction}
        >
          <IconSend size={20} aria-hidden />
        </ActionIcon>
      ) : null}
    </form>
  )
}
