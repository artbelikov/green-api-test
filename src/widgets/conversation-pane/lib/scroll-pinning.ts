export const PINNED_EPSILON_PX = 16

export const isPinnedToBottom = (
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
): boolean => scrollHeight - (scrollTop + clientHeight) <= PINNED_EPSILON_PX
