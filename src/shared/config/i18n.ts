export const i18n = {
  errors: {
    missingRootElement: 'Application root element is missing',
  },
  placeholder: {
    title: 'MAX Messenger',
    subtitle:
      'Scaffold preview. The connect screen, chat list, and conversation arrive in the next build sessions.',
    connectAction: 'Connect',
  },
} as const

export type I18n = typeof i18n
