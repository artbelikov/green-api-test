/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE: 'live' | 'mock'
  readonly VITE_GREENAPI_API_URL?: string
  readonly VITE_GREENAPI_ID?: string
  readonly VITE_GREENAPI_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
