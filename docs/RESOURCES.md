# Resources

Research artifacts gathered 2026-11-12 while planning. All GREEN-API doc pages were fetched from the official site and saved locally below (they are the durable API contract for this repo).

## Local collection — GREEN-API (docs/resources/green-api/)

Official docs are oriented on WhatsApp/Telegram (v2 generation); saved pages include the full method contracts, examples, and error tables. This collection documents the API contract the app actually uses against the Telegram instance.

| File | Covers |
|---|---|
| `before-start.md` | Instance parameters (apiUrl, mediaUrl, idInstance, apiTokenInstance), authorization flow |
| `request-format.md` | Request URL pattern, headers, code examples |
| `api-overview.md` | Full API method index |
| `using-green-api-hosts.md` | Host selection, universal host `https://api.green-api.com` |
| `chat-id.md` | Chat id formats (`@c.us`, `@g.us`, `@lid`) — **note: Telegram bridge returns bare numeric / `-100…` ids; always use ids as returned** |
| `message-id.md` | Message id semantics, uniqueness within chat |
| `send-messages-delay.md` | Message queue interval (`delaySendMessagesMilliseconds`) |
| `common-errors.md` | Standard API errors incl. `Validation failed`, auth errors |
| `ratelimiter.md` | Per-method requests-per-second limits (429 behavior) |
| `tech-http-api.md` | Polling pattern requirements, SetSettings config to enable |
| `ReceiveNotification.md` | Long-poll contract (5–60s timeout, `receiptId`, FIFO, 24h retention) |
| `DeleteNotification.md` | Ack/confirm notification |
| `type-webhook.md` | All `typeWebhook` values |
| `incoming-Webhook-IncomingMessageReceived.md` | Full incoming notification envelope (senderData/messageData) |
| `incoming-TextMessage.md` | Text message payload incl. quoted messages |
| `incoming-ImageMessage.md` | Media payload (downloadUrl, jpegThumbnail, mimeType) |
| `incoming-QuotedMessage.md`, `incoming-EditedMessage.md`, `incoming-DeletedMessage.md` | Reply/quote, edit, delete notification shapes |
| `outgoing-OutgoingMessageStatus.md` | Delivery status webhooks: sent/delivered/read/failed… |
| `Sending-SendMessage.md` | sendMessage (chatId, message, quotedMessageId) |
| `Sending-SendPoll.md` | Poll sending |
| `Sending-SendMessage.md`, `Sending-SendFileByUpload.md`, `Sending-SendFileByUrl.md`, `Sending-UploadFile.md` | File upload pipeline (`mediaUrl`) |
| `Journals-GetChatHistory.md` | Chat history (POST, default 100, requires webhook settings on) |
| `Journals-LastIncomingMessages.md`, `Journals-LastOutgoingMessages.md` | Message journals |
| `Service-GetContacts.md`, `Service-GetContactInfo.md`, `Service-GetAvatar.md` | Contacts + avatars |
| `Service-SendTyping.md` | Typing/recording indicator |
| `Service-GetChats.md` | Recent chat list |
| `Service-EditMessage.md`, `Service-DeleteMessage.md`, `Service-CheckWhatsapp.md` | Message management + presence check |
| `Marks-ReadChat.md` | Mark chat/messages read |
| `Rec-webhooks.md`, `Rec-instance-status.md`, `Rec-contact-name.md` | Integration recommendations |
| `DownloadFile.md` | Downloading received files |
| `Groups-CreateGroup.md`, `Groups-GetGroupData.md` | Group methods (optional scope) |

Note: files are raw markdown captures (Russian). Verified live behaviors that differ from docs are recorded in `docs/PLAN.md` §2.

## Local collection — v3 / MAX API (docs/resources/green-api/v3/)

