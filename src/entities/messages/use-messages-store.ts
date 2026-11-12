import { getChatHistory } from '@/shared/api/greenapi'
import { localStorageStore } from '@/shared/lib/storage'
import {
  createMessagesStore,
  DEFAULT_CAPACITY_PER_CHAT,
  type MessagesStoreDeps,
} from './create-messages-store'

export const defaultMessagesStoreDeps: MessagesStoreDeps = {
  gateway: { getChatHistory },
  now: () => Date.now(),
  storage: localStorageStore,
  capacityPerChat: DEFAULT_CAPACITY_PER_CHAT,
}

export const useMessagesStore = createMessagesStore(defaultMessagesStoreDeps)
