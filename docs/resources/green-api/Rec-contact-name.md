# GREEN-API: Rec-contact-name

> Source: https://green-api.com/docs/api/recommendations/how-to-get-contact-name/
> Saved: 2026-11-12

Редактировать страницу")

# Как получить имя собеседника в интеграциях?[#](#_1 "Permanent link")

### Содержание[#](#TOC "Permanent link")

*   [Почему не всегда доступно имя?](#001)
*   [Как получить имя собеседника?](#002)
    *   [GetContacts](#GetContacts)
    *   [GetContactInfo](#GetContactInfo)
    *   [GetGroupData](#GetGroupData)
    *   [GetChats](#GetChats)
    *   [Обработка уведомлений](#notifications)
*   [Как инициировать чат, если имени ещё нет?](#003)
*   [Заключение](#004)

## Почему не всегда доступно имя?[#](#001 "Permanent link")

Из-за политики безопасности WhatsApp\* имя пользователя может быть недоступно в некоторых случаях:

*   Если вы пишете первым, и номер не сохранён в контактах;
*   Если собеседник не ответил на ваше сообщение;
*   Если номер не фигурирует в истории переписки (нет чата).

В таких случаях WhatsApp\* может не предоставлять информацию о профиле, включая имя.

## Как получить имя собеседника?[#](#002 "Permanent link")

### **GetContacts**[#](#GetContacts "Permanent link")

Метод [`GetContacts`](../../service/GetContacts/) позволяет получить список номеров, добавленных в контакты, или тех, с кем у вас уже был чат.

*   Если с номером уже есть чат или номер сохранен в контактах, он будет доступен через этот метод;
*   В ответе можно найти поле `name` — это имя, указанное пользователем в WhatsApp\*;
*   Если имя недоступно, возвращается только номер или пустое поле.

**Пример структуры ответа:**

`{     "id": "79876543210@c.us",     "name": "Имя",     "contactName": "Имя контакта",     "type": "user"     }`

Важно!

Если вы хотите, чтобы контакт отобразился при запросе `GetContacts`, нужно:

*   либо сохранить номер вручную в контакты,
*   либо чтобы с номером был хотя бы один чат (входящее или исходящее сообщение).

* * *

### **GetContactInfo**[#](#GetContactInfo "Permanent link")

Метод [`GetContactInfo`](../../service/GetContactInfo/) позволяет получить данные по конкретному номеру телефона.

В ответе может быть доступно:

*   `name` — имя профиля (если доступно),
*   `contactName` — имя, указанное в контактной книге (если номер сохранён в контакты),
*   другие данные о профиле (аватар, электронная почта и др.)

**Пример структуры ответа:**

`{     "avatar": "https://pps.whatsapp.net/v/...",         "name": "Имя",     "contactName": "Имя контакта",     {...} }`

* * *

### **GetGroupData**[#](#GetGroupData "Permanent link")

Если вы работаете с группами, метод [`GetGroupData`](../../groups/GetGroupData/) поможет получить название группы, из которой пришло сообщение.

**Пример структуры ответа:**

`{     "groupId": "12345678909876543210@g.us",     "owner": "79876543210@c.us",     "subject": "GREEN-API Group",     {...} }`

* * *

### **GetChats**[#](#GetChats "Permanent link")

Самый быстрый способ получить имя пользователя или название группы, в которой была недавняя переписка - это использовать метод [GetChats](../../service/GetChats/).

Важной особенностью метода, является необязательный параметр `count`, с помощью которого обрабатываются только последние активные чаты. В ответе метода все чаты сортируются по времени.

Время обновления результатов метода

После того как в чате произошла переписка, необходимо подождать не менее 1 минуты, чтобы метод вернул обновленную информацию.

**Пример структуры ответа:**

`{     {         "archive": false,         "id": "79876543210@c.us",         "ephemeralExpiration": 86400,         "ephemeralSettingTimestamp": 1777870423,         "name": "Иван Царевич",         "type": "user"     },     {         "archive": false,         "id": "79001234567@c.us",         "ephemeralExpiration": 0,         "ephemeralSettingTimestamp": 0,         "name": "Василиса Прекрасная",         "type": "user"     },     {         "archive": false,         "id": "79001234567-1479621234@g.us",         "ephemeralExpiration": 0,         "ephemeralSettingTimestamp": 0,         "name": "Моя группа",         "type": "group"     } }`

*   В ответе можно найти поле `name` — это имя, указанное пользователем в WhatsApp\* или имя группы.

* * *

### **Обработка уведомлений**[#](#notifications "Permanent link")

Один из самых надежных способов получить имя — [обрабатывать входящие уведомления](../../receiving/).

Когда вы получаете входящее сообщение, в теле уведомления может быть поле с именем отправителя. Это имя отображается даже в случае, если вы не сохранили контакт, при условии, что пользователь написал первым.

**Пример структуры уведомления:**

`{     "typeWebhook": "incomingMessageReceived",     "instanceData": {...},     "timestamp": 1111111111,     "idMessage": "F7AEC1B7086ECDC7E6E45923F5EDB825",     "senderData": {         "chatId": "79001234567@c.us",         "sender": "79001234567@c.us",             "chatName": "Иван",         "senderName": "Иван",         "senderContactName": "Иван Царевич"     },     "messageData": {...} }`

Важно!

Имя в `senderName` может быть недоступно, если вы писали первым и пользователь не ответил.

## Как инициировать чат, если имени ещё нет?[#](#003 "Permanent link")

Если необходимо начать диалог с пользователем, у которого нет чата и контакт не сохранен:

*   Используйте [`методы отправки`](../../sending/) с указанием номера в формате chatId (`{номер}@c.us`).
*   После этого чат создастся, но **имя не гарантированно появится** — оно отобразится только после ответа пользователя.

## Заключение[#](#004 "Permanent link")

Если вы строите систему CRM или бота, которые должна "запоминать" имена пользователей, рекомендуется следующий алгоритм:

1.  При получении входящего сообщения — сохраняйте `senderName` локально;
2.  При отправке сообщений первым — не рассчитывайте на наличие имени сразу;
3.  Когда получите ответ — обновите имя в своей базе.

[

Назад Интеграция новых полей в API



](../integration-of-new-fields/)[

Вперед Обзор

](../../../partners/)

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

