export const i18n = {
  errors: {
    missingRootElement: 'Application root element is missing',
  },
  phone: {
    errors: {
      empty: 'Enter the recipient phone number',
      notANumber: 'Enter a full phone number in international format, e.g. 79991234567',
      unsupportedRegion:
        'Only Russian and Kazakhstan phone numbers are supported. For other regions, enter a full chatId.',
    },
  },
  placeholder: {
    title: 'MAX Messenger',
    subtitle:
      'Scaffold preview. The connect screen, chat list, and conversation arrive in the next build sessions.',
    connectAction: 'Connect',
  },
} as const

export type I18n = typeof i18n
