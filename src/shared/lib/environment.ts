export function isMockRuntime(): boolean {
  if (import.meta.env.VITE_API_MODE === 'mock') {
    return true
  }
  if (typeof window === 'undefined') {
    return false
  }
  return new URLSearchParams(window.location.search).get('mock') === '1'
}
