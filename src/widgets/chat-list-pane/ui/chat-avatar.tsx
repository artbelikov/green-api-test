import { useQuery } from '@tanstack/react-query'
import { ChatAvatar } from '@/entities/chat'
import { useSessionStore } from '@/entities/session'
import { getAvatar } from '@/shared/api/greenapi'

const AVATAR_STALE_TIME_MS = 5 * 60_000

export interface ChatAvatarWithUrlProps {
  readonly chatId: string
  readonly name: string
  readonly size: number
}

export function ChatAvatarWithUrl({ chatId, name, size }: ChatAvatarWithUrlProps) {
  const query = useQuery({
    queryKey: ['chat-avatar', chatId],
    queryFn: async () => {
      const credentials = useSessionStore.getState().credentials
      if (credentials === null) {
        return null
      }
      const avatar = await getAvatar(credentials, chatId)
      if (avatar.available === false) {
        return null
      }
      const url = avatar.urlAvatar ?? avatar.base64Avatar
      return typeof url === 'string' && url.length > 0 ? url : null
    },
    staleTime: AVATAR_STALE_TIME_MS,
    retry: false,
  })
  return <ChatAvatar name={name} seed={chatId} url={query.data ?? null} size={size} />
}
