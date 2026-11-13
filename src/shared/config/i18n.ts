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
  session: {
    settlingNotice:
      'Settings are being applied on the instance — chat history may stay empty for a few minutes.',
    disconnectAction: 'Disconnect',
  },
  app: {
    loading: 'Loading…',
  },
  chat: {
    sendFailed: 'Message was not sent. Check the connection and try again.',
  },
  messenger: {
    navRail: {
      label: 'Navigation',
      all: 'Chats',
      contacts: 'Contacts',
      settings: 'Settings',
    },
    list: {
      heading: 'Chats',
      searchPlaceholder: 'Search',
      newChatAction: 'New chat',
      emptyTitle: 'No chats yet',
      emptyHint: 'Create your first chat — enter the recipient phone number.',
      youPrefix: 'You: ',
      noMessagesYet: 'No messages yet',
      status: {
        connected: 'Authorized',
        connecting: 'Connecting',
        reconnecting: 'Reconnecting…',
        disconnected: 'Offline',
      },
      reconnectBanner: 'Connection lost — reconnecting…',
    },
    conversation: {
      placeholder: 'Select a chat to start messaging',
      backAction: 'Back',
      messagesRegion: 'Messages',
      jumpToLatest: 'Back to latest',
      emptyHistory: 'No messages yet',
      historyFailed: 'Could not load messages.',
      retryHistory: 'Retry',
      retryFailed: 'Retry sending',
      date: { today: 'Today', yesterday: 'Yesterday' },
    },
    composer: {
      inputLabel: 'Message text',
      placeholder: 'Message',
      sendAction: 'Send',
      offlineTooltip: 'You are offline. Reconnect to send messages.',
    },
  },
  contactsBook: {
    title: 'Contacts',
    loadFailed: 'Could not load contacts.',
    retryAction: 'Retry',
    empty: 'No contacts found on this instance.',
  },
  sessionSettings: {
    title: 'Settings',
    apiUrlLabel: 'API URL',
    instanceIdLabel: 'Instance ID',
    statusLabel: 'Connection',
    disconnectAction: 'Disconnect',
  },
  newChat: {
    title: 'New chat',
    targetLabel: 'Phone number or nickname',
    targetPlaceholder: '79991234567 or @username',
    createAction: 'Create chat',
    cancelAction: 'Cancel',
    limitToast: 'Chat could not be created: the instance plan limit may be reached.',
    errors: {
      emptyChatId: 'Enter the full chatId',
      notConnected: 'You are not connected to an instance.',
      resolveFailed: 'Could not resolve this contact. Check the details and try again.',
      statusError: 'The request failed. Check the connection and try again.',
      networkError: 'Network error. Check your connection and try again.',
      timeoutError: 'The request timed out. Try again.',
      rateLimited: 'Too many requests. Wait a moment and try again.',
    },
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
