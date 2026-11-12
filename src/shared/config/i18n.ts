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
      'You are connected. The chat list and conversation arrive in the next build sessions.',
  },
  session: {
    settlingNotice:
      'Settings are being applied on the instance — chat history may stay empty for a few minutes.',
    disconnectAction: 'Disconnect',
  },
  connect: {
    heading: 'Connect your messenger',
    subtitle: 'Enter your GREEN-API instance credentials to sign in.',
    idInstanceLabel: 'Instance ID',
    idInstancePlaceholder: '110100200',
    apiTokenLabel: 'API token',
    apiTokenPlaceholder: 'Paste your secret token',
    advancedToggle: 'Advanced settings',
    apiUrlLabel: 'API URL',
    connectAction: 'Connect',
    credentialsHint: 'How to get credentials',
    credentialsHintUrl: 'https://console.green-api.com',
    mockHint: 'Demo mode is active: any credentials connect against a scripted fake gateway.',
    errors: {
      invalidInstanceId: 'Instance ID must contain digits only',
      missingToken: 'Enter the API token of your instance',
      invalidApiUrl: 'Enter a valid API URL',
      invalidCredentials: 'Credentials rejected. Check the instance ID and token.',
      notAuthorized:
        'The instance is not authorized yet — finish authorization in the GREEN-API console first.',
      instanceStarting: 'The instance is starting up. Try again in a minute.',
      instanceUnavailable: 'The instance is blocked or restricted.',
      networkError: 'Network error. Check your connection and try again.',
      timeoutError: 'The request timed out. Try again.',
      rateLimited: 'Too many attempts. Wait a moment and try again.',
      unexpected: 'Unexpected error. Try again.',
    },
  },
} as const

export type I18n = typeof i18n