The vacancy links `green-api.com/v3/docs/...` — that is the **MAX API docs**. v3 uses the **same method paths** (`/waInstance{id}/{method}/{token}`, `/v3/` prefix optional) with these differences: `@c.us/@g.us` prefixes deprecated (bare numeric chatIds, negative for groups), `typeInstance: "v3"` for MAX, `CheckAccount` for phone→chatId resolution (MAX), message cap 4000 chars, QR-only authorization, unlimited connected clients.

| File | Covers |
|---|---|
| `v3-important-differences.md` | The authoritative list of v3 vs v2 differences |
| `v3-request-format.md`, `v3-before-start.md` | Request pattern, instance parameters |
| `v3-SendMessage.md` | sendMessage for MAX (chatId, message ≤4000, typingTime, quotedMessageId) |
| `v3-tech-http-api.md`, `v3-ReceiveNotification.md`, `v3-DeleteNotification.md` | Long-poll receiving (identical to v2) |
| `v3-chat-id.md`, `v3-CheckAccount.md` | Chat id semantics, phone→chatId resolution |
| `v3-type-webhook.md`, `v3-incoming-TextMessage.md` | Webhook types, text message payload (numeric ids, senderPhoneNumber) |
| `v3-outgoing-OutgoingMessageStatus.md` | Delivery statuses |
| `v3-GetChats.md`, `v3-getSettings.md`, `v3-GetStateInstance.md`, `v3-common-errors.md` | Supporting methods |

**Implication recorded in PLAN §2:** because paths are unified, this client can be pointed at a MAX instance by changing only credentials.

## Local collection — MAX Web UI reference (docs/resources/max-web-ui/)

The task requires prototyping the look of `web.max.ru` (JS-only app, not directly readable by tooling). **Primary artifact: `visual-spec.md`** — pixel-level layout/color tokens sampled from six real UI screenshots saved in `screenshots/` (main messenger, QR login, phone login, conversation with voice messages). Treat the spec as the styling contract for PLAN §5.

| File | Covers |
|---|---|
| `visual-spec.md` | **Start here**: three-column layout (icon rail / chat list / conversation), wallpaper tokens, bubble colors (white in / translucent mint out), blue accent values, composer pill, what NOT to copy |
| `screenshots/image1.png` | Main desktop messenger screen (list + conversation + composer) |
| `screenshots/image4.png`, `screenshots/snimok_ekrana_2026-08-25_173151.png` | Web login card on wallpaper (QR + phone) |
| `screenshots/image6.png` | Conversation: wallpaper pattern, date pill, incoming/outgoing bubbles, blue read ticks |
| `screenshots/image3.jpg` | Mobile app chat list (design-language confirmation: tabs, row anatomy, buttons) |
| `elama-max-web-guide.md`, `mnx-max-web-guide.md` | Text walkthroughs (login, capabilities); layout claims cross-checked against screenshots above |

## External key links

- GREEN-API Telegram product: https://green-api.com/telegram
- GREEN-API docs root: https://green-api.com/docs/
- Api console: https://console.green-api.com/instanceList
- Postman collection: https://www.postman.com/green-api-2991/green-api
- GitHub issues/support: https://github.com/green-api/issues
- Mantine 9: https://mantine.dev/ · 8→9 migration: https://mantine.dev/changelog/9-0-0/
- Feature Sliced Design: https://feature-sliced.design/
- TanStack Query: https://tanstack.com/query/latest · Zustand: https://github.com/pmndrs/zustand
- Vitest: https://vitest.dev · MSW: https://mswjs.io · Playwright: https://playwright.dev
- Testing pyramid ref: https://martinfowler.com/bliki/TestPyramid.html
- Railway deploy (React): https://docs.railway.com/guides/react · Nginx template: https://railway.com/deploy/nginx
- Vacancy (source task): https://astana.hh.kz/vacancy/139289090

## Credentials

Real instance credentials live in the user's private notes and runtime `localStorage` only — never in this repository (see `.env.example` for the variable names).
