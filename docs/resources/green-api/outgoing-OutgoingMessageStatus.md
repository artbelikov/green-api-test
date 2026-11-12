# GREEN-API: outgoing-OutgoingMessageStatus

> Source: https://green-api.com/docs/api/receiving/notifications-format/outgoing-message/OutgoingMessageStatus/
> Saved: 2026-11-12

Редактировать страницу")

# Статус отправленного сообщения[#](#_1 "Permanent link")

Входящее уведомление данного типа содержит статус ранее отправленного сообщения: отправлено, доставлено, прочитано и др.

Настройка инстанса

Чтобы получать входящие уведомления о статусах отправленных сообщений, необходимо включить настройки одним из представленных вариантов:

1.  Через [личный кабинет](https://console.green-api.com/instanceList) включить настройки `Получать уведомления о сообщениях, отправленных с телефона`, `Получать уведомления о сообщениях, отправленных через API` и `Получать уведомления о статусах отправленных сообщений`
    
2.  Через метод [SetSettings](../../../../account/SetSettings/) включить настройки `outgoingMessageWebhook`, `outgoingAPIMessageWebhook` и `outgoingWebhook`
    

> Подробнее о статусах отправленных сообщений в WhatApp читайте в нашей [статье](../../../../../faq/whatsapp-messages-statuses/)

## Уведомление[#](#webhook "Permanent link")

### Формат уведомления[#](#webhook-parameters "Permanent link")

Параметр

Тип

Описание

`typeWebhook`

**string**

[Тип входящего уведомления](../../type-webhook/). Для уведомлений данного типа поле принимает значение `outgoingMessageStatus`

`chatId`

**string**

[Идентификатор чата](../../../../chat-id/). Чат с сообщением по которому получили статус.

`instanceData`

**object**

Данные об инстансе

`timestamp`

**integer**

Время наступления события в UNIX-формате

`idMessage`

**string**

Идентификатор отправленного сообщения или файла. Идентификатор отправленного сообщения возвращается методами: [SendMessage](../../../../sending/SendMessage/), [SendFileByUrl](../../../../sending/SendFileByUrl/), [SendFileByUpload](../../../../sending/SendFileByUpload/), [SendLocation](../../../../sending/SendLocation/), [SendContact](../../../../sending/SendContact/), [SendPoll](../../../../sending/SendPoll/)

`status`

**string**

Статус отправленного сообщения или файла. Статус принимает значения:

`sent` - сообщение отправлено

`delivered` - сообщение доставлено до получателя

`read` - сообщение прочитано/просмотрено/прослушано

`failed` - произошла ошибка при отправке сообщения на сервер WhatsApp\* (данный статус невозможно отключить в настройках [SetSettings](../../../../account/SetSettings/), необходимо обязательно реализовать обработку данного уведомления)

`yellowCard` - Статус устарел.Заменён на статус `suspended`

`suspended` - На инстансе действуют временные ограничения. Подробнее читайте в статье [Что означает статус suspended у аккаунта WhatsApp?](../../../../../faq/what-is-meaning-status-suspended/)

`noAccount` - на номере телефона получателя не зарегистрирован аккаунт WhatsApp\* (данный статус невозможно отключить в настройках [SetSettings](../../../../account/SetSettings/), необходимо обязательно реализовать обработку данного уведомления)

`notInGroup` - отправитель не является участником группового чата, в который выполняется отправка сообщения

`description`

**string**

Описание ошибки (рекомендуется сделать информирование оператора об ошибках системы)

`sendByApi`

**boolean**

Флаг указывает отправлено сообщение из API или нет, принимает значения: true , false

Поля объекта `instanceData`

Параметр

Тип

Описание

`idInstance`

**integer**

Идентификатор инстанса. Размер integer равен int64. Значения лежат в диапазоне от 1 до 12 разрядов

`wid`

**string**

Идентификатор аккаунта в формате WhatsApp\*

`typeInstance`

**string**

Тип мессенджера для инстанса

### Пример тела уведомления со статусом sent[#](#sent "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "79876543210@c.us",         "instanceData": {             "idInstance": 1101111111,             "wid": "79876543210@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727691478,         "idMessage": "3EB0608D6A2901063D63",         "status": "sent",         "sendByApi": true }`

### Пример тела уведомления со статусом delivered[#](#delivered "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "79876543210@c.us",         "instanceData": {             "idInstance": 1101111111,             "wid": "79876543210@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727698517,         "idMessage": "3EB0608D6A2901063D63",         "status": "delivered",         "sendByApi": true }`

### Пример тела уведомления со статусом read[#](#read "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "79876543210@c.us",         "instanceData": {             "idInstance": 1101111111,             "wid": "79876543210@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727698597,         "idMessage": "3EB0608D6A2901063D63",         "status": "read",         "sendByApi": true }`

### Пример тела уведомления со статусом yellowCard[#](#yellowCard "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",     "chatId": "79777055473@c.us",     "instanceData": {          "idInstance": 1101111111,         "wid": "79876543210@c.us",         "typeInstance": "whatsapp"     },     "timestamp": 1760684524,     "idMessage": "BAE53220D3339F4B",     "sendByApi": true,     "status": "yellowCard"   }`

### Пример тела уведомления при отправке в группу, в которой не состоит отправитель[#](#notInGroup "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "120363347693198097@g.us",         "instanceData": {             "idInstance": 1234,             "wid": "11001234567@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727760222,         "idMessage": "BAE5245994546A06",         "status": "notInGroup",         "sendByApi": true }`

### Пример тела уведомления при отправке сообщения в группу, в которой отправка разрешена только администраторам[#](#admin "Permanent link")

`{         "typeWebhook": "outgoingMessageStatus",         "chatId": "120363421886430111@g.us",         "instanceData": {             "idInstance": 1101111111,             "wid": "79876543210@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1750023631,         "idMessage": "BAE51FCEA361DBB7",         "status": "failed",         "description": "Error: forbidden",         "sendByApi": true }`

### Пример тела уведомления при отправке сообщения с пустым файлом через метод SendFileByUrl[#](#empty "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "120363347693198097@g.us",         "instanceData": {             "idInstance": 1234,             "wid": "11001234567@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727760222,         "idMessage": "BAE5245994546A06",         "status": "failed",         "description": "file should not be empty. URL: ...",         "sendByApi": true }`

### Пример тела уведомления при отправке сообщения с файлом, который недоступен по ссылке (SendFileByUrl)[#](#noAvalibly "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "120363347693198097@g.us",         "instanceData": {             "idInstance": 1234,             "wid": "11001234567@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727760222,         "idMessage": "BAE5245994546A06",         "status": "failed",         "description": "upload request was failed with bad status code ([45][0-9]{2})...",         "sendByApi": true }  или (могут встречаться оба)  {     "typeWebhook": "outgoingMessageStatus",         "chatId": "120363347693198097@g.us",         "instanceData": {             "idInstance": 1234,             "wid": "11001234567@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727760222,         "idMessage": "BAE5245994546A06",         "status": "failed",         "description": "request was failed with bad status code ([45][0-9]{2})...",         "sendByApi": true }`

### Пример тела уведомления при отправке сообщения с файлом, размер которого превышает 100 мб. (SendFileByUrl)[#](#size_limit "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "120363347693198097@g.us",         "instanceData": {             "idInstance": 1234,             "wid": "11001234567@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727760222,         "idMessage": "BAE5245994546A06",         "status": "failed",         "description": "file size should not exceed 100 megabytes. URL: ...",         "sendByApi": true }`

### Пример тела уведомление при отправке сообщения с файлом при недоступности медиахостов WhatsApp продолжительное время[#](#nomediahost "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "120363347693198097@g.us",         "instanceData": {             "idInstance": 1234,             "wid": "11001234567@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727760222,         "idMessage": "BAE5245994546A06",         "status": "failed",         "description": "Uploader Error",         "sendByApi": true }  или (могут встречаться оба)  {     "typeWebhook": "outgoingMessageStatus",         "chatId": "120363347693198097@g.us",         "instanceData": {             "idInstance": 1234,             "wid": "11001234567@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727760222,         "idMessage": "BAE5245994546A06",         "status": "failed",         "description": "failed to send message with file",         "sendByApi": true }`

### Пример тела уведомление при отправке сообщения при недоступности хостов WhatsApp продолжительное время[#](#nohost "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "120363347693198097@g.us",         "instanceData": {             "idInstance": 1234,             "wid": "11001234567@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727760222,         "idMessage": "BAE5245994546A06",         "status": "failed",         "description": "Error: Timed Out",         "sendByApi": true }  или (могут встречаться оба)  {     "typeWebhook": "outgoingMessageStatus",         "chatId": "120363347693198097@g.us",         "instanceData": {             "idInstance": 1234,             "wid": "11001234567@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727760222,         "idMessage": "BAE5245994546A06",         "status": "failed",         "description": "Error: Connection Closed",         "sendByApi": true }`

### Пример тела уведомления при отсутствии аккаунта WhatsApp на номере[#](#noAccount "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",         "chatId": "79876543210@c.us",         "instanceData": {             "idInstance": 1101111111,             "wid": "79876543210@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1727759586,         "idMessage": "3EB0608D6A2901063D63",         "status": "noAccount",         "sendByApi": true }`

### Пример тела уведомления с ошибкой SWE004[#](#SWE004 "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",     "chatId": "120363369140947676@g.us",     "instanceData": {         "idInstance": 1100000001,         "wid": "79001234567@c.us",         "typeInstance": "whatsapp"     },     "timestamp": 1700545580,     "idMessage": "BAE53478EARF25CF",     "status": "failed",     "description": "SWE004: the number of participants in the group has been exceeded - 1024",     "sendByApi": true }`

### Пример тела уведомления при редактировании сообщения отправленного более 15 минут назад[#](#expired "Permanent link")

`{     "typeWebhook": "outgoingMessageStatus",     "chatId": "79001234567@c.us",     "instanceData": {         "idInstance": 1101000001,         "wid": "79001234567@c.us",         "typeInstance": "whatsapp"     },     "timestamp": 1739426932,     "idMessage": "BAE56687379D581D",     "status": "failed",     "description": "15 minute editing time gap has been expired",     "sendByApi": true }`

[

Назад Отправленные сообщения



](../Webhook-OutgoingMessageReceived/)[

Вперед Отправленное с телефона сообщение

](../OutgoingMessage/)

#### Меню

*   [Документация](/docs/)
*   [SDK](/docs/sdk/)
*   [Чат-боты](/docs/chatbots/)
*   [Интеграции](/docs/integration/)
*   [Релизы](/docs/release/)
*   [Статьи](https://green-api.com/articles/)
*   [Блог](/blog/)
*   [Новости](https://green-api.com/articles/news/)
*   [Архив новостей](/docs/news/)
*   [FAQ](/docs/faq/)
*   [Стать партнером ⭐](/become-a-partner)
*   [Тарифы](/#section-prices)
*   [Конструктор ссылок](/link-builder)
*   [О нас](/about)
*   [Контакты](/contacts)
*   [Работа у нас](/vacancies)
*   [GREEN-API status](https://status.green-api.com/)

#### Интеграции

*   [Make](/docs/integration/make/)
*   [MS Excel](/docs/integration/ms_excel/)
*   [GoHighLevel](/docs/integration/gohighlevel/)
*   [Rocket.chat](/docs/integration/rocket-chat/)
*   [Zapier](/docs/integration/zapier/)
*   [Zabbix](/docs/integration/zabbix/)
*   [Slack](/docs/integration/slack/)
*   [n8n](/docs/integration/n8n/)
*   [Все интеграции...](/docs/integration/)

#### SDK

*   [Python](/docs/sdk/python/)
*   [Node.js](/docs/sdk/nodejs/)
*   [HTML](/docs/sdk/html5/)
*   [1С:Предприятие](/docs/sdk/1c/)
*   [PHP](/docs/sdk/php/)
*   [Java](/docs/sdk/java/)
*   [Go](/docs/sdk/golang/)
*   [C++](/docs/sdk/cpp/)

#### Чат-боты

*   [Python](/docs/chatbots/python/)
*   [Java](/docs/chatbots/java/)
*   [Go](/docs/chatbots/golang/)
*   [1С:Предприятие](/docs/chatbots/1c/)
*   [Node.js](/docs/chatbots/nodejs/)

#### Правовая информация

*   [Пользовательское соглашение](/user-agreement)
*   [Лицензионный договор-оферта](/license-agreement)
*   [Оферта услуги «Автоплатеж»](/recurring-payment-agreement)
*   [Политика конфиденциальности и обработки персональных данных GREEN-API](/privacy-policy)
*   [Реестр отечественного ПО](/reestr/description)
*   [Тарифная политика](/tariffs-policy-green-api.pdf)
*   [GREEN-API: Logo](https://github.com/green-api/logo)

#### Битрикс24

*   [Пользовательское соглашение для Битрикс24](/user-agreement-bitrix24)
*   [Политика конфиденциальности для Битрикс24](/privacy-policy-bitrix24)

#### Продукты

*   [GREEN-API](/)
*   [GREEN-API: WABA](/waba)
*   [GREEN-API: GPT](/docs/gpt/)
*   [GREEN-API: MAX](/max)
*   [GREEN-API: MAX BOT API](/max-bot-api)
*   [GREEN-API: Marketing](https://green-api.com/marketing/)
*   [GREEN-API: Telegram 🔥](https://green-api.com/telegram)

#### Правовая информация

*   [Пользовательское соглашение](/user-agreement)
*   [Лицензионный договор-оферта](/license-agreement)
*   [Оферта услуги «Автоплатеж»](/recurring-payment-agreement)
*   [Политика конфиденциальности и обработки персональных данных GREEN-API](/privacy-policy)
*   [Реестр отечественного ПО](/reestr/description)
*   [Тарифная политика](/tariffs-policy-green-api.pdf)
*   [GREEN-API: Logo](https://github.com/green-api/logo)

#### Битрикс24

*   [Пользовательское соглашение для Битрикс24](/user-agreement-bitrix24)
*   [Политика конфиденциальности для Битрикс24](/privacy-policy-bitrix24)

#### Техподдержка

*    [![github icon](/docs/assets/github.svg) Форум](https://green-api.com/ru/forum)
*    [![github icon](/docs/assets/github.svg) Сообщить о проблеме](https://github.com/green-api/issues/issues/new)
*    [![email icon](/docs/assets/email.svg) support@green-api.com](mailto:support@green-api.com)
*    [![whatsapp icon](/docs/assets/whatsapp.svg) Канал поддержки WhatsApp](https://wa.me/77780739095)
*    [![telegram icon](/docs/assets/telegram.svg) Канал поддержки Telegram](https://t.me/greenapi_support_ru_bot)
*    [![telegram icon](/docs/assets/max.svg) Канал поддержки MAX](https://max.ru/id5047259512_bot)

Русский

*   ![ru](/docs/assets/flags/ru.svg) Русский
    
*    [![en](/docs/assets/flags/en.svg) English](/en/docs/)

 [![googlePlay](/docs/assets/mobile-application/googleplay-ru-white.svg)](https://play.google.com/store/apps/details?id=com.greenapi.console)[![googlePlay](/docs/assets/mobile-application/rustore-white.svg) ](https://www.rustore.ru/catalog/app/com.greenapi.console)[![Powered by GREEN-API](/docs/assets/powered_green_api.svg)](https://green-api.com/)

Русский

*   ![ru](/docs/assets/flags/ru.svg) Русский
    
*    [![en](/docs/assets/flags/en.svg) English](/en/docs/)

 [![googlePlay](/docs/assets/mobile-application/googleplay-ru-white.svg)](https://play.google.com/store/apps/details?id=com.greenapi.console)[![googlePlay](/docs/assets/mobile-application/rustore-white.svg) ](https://www.rustore.ru/catalog/app/com.greenapi.console)[![Powered by GREEN-API](/docs/assets/powered_green_api.svg)](https://green-api.com/)

Общество с ограниченной ответственностью «Грин-АПИ»

ИНН: 5047259512, ОГРН: 1215000131532

Телефон: [+7-999-333-12-23](tel:+79993331223)

141402, Московская область, г Химки, ул Московская, стр. 38А, помещ. 9/001, БЦ "Панорама"

Основной ОКВЭД: 62.01 — Разработка компьютерного программного обеспечения

[Единый реестр российских программ для ЭВМ и баз данных, запись № 26143 ПО «GREEN-API»](/reestr/description) _\*WhatsApp принадлежит компании Meta Platforms Inc., деятельность которой признана экстремистской и запрещена на территории РФ._

[![WhatsApp](/docs/assets/whatsappWhite.svg)](https://whatsapp.com/channel/0029VaHUM5TBA1f7cG29nO1C)

[![Telegram](/docs/assets/telegramWhite.svg)](https://t.me/green_api)

[![YouTube](/docs/assets/youtube.svg)](https://www.youtube.com/@green-api)

[![RuTube](/docs/assets/rutube.svg)](https://rutube.ru/channel/49192924)

[![LinkedIn](/docs/assets/linkedin.svg)](https://www.linkedin.com/company/green-api/posts/)

[![Dzen](/docs/assets/dzen.svg)](https://dzen.ru/id/67d93508575f0a425c77809e)

[![VK](/docs/assets/vk.svg)](https://vk.com/green_api)

GREEN-API © 2015 -

[![WhatsApp](/docs/assets/whatsappWhite.svg)](https://whatsapp.com/channel/0029VaHUM5TBA1f7cG29nO1C)

[![Telegram](/docs/assets/telegramWhite.svg)](https://t.me/green_api)

[![YouTube](/docs/assets/youtube.svg)](https://www.youtube.com/@green-api)

[![RuTube](/docs/assets/rutube.svg)](https://rutube.ru/channel/49192924)

[![LinkedIn](/docs/assets/linkedin.svg)](https://www.linkedin.com/company/green-api/posts/)

[![Instagram](/docs/assets/instagram.svg)](https://www.instagram.com/green_api/)

[![Dzen](/docs/assets/dzen.svg)](https://dzen.ru/id/67d93508575f0a425c77809e)

[![VK](/docs/assets/vk.svg)](https://vk.com/green_api)

![MIR](/docs/assets/pay/mirPayment.svg) ![MIRAccept](/docs/assets/pay/mirAcceptPayment.svg) ![VISA](/docs/assets/pay/visaPayment.svg) ![verified by visa](/docs/assets/pay/visaVerifiedPayment.svg) ![mastercard](/docs/assets/pay/mastercardPayment.svg) ![mastercard SecureCode](/docs/assets/pay/masterCardSecureCodePayment.svg)

