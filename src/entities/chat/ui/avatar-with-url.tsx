import { useQuery } from '@tanstack/react-query'
import { credentialsFingerprint, type GreenApiCredentials, getAvatar } from '@/shared/api/greenapi'
import { ChatAvatar } from './avatar'

const AVATAR_STALE_TIME_MS = 5 * 60_000

export type ChatAvatarWithUrlProps = {
  readonly chatId: string
  readonly name: string
  readonly size: number
  readonly credentials: GreenApiCredentials | null
}

export function ChatAvatarWithUrl({ chatId, name, size, credentials }: ChatAvatarWithUrlProps) {
  const sessionKey = credentials === null ? null : credentialsFingerprint(credentials)
  const query = useQuery({
    queryKey: ['chat-avatar', chatId, sessionKey],
    queryFn:
      credentials === null
        ? (): Promise<string | null> => Promise.resolve(null)
        : async (): Promise<string | null> => {
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
