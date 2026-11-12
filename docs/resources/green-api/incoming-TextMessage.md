# GREEN-API: incoming-TextMessage

> Source: https://green-api.com/docs/api/receiving/notifications-format/incoming-message/TextMessage/
> Saved: 2026-11-12

Редактировать страницу")

# Входящее текстовое сообщение[#](#_1 "Permanent link")

В данном разделе описывается формат входящего уведомления объекта `messageData` для входящего текстового сообщения. Для получения описания общего формата входящих уведомлений обратитесь к разделу [Входящие сообщения](../Webhook-IncomingMessageReceived/).

Для получения входящих уведомлений данного вида требуется выполнение двух условий:

`typeWebhook` = `incomingMessageReceived`

`messageData.typeMessage` = `textMessage`

Настройка инстанса

Чтобы получать входящие уведомления о входящих сообщениях, необходимо включить настройки одним из представленных вариантов:

1.  Через [личный кабинет](https://console.green-api.com/instanceList) включить настройку `Получать уведомления о входящих сообщениях и файлах`
    
2.  Через метод [SetSettings](../../../../account/SetSettings/) включить настройку `incomingWebhook`
    

## Уведомление[#](#webhook "Permanent link")

### Формат уведомления[#](#webhook-parameters "Permanent link")

Поля объекта `messageData`

Параметр

Тип

Описание

`typeMessage`

**string**

Тип принятого сообщения. Для сообщений данного типа поле принимает значение `textMessage`

`textMessageData`

**object**

Объект данных о текстовом сообщении

`quotedMessage`

**object**

Объект данных о цитируемом сообщении. Присутствует только, если само сообщение является цитатой

Поля объекта `textMessageData`

Параметр

Тип

Описание

`textMessage`

**string**

Текстовое сообщение

`isTemplateMessage`

**boolean**

Флаг указывает, было ли сообщение сгенерировано из шаблона

Поля объекта `quotedMessage`

Параметр

Тип

Описание

`stanzaId`

**string**

id цитируемого сообщения

`participant`

**string**

id отправителя цитируемого сообщения

`typeMessage`

**string**

Тип цитируемого сообщения

Остальные поля заполняются в зависимости от типа цитируемого сообщения и идентичны полям входящих сообщений описанных в разделе [Входящие сообщения](../Webhook-IncomingMessageReceived/)

### Пример тела уведомления[#](#webhook-example-body "Permanent link")

`{   "typeWebhook": "incomingMessageReceived",   "instanceData": {     "idInstance": 1101111111,     "wid": "79876543210@c.us",     "typeInstance": "whatsapp"   },   "timestamp": 1588091580,   "idMessage": "F7AEC1B7086ECDC7E6E45923F5EDB825",   "senderData": {     "chatId": "79001234567@c.us",     "sender": "79001234567@c.us",       "chatName": "Иван",     "senderName": "Иван",     "senderContactName": "Иван Царевич"   },   "messageData": {     "typeMessage": "textMessage",     "textMessageData": {       "textMessage": "I use Green-API to send this message to you!"     }   } }`

### Пример тела уведомления с сообщением из группового чата[#](#webhook-example-body-group "Permanent link")

`{     "typeWebhook": "incomingMessageReceived",     "instanceData": {         "idInstance": 1101111111,         "wid": "79876543210@c.us",         "typeInstance": "whatsapp"     },     "timestamp": 1732268220,     "idMessage": "2D9D6721A977D369246509EBE0CE44CA",     "senderData": {       "chatId": "120363369140947676@g.us",         "chatName": "Группа",         "sender": "79001234567@c.us",         "senderName": "Иван",         "senderContactName": "Иван Царевич"     },     "messageData": {         "typeMessage": "textMessage",         "textMessageData": {             "textMessage": "I use Green-API to send this message to you!"         }     } }`

### Пример тела уведомления с цитатой текстового сообщения[#](#webhook-example-body-text-quote "Permanent link")

`{   "typeWebhook": "incomingMessageReceived",   "instanceData": {     "idInstance": 1101111111,     "wid": "79876543210@c.us",     "typeInstance": "whatsapp"   },   "timestamp": 1588091580,   "idMessage": "F7AEC1B7086ECDC7E6E45923F5EDB825",   "senderData": {     "chatId": "79001234567@c.us",     "sender": "79001234567@c.us",       "chatName": "Иван",     "senderName": "Иван",     "senderContactName": "Иван Царевич"   },   "messageData": {     "typeMessage": "quotedMessage",     "extendedTextMessageData": {       "text": "Это",       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us"     },     "quotedMessage": {       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us",       "typeMessage": "textMessage",       "textMessage": "Привет"     }   } }`

### Пример тела уведомления текстового сообщения с цитатой сообщения изображения/видео/аудио/документ[#](#webhook-example-body-media-quote "Permanent link")

`{   "typeWebhook": "incomingMessageReceived",   "instanceData": {     "idInstance": 1101111111,     "wid": "79876543210@c.us",     "typeInstance": "whatsapp"   },   "timestamp": 1588091580,   "idMessage": "F7AEC1B7086ECDC7E6E45923F5EDB825",   "senderData": {     "chatId": "79001234567@c.us",     "sender": "79001234567@c.us",       "chatName": "Иван",     "senderName": "Иван",     "senderContactName": "Иван Царевич"   },   "messageData": {     "typeMessage": "quotedMessage",     "extendedTextMessageData": {       "text": "Ответ",       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us"     },     "quotedMessage": {       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us",       "typeMessage": "imageMessage",       "downloadUrl": "",       "caption": "",       "jpegThumbnail": ""     }   } }`

### Пример тела уведомления с цитатой сообщения контакт[#](#webhook-example-body-contact-quote "Permanent link")

`{   "typeWebhook": "incomingMessageReceived",   "instanceData": {     "idInstance": 1101111111,     "wid": "79876543210@c.us",     "typeInstance": "whatsapp"   },   "timestamp": 1588091580,   "idMessage": "F7AEC1B7086ECDC7E6E45923F5EDB825",   "senderData": {     "chatId": "79001234567@c.us",     "sender": "79001234567@c.us",       "chatName": "Иван",     "senderName": "Иван",     "senderContactName": "Иван Царевич"   },   "messageData": {     "typeMessage": "quotedMessage",     "extendedTextMessageData": {       "text": "Ответ",       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us"     },     "quotedMessage": {       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us",       "typeMessage": "contactMessage",       "contact": {         "displayName": "Green-Api",         "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:Green-Api\nitem1.TEL;waid=79001230000\nitem1.X-ABLabel:Мобильный\nEND:VCARD"       }     }   } }`

### Пример тела уведомления с цитатой сообщения геопозиция[#](#webhook-example-body-location-quote "Permanent link")

`{   "typeWebhook": "incomingMessageReceived",   "instanceData": {     "idInstance": 1101111111,     "wid": "79876543210@c.us",     "typeInstance": "whatsapp"   },   "timestamp": 1588091580,   "idMessage": "F7AEC1B7086ECDC7E6E45923F5EDB825",   "senderData": {     "chatId": "79001234567@c.us",     "sender": "79001234567@c.us",       "chatName": "Иван",     "senderName": "Иван",     "senderContactName": "Иван Царевич"   },   "messageData": {     "typeMessage": "quotedMessage",     "extendedTextMessageData": {       "text": "Адрес",       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us"     },     "quotedMessage": {       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us",       "typeMessage": "locationMessage",       "location": {         "nameLocation": "",         "address": "",         "jpegThumbnail": "",         "latitude": 72.5922702,         "longitude": 39.6645388       }     }   } }`

### Пример тела уведомления с цитатой сообщения ссылка[#](#webhook-example-body-link-quote "Permanent link")

`{   "typeWebhook": "incomingMessageReceived",   "instanceData": {     "idInstance": 1101111111,     "wid": "79876543210@c.us",     "typeInstance": "whatsapp"   },   "timestamp": 1658261933,   "idMessage": "CDF9219DD08D3D84CD4E621122AFBFFD",   "senderData": {     "chatId": "79001234567@c.us",     "sender": "79001234567@c.us",       "chatName": "Иван",     "senderName": "Иван",     "senderContactName": "Иван Царевич"   },   "messageData": {     "typeMessage": "quotedMessage",     "extendedTextMessageData": {       "text": "Hello",       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us"     },     "quotedMessage": {       "stanzaId": "46618B98B3B9DF50F123456789123456",       "participant": "79001234567@c.us",       "typeMessage": "extendedTextMessage",       "textMessage": "https://api.green-api.com/send/?phone=79876543210&text&type=phone_number&app_absent=0",       "extendedTextMessage": {         "description": " is free and offers simple, secure, reliable messaging and calling, available on phones all over the world.",         "title": "Share on ",         "previewType": "None",         "jpegThumbnail": null       }     }   } }`

### Пример тела уведомления с ошибкой SWE001[#](#webhook-example-body-SWE001 "Permanent link")

`{     "typeWebhook": "incomingMessageReceived",     "instanceData":         {         "idInstance":1100000001,         "wid":"79876543210@c.us",         "typeInstance":"whatsapp"     },     "timestamp":1700545580,     "idMessage":"3AE2864C77312000000",     "senderData":         {         "chatId":"79001234567@c.us",         "chatName":"Иван",         "sender":"79001234567@c.us",         "senderName":"Иван",     "senderContactName": "Иван Царевич"     },     "messageData":         {         "typeMessage":"textMessage",         "textMessageData":             {             "textMessage":"{{SWE001}}"         }     } }`

### Пример тела уведомления с ошибкой SWE002[#](#webhook-example-body-SWE002 "Permanent link")

`{     "typeWebhook":"incomingMessageReceived",     "instanceData":         {         "idInstance":1100000001,         "wid":"79876543210@c.us",         "typeInstance":"whatsapp"     },     "timestamp":1700488335,     "idMessage":"3EB0D00923D87A3FA01BAE",     "senderData":         {         "chatId":"79001234567@c.us",         "chatName":"Иван",         "sender":"79001234567@c.us",         "senderName":"Иван",     "senderContactName": "Иван Царевич"     },     "messageData":         {         "typeMessage":"documentMessage",         "fileMessageData":             {             "downloadUrl":"{{SWE002}}",             "caption":"",             "fileName":"Harry Potter and the Philosopher's Stone.pdf",             "jpegThumbnail":"",             "mimeType":"application/pdf",             "forwardingScore":0,             "isForwarded":false         }     } }`

### Пример тела уведомления с ошибкой SWE003[#](#webhook-example-body-SWE003 "Permanent link")

`{     "typeWebhook":"incomingMessageReceived",     "instanceData":         {         "idInstance":1100000001,         "wid":"79876543210@c.us",         "typeInstance":"whatsapp"     },     "timestamp":1700218861,     "idMessage":"6E112CC05BA05DD9DF",     "senderData":         {         "chatId":"79001234567@c.us",         "chatName":"Иван",         "sender":"79001234567@c.us",         "senderName":"Иван",     "senderContactName": "Иван Царевич"         },     "messageData":         {         "typeMessage":"textMessage",         "textMessageData":             {             "textMessage":"{{SWE003}}"         }     } }`

### Пример тела уведомления с ошибкой SWE005[#](#webhook-example-body-SWE005 "Permanent link")

`{   "typeWebhook": "incomingMessageReceived",   "idMessage": "3A84B09F0278B2903234",   "instanceData": {     "idInstance": 1100000001,     "wid": "79876543210@c.us",     "typeInstance": "whatsapp"   },   "timestamp": 1785213226,   "senderData": {     "chatId": "79001234567@c.us",     "sender": "79001234567@c.us",     "senderName": "Иван",     "senderContactName": "Иван Царевич",     "chatName": "Иван"   },   "messageData": {     "typeMessage": "textMessage",     "textMessageData": {       "textMessage": "{{SWE005}}"     }   } }`

### Пример тела уведомления с ошибкой SWE999[#](#webhook-example-body-SWE999 "Permanent link")

`{     "typeWebhook": "incomingMessageReceived",     "instanceData":         {         "idInstance":1100000001,         "wid":"79876543210@c.us",         "typeInstance":"whatsapp"     },     "timestamp":1700545580,     "idMessage":"3AE2864C77312000000",     "senderData":         {         "chatId":"79001234567@c.us",         "chatName":"Иван",         "sender":"79001234567@c.us",         "senderName":"Иван",     "senderContactName": "Иван Царевич"     },     "messageData":         {         "typeMessage":"textMessage",         "textMessageData":             {             "textMessage":"{{SWE999}}"         }     } }`

[

Назад Входящие сообщения



](../Webhook-IncomingMessageReceived/)[

Вперед Входящее текстовое сообщение, сообщение с URL или рекламное сообщение

](../ExtendedTextMessage/)

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

