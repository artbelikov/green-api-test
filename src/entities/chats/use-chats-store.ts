import { localStorageStore } from '@/shared/lib/storage'
import { type ChatsStoreDeps, createChatsStore } from './create-chats-store'

export const defaultChatsStoreDeps: ChatsStoreDeps = {
  now: () => Date.now(),
  storage: localStorageStore,
}

export const useChatsStore = createChatsStore(defaultChatsStoreDeps)
