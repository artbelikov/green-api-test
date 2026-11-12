# GREEN-API v3 (MAX): v3-chat-id

> Source: https://green-api.com/v3/docs/api/chat-id/
> Saved: 2026-11-12

Редактировать страницу")

# Идентификатор чата[#](#_1 "Permanent link")

Чат может быть индивидуальным или групповым.  
В случае группового чата идентификатор чата может содержать знак минус "-".

Пример идентификатора индивидуального чата: `chatId` = "10000000"  
Пример идентификатора группового чата: `chatId` = "-10000000000000"

Важно

Идентификатор чата представлен **строкой** для обратной совместимости. Однако, рекомендуется выполнять преобразование из строки в число для более компактного хранения в базе данных.

Число может быть как положительным (для индивидуальных чатов), так и отрицательным (для групповых чатов).  
Максимальная длина значения для групповых чатов составляет 16 символов.

> Длина идентификатора чата может увеличиться со временем.

## Как получить идентификатор чата?[#](#_2 "Permanent link")

Идентификатор чата можно получить:

1.  При обработке [входящих уведомлений](../receiving/notifications-format/)
    
    Идентификатор чата будет указан в поле `"senderData": "sender"`  
    Пример уведомления:
    
    `{ "typeWebhook": "incomingMessageReceived", "instanceData": {   "idInstance": 3100000000,   "wid": "79991234567@c.us",   "typeInstance": "v3"   }, "timestamp": 1763115112, "idMessage": "1763115112345", "senderData": {   "chatId": "10000000",   "chatName": "Ходабрыш Пробешёлов",   "chatType": "user",   "sender": "10000000",   "senderName": "Ходабрыш Пробешёлов",   "senderType": "user",   "senderContactName": "Ходабрыш Пробешёлов",   "senderPhoneNumber": 79876543210   }, "messageData": {   "typeMessage": "textMessage",   "textMessageData": {   "textMessage": "Я использую GREEN-API для отправки этого сообщения!"   } } }`
    
2.  Через журнал входящих сообщений [LastIncomingMessages](../journals/LastIncomingMessages/)
    
    Идентификатор чата будет указан в поле `"senderData": "sender"`  
    Пример сообщения в журнале:
    
    `{ "typeWebhook": "incomingMessageReceived", "instanceData": {   "idInstance": 3100000000,   "wid": "79991234567@c.us",   "typeInstance": "v3"     }, "timestamp": 1763115112, "idMessage": "1763115112345", "senderData": {   "chatId": "10000000",   "chatName": "Ходабрыш Пробешёлов",   "chatType": "user",   "sender": "10000000",   "senderName": "Ходабрыш Пробешёлов",   "senderType": "user",   "senderContactName": "Ходабрыш Пробешёлов",   "senderPhoneNumber": 79876543210   }, "messageData": {   "typeMessage": "textMessage",   "textMessageData": {   "textMessage": "Я использую GREEN-API для отправки этого сообщения!"   } } }`
    
3.  Методом получения списка контактов [GetContacts](../service/GetContacts/)
    
    Идентификатор чата будет указан в поле `"chatId"`  
    Пример контакта:
    
    `{     "chatId": "10000002",     "name": "Вася Петров",     "contactName": "Вася Петров",     "type": "user" }`
    
4.  Методом проверки существования аккаунта по номеру телефона [CheckAccount](../service/CheckAccount/).
    
    Идентификатор чата будет указан в поле `"chatId"`  
    Пример ответа:
    
    `{     "exist": true,     "chatId": "10000000" }`
    

## Отправка сообщений по идентификатору чата[#](#send-by-chat-id "Permanent link")

Рекомендуется отправлять сообщения по идентификатору чата (`chatId`).

*   Если Идентификатор чата известен, то используйте его в методах отправки сообщений [SendMessage](../sending/SendMessage/) и др.
*   Если Идентификатор чата неизвестен, то сначала используйте метод [CheckAccount](../service/CheckAccount/), получите значение `chatId`, и далее используйте `chatId` в методах отправки сообщений [SendMessage](../sending/SendMessage/) и др.

## Отправка сообщений по номеру телефона[#](#send-by-phone "Permanent link")

Для поддержки обратной совместимости с предыдущими версиями интерфейса допускается указывать номер телефона клиента в формате `phoneNumber@c.us` в качестве идентификатора чата в методе отправки сообщений [SendMessage](../sending/SendMessage/) и др.

Допускается использовать только номера телефонов для **РФ** и **РБ** с кодами стран `7` и `375` соответственно.

Пример идентификатора чата для РФ: `chatId` = "[79991234567@c.us](mailto:79991234567@c.us)"  
Пример идентификатора чата для РБ: `chatId` = "[375291234567@c.us](mailto:375291234567@c.us)"

Важно!

При отправке сообщений по номеру телефона, система вернет Идентификатор чата, который назначит сервер, во входящем уведомлении.  
Идентификатор чата будет отражен в вебхуке в параметре `chatId`.

Поэтому отправку по номеру телефона можно использовать только в случаях, когда не требуется обрабатывать входящие сообщения и статусы.  
Во всех остальных случаях рекомендуется сначала получать Идентификатор чата методом [CheckAccount](../service/CheckAccount/), а затем выполнять отправку по полученному значению `chatId`, а не по номеру телефона.

**Читайте также:**

*   [Рекомендации по отправке сообщений](../send-messages-recommendations/)

[

Назад Удалить контакт



](../contacts/DeleteContact/)[

Вперед Идентификатор сообщения

](../message-id/)

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

