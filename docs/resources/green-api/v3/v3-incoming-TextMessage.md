# GREEN-API v3 (MAX): v3-incoming-TextMessage

> Source: https://green-api.com/v3/docs/api/receiving/notifications-format/incoming-message/TextMessage/
> Saved: 2026-11-12

Редактировать страницу")

# Входящее текстовое сообщение[#](#_1 "Permanent link")

[![Postman](../../../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api-max/request/7uaw5tg/) [![Apidog](../../../../../assets/apidog.svg)](https://ln3fqbtgjx.apidog.io/%D1%82%D0%B5%D0%BA%D1%81%D1%82%D0%BE%D0%B2%D0%BE%D0%B5-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B5-20743112e0)

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

Тип полученного сообщения. Для сообщений данного типа поле принимает значение `textMessage`

`textMessageData`

**object**

Объект данных о текстовом сообщении

`quotedMessage`

**object**

Объект данных о цитируемом сообщении.  
Присутствует, только если само сообщение является цитатой

Поля объекта `textMessageData`

Параметр

Тип

Описание

`textMessage`

**string**

Текстовое сообщение

`isForwarded`

**boolean**

Является ли сообщение пересланным, принимает значения `true`/`false`

`forwardingScore`

**integer**

Количество пересылок сообщения

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

### Пример тела уведомления[#](#webhook-example-body "Permanent link")

#### Пример тела уведомления сообщения из личного чата[#](#webhook-example-body-personal "Permanent link")

  `{     "typeWebhook": "incomingMessageReceived",     "instanceData": {         "idInstance": 3100000000,         "wid": "79991234567@c.us",         "typeInstance": "v3"     },     "timestamp": 1763115112,     "idMessage": "1763115112345",     "senderData": {         "chatId": "10000000",         "chatName": "Ходабрыш Пробешёлов",         "chatType": "user",         "sender": "10000000",         "senderName": "Ходабрыш Пробешёлов",         "senderType": "user",         "senderContactName": "Ходабрыш Пробешёлов",         "senderPhoneNumber": 79876543210     },     "messageData": {         "typeMessage": "textMessage",         "textMessageData": {             "textMessage": "Я использую GREEN-API для отправки этого сообщения!"         }     } }`

#### Пример тела уведомления сообщения из группового чата[#](#webhook-example-body-group "Permanent link")

  `{     "typeWebhook": "incomingMessageReceived",     "instanceData": {         "idInstance": 3100000000,         "wid": "79991234567@c.us",         "typeInstance": "v3"     },     "timestamp": 1763115112,     "idMessage": "1763115112345",     "senderData": {         "chatId": "-69876543210123",         "chatName": "Название группы",         "chatType": "group",         "sender": "10000000",         "senderName": "Ходабрыш",         "senderType": "user",         "senderContactName": "",         "senderPhoneNumber": 0     },     "messageData": {         "typeMessage": "textMessage",         "textMessageData": {             "textMessage": "Я использую GREEN-API для отправки этого сообщения!",             "forwardingScore": 0,             "isForwarded": false         }     } }`

[

Назад Входящие сообщения



](../Webhook-IncomingMessageReceived/)[

Вперед Входящее текстовое сообщение с URL

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
*   [GREEN-API: Telegram 🔥](/telegram)

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

*    [![github icon](/v3/docs/assets/github.svg) Форум](https://green-api.com/ru/forum)
*    [![github icon](/v3/docs/assets/github.svg) Сообщить о проблеме](https://github.com/green-api/issues/issues/new)
*    [![email icon](/v3/docs/assets/email.svg) support@green-api.com](mailto:support@green-api.com)
*    [![whatsapp icon](/v3/docs/assets/whatsapp.svg) Канал поддержки WhatsApp](https://wa.me/77780739095)
*    [![telegram icon](/v3/docs/assets/telegram.svg) Канал поддержки Telegram](https://t.me/greenapi_support_ru_bot)
*    [![max icon](/v3/docs/assets/max.svg) Канал поддержки MAX](https://max.ru/id5047259512_bot)

 [![googlePlay](/v3/docs/assets/mobile-application/googleplay-ru-white.svg)](https://play.google.com/store/apps/details?id=com.greenapi.console)[![googlePlay](/v3/docs/assets/mobile-application/rustore-white.svg) ](https://www.rustore.ru/catalog/app/com.greenapi.console)[![Powered by GREEN-API](/v3/docs/assets/powered_green_api.svg)](https://green-api.com/)

 [![googlePlay](/v3/docs/assets/mobile-application/googleplay-ru-white.svg)](https://play.google.com/store/apps/details?id=com.greenapi.console)[![googlePlay](/v3/docs/assets/mobile-application/rustore-white.svg) ](https://www.rustore.ru/catalog/app/com.greenapi.console)[![Powered by GREEN-API](/v3/docs/assets/powered_green_api.svg)](https://green-api.com/)

Общество с ограниченной ответственностью «Грин-АПИ»

ИНН: 5047259512, ОГРН: 1215000131532

Телефон: [+7-999-333-12-23](tel:+79993331223)

141402, Московская область, г Химки, ул Московская, стр. 38А, помещ. 9/001, БЦ "Панорама"

Основной ОКВЭД: 62.01 — Разработка компьютерного программного обеспечения

[Единый реестр российских программ для ЭВМ и баз данных, запись № 26143 ПО «GREEN-API»](/reestr/description)

[![WhatsApp](/v3/docs/assets/whatsappWhite.svg)](https://whatsapp.com/channel/0029VaHUM5TBA1f7cG29nO1C)

[![Telegram](/v3/docs/assets/telegramWhite.svg)](https://t.me/green_api)

[![YouTube](/v3/docs/assets/youtube.svg)](https://www.youtube.com/@green-api)

[![RuTube](/v3/docs/assets/rutube.svg)](https://rutube.ru/channel/49192924)

[![LinkedIn](/v3/docs/assets/linkedin.svg)](https://www.linkedin.com/company/green-api/posts/)

[![Dzen](/v3/docs/assets/dzen.svg)](https://dzen.ru/id/67d93508575f0a425c77809e)

[![VK](/v3/docs/assets/vk.svg)](https://vk.com/green_api)

GREEN-API © 2015 -

[![WhatsApp](/v3/docs/assets/whatsappWhite.svg)](https://whatsapp.com/channel/0029VaHUM5TBA1f7cG29nO1C)

[![Telegram](/v3/docs/assets/telegramWhite.svg)](https://t.me/green_api)

[![YouTube](/v3/docs/assets/youtube.svg)](https://www.youtube.com/@green-api)

[![RuTube](/v3/docs/assets/rutube.svg)](https://rutube.ru/channel/49192924)

[![LinkedIn](/v3/docs/assets/linkedin.svg)](https://www.linkedin.com/company/green-api/posts/)

[![Instagram](/v3/docs/assets/instagram.svg)](https://www.instagram.com/green_api/)

[![Dzen](/v3/docs/assets/dzen.svg)](https://dzen.ru/id/67d93508575f0a425c77809e)

[![VK](/v3/docs/assets/vk.svg)](https://vk.com/green_api)

![MIR](/v3/docs/assets/pay/mirPayment.svg) ![MIRAccept](/v3/docs/assets/pay/mirAcceptPayment.svg) ![VISA](/v3/docs/assets/pay/visaPayment.svg) ![verified by visa](/v3/docs/assets/pay/visaVerifiedPayment.svg) ![mastercard](/v3/docs/assets/pay/mastercardPayment.svg) ![mastercard SecureCode](/v3/docs/assets/pay/masterCardSecureCodePayment.svg)

