# GREEN-API HTTP contract digest (T1 session, 2026-11-12)

Derived digest of the saved doc pages in this folder (list below) for the T1 client implementation: per-endpoint verbs/payloads/responses, webhook envelopes, error table, rate limits, and flagged conflicts against live-verified facts (PLAN §2 wins on conflict). Use alongside PLAN §2; the saved pages remain the primary source.

Sources digested: request-format.md, chat-id.md, message-id.md, common-errors.md, ratelimiter.md, Sending-SendMessage.md, Journals-GetChatHistory.md, Journals-LastIncomingMessages.md, Service-GetChats.md, Service-GetContacts.md, Service-GetContactInfo.md, Service-GetAvatar.md, Rec-instance-status.md, Rec-webhooks.md, ReceiveNotification.md, DeleteNotification.md, Marks-ReadChat.md, type-webhook.md, incoming-TextMessage.md, incoming-Webhook-IncomingMessageReceived.md, outgoing-OutgoingMessageStatus.md.

## Endpoints

| Method | Verb + path | Request | Response (fields) |
|---|---|---|---|
| sendMessage | POST `/waInstance{id}/sendMessage/{token}` | `{chatId, message ≤20000, quotedMessageId?, linkPreview?, typePreview?, customPreview?, typingTime?}` | `{idMessage}` — note: invalid quotedMessageId returns 200 but message is silently undelivered |
| getChatHistory | POST `/waInstance{id}/getChatHistory/{token}` | `{chatId, count? default 100}` | array newest-first; item: `{type: incoming\|outgoing, idMessage, timestamp(s), typeMessage, chatId, senderId?, senderName?, senderContactName?, statusMessage?, description? (failed), textMessage? / extendedTextMessage? / media fields, isForwarded, isEdited, isDeleted, …}` |
| lastIncomingMessages | GET `/…/lastIncomingMessages/{token}?minutes=1440` | — | same item shape as history, always `incoming` |
| getChats | GET `/…/getChats/{token}?count?` | — | **docs (WhatsApp):** `{archive, id, ephemeralExpiration, name, type: user\|group, unreadCount, newChatId?}` · **live (Telegram):** `{chatId, name, type: supergroup\|group\|channel\|user, phoneNumber, username}` |
| getContacts | GET `/…/getContacts/{token}?group?&count?` | — | `[{id, name, contactName, type: user\|group, newChatId?}]` (name can be empty) |
| getContactInfo | POST `/…/getContactInfo/{token}` | `{chatId}` | `{avatar, base64Avatar, name, contactName, email, category, description, products[], chatId, lastSeen, isArchive, isDisappearing, isMute, isBusiness, …}`; live: also `username`, `chatType`; empty profile = unknown recipient (200, not error) |
| getAvatar | POST `/…/getAvatar/{token}` | `{chatId}` | `{urlAvatar, available, base64Avatar}` — privacy/no-avatar → 200 with empty url; 400 validation |
| getStateInstance | GET `/…/getStateInstance/{token}` | — | `{stateInstance: authorized\|notAuthorized\|blocked\|starting\|yellowCard}` |
| getSettings / setSettings | GET/POST `/…/{getSettings,setSettings}/{token}` (1 rps each) | setSettings: webhook flags as `"yes"`/`"no"` strings (`incomingWebhook`, `outgoingMessageWebhook`, `outgoingAPIMessageWebhook`, `outgoingWebhook`, `stateWebhook`, `editedMessageWebhook`, `deletedMessageWebhook`) | **full schemas not in saved docs** — verify live in T2 |
| receiveNotification | GET `/…/receiveNotification/{token}?receiveTimeout=5..60 (default 5)` | long-poll | `{receiptId, body}` or null/empty on timeout; error bodies `{code, message, status: "error"}`; FIFO, 24h retention |
| deleteNotification | DELETE `/…/deleteNotification/{token}/{receiptId}` | — | `{result: boolean, reason}`; retry on ≥500 |
| readChat | POST `/…/readChat/{token}` | `{chatId, idMessage?}` | `{setRead: boolean}` |

## Webhooks (typeWebhook)

Message-carrying: `incomingMessageReceived`, `outgoingMessageReceived` (from phone), `outgoingAPIMessageReceived` (API). Statuses: `outgoingMessageStatus` (`sent|delivered|read|failed|noAccount|notInGroup|suspended|yellowCard(→suspended)`; failed/noAccount cannot be disabled). Service (skip in UI): `stateInstanceChanged`, `statusInstanceChanged`, `deviceInfo`, `incomingCall`, `outgoingCall`, `incomingBlock`, `quotaExceeded`, `incomingMessageStatus`.

Incoming envelope: `{typeWebhook, instanceData{idInstance, wid, typeInstance}, timestamp(s), idMessage, senderData{chatId, chatName?, sender?, senderName?, senderContactName?}, messageData{typeMessage, textMessageData{textMessage} | media shapes}}` — status webhook is flat: `{typeWebhook, chatId, instanceData, timestamp, idMessage, status, description?, sendByApi}`.

## Errors (HTTP)

204 OPTIONS probe · 400 `instance in starting process try later` / `instance is starting or not authorized` / `Instance account is expired…` / `Bad Request` / `Validation failed (Details: …)` / `Unexpected token … in JSON` · 401 `Unauthorized` · 403 `Forbidden` · 404 `Not Found` · 429 `Too Many Requests` (no Retry-After header documented) · 466 `correspondentsStatus` limit · 499 `Client Closed Request` · 500 file/JSON-size limits · 502 `Bad Gateway` (retry ×3). In-message `{{SWE001}}…{{SWE999}}` markers are data, not HTTP errors.

## Rate limits (rps, per instance — ratelimiter.md)

getSettings 1 · setSettings 1 · getStateInstance 1 · getChatHistory 1 · getContacts 1 · **getContactInfo 1 (docs) vs 10 (PLAN §2 — kept, watch live)** · getAvatar 10 · readChat 10 · sendMessage 50 · receiveNotification 100 · deleteNotification 100. No Retry-After header; queue spacing + typed ApiError are our mitigation.

## Conflicts vs live facts (live wins — PLAN §2)

1. getChats payload shape (docs WhatsApp vs live Telegram) — chat mapper accepts both.
2. getChatHistory requires `incomingWebhook`/`outgoingMessageWebhook` ON; empty until then (D5/D9).
3. receiveNotification is a 5–60s long-poll returning `{receiptId, body}` or empty.
4. checkWhatsapp → 404 on Telegram (not used; resolution via getContactInfo).
5. Telegram chat ids are bare numeric strings (positive private / negative groups); do not synthesize `@c.us` beyond the phone→getContactInfo probe (D1).
