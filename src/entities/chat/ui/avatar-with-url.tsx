import { useQuery } from '@tanstack/react-query'
import { type GreenApiCredentials, getAvatar } from '@/shared/api/greenapi'
import { ChatAvatar } from './avatar'

const AVATAR_STALE_TIME_MS = 5 * 60_000

export type ChatAvatarWithUrlProps = {
  readonly chatId: string
  readonly name: string
  readonly size: number
  readonly credentials: GreenApiCredentials | null
}

export function ChatAvatarWithUrl({ chatId, name, size, credentials }: ChatAvatarWithUrlProps) {
  const query = useQuery({
    queryKey: ['chat-avatar', chatId],
    queryFn: async () => {
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
    enabled: credentials !== null,
    staleTime: AVATAR_STALE_TIME_MS,
    retry: false,
  })
  return <ChatAvatar name={name} seed={chatId} url={query.data ?? null} size={size} />
}
