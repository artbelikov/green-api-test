import { localStorageStore } from '@/shared/lib/storage'
import { type ChatsStoreDeps, createChatsStore } from './create-chats-store'

const defaultChatsStoreDeps: ChatsStoreDeps = {
  storage: localStorageStore,
}

export const useChatsStore = createChatsStore(defaultChatsStoreDeps)
