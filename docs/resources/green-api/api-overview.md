# GREEN-API: api-overview

> Source: https://green-api.com/docs/api/
> Saved: 2026-11-12

Редактировать страницу")

# Справочник методов WhatsApp\* API[#](#whatsapp-api "Permanent link")

GREEN-API предоставляет HTTP API WhatsApp для отправки и получения сообщений, файлов, работы с групповыми чатами, получения списка контактов и других методов.

Перед выполнением запросов убедитесь, что выполнены все шаги раздела [Перед началом работы](../before-start/). Ознакомьтесь с разделом [Выполнение запросов](../request-format/). Для отладки запросов к GREEN-API воспользуйтесь [Коллекцией Postman](../postman-collection/).

## [Аккаунт](account/)[#](#account "Permanent link")

*   [Получить настройки инстанса](account/GetSettings/)
*   [Установить настройки инстанса](account/SetSettings/)
*   [Получить состояние инстанса](account/GetStateInstance/)
*   [Получить историю состояния инстанса](account/GetStateInstanceHistory/)
*   [Перезапустить инстанс](account/Reboot/)
*   [Разлогинить инстанс](account/Logout/)
*   [Получить QR-код](account/QR/)
*   [Получить QR-код через websocket](account/Scanqrcode/)
*   [Связать по номеру телефона](account/GetAuthorizationCode/)
*   [Получить информацию об аккаунте WhatsApp](account/GetWaSettings/)

## [Отправка](sending/)[#](#sending "Permanent link")

*   [Отправить текст](sending/SendMessage/)
*   [Отправить опрос](sending/SendPoll/)
*   [Отправить видео, аудио, изображение, документ](sending/SendFileByUpload/)
*   [Отправить видео, аудио, изображение, документ по URL](sending/SendFileByUrl/)
*   [Отправить геолокацию](sending/SendLocation/)
*   [Отправить контакт](sending/SendContact/)
*   [Переслать сообщения](sending/ForwardMessages/)
*   [Отправить интерактивные кнопки](sending/SendInteractiveButtons/)
*   [Отправить интерактивные кнопки с ответом](sending/SendInteractiveButtonsReply/)

## [Получение](receiving/)[#](#receiving "Permanent link")

### [Получение уведомлений через HTTP API](receiving/technology-http-api/)[#](#technology-http-api "Permanent link")

*   [Получить уведомление](receiving/technology-http-api/ReceiveNotification/)
*   [Удалить уведомление](receiving/technology-http-api/DeleteNotification/)

### [Получение уведомлений через Webhook Endpoint](receiving/technology-webhook-endpoint/)[#](#technology-webhook-endpoint "Permanent link")

### [Формат входящих уведомлений](receiving/notifications-format/)[#](#notifications-format "Permanent link")

#### [Входящее сообщение](receiving/notifications-format/incoming-message/Webhook-IncomingMessageReceived/)[#](#receiving-incoming-message "Permanent link")

*   [Входящее текстовое сообщение](receiving/notifications-format/incoming-message/TextMessage/)
*   [Выбор обычной кнопки](receiving/notifications-format/selected-buttons/ButtonsResponseMessage/)
*   [Выбор шаблонной кнопки](receiving/notifications-format/selected-buttons/TemplateButtonsReplyMessage/)
*   [Выбор элемента списка](receiving/notifications-format/selected-buttons/ListResponseMessage/)
*   [Входящее текстовое сообщение, сообщение с URL, рекламное сообщение](receiving/notifications-format/incoming-message/ExtendedTextMessage/)
*   [Входящее сообщение с цитированием](receiving/notifications-format/incoming-message/QuotedMessage/)
*   [Входящее сообщение с изображением, видео, аудио, документом](receiving/notifications-format/incoming-message/ImageMessage/)
*   [Входящее сообщение с геолокацией](receiving/notifications-format/incoming-message/LocationMessage/)
*   [Входящее сообщение с контактом](receiving/notifications-format/incoming-message/ContactMessage/)
*   [Входящее сообщение с массивом контактов](receiving/notifications-format/incoming-message/ContactsArrayMessage/)
*   [Входящее сообщение со стикером](receiving/notifications-format/incoming-message/StickerMessage/)
*   [Входящее сообщение-реакция](receiving/notifications-format/incoming-message/ReactionMessage/)
*   [Входящее сообщение с приглашением в группу](receiving/notifications-format/incoming-message/GroupInviteMessage/)
*   [Входящее сообщение с опросом](receiving/notifications-format/incoming-message/PollMessage/)
*   [Входящее сообщение с обновлением опроса](receiving/notifications-format/incoming-message/PollUpdateMessage/)
*   [Входящее отредактированное сообщение](receiving/notifications-format/incoming-message/EditedMessage/)
*   [Входящее удаленное сообщение](receiving/notifications-format/incoming-message/DeletedMessage/)
*   [Входящее сообщение с интерактивными кнопками](receiving/notifications-format/incoming-message/InteractiveButtons/)
*   [Входящее сообщение с интерактивными кнопками ответа](receiving/notifications-format/incoming-message/InteractiveButtonsReply/)
*   [Статус входящего сообщения на связанных устройствах](receiving/notifications-format/incoming-message/IncomingMessageStatus/)

#### [Отправленное сообщение](receiving/notifications-format/outgoing-message/Webhook-OutgoingMessageReceived/)[#](#receiving-outgoing-message "Permanent link")

*   [Статус отправленного сообщения](receiving/notifications-format/outgoing-message/OutgoingMessageStatus/)
*   [Отправленное с телефона сообщение](receiving/notifications-format/outgoing-message/OutgoingMessage/)
*   [Отправленное сообщение через API](receiving/notifications-format/outgoing-message/OutgoingApiMessage/)
*   [Отправленное текстовое сообщение](receiving/notifications-format/outgoing-message/TextMessage/)
*   [Отправленное текстовое сообщение, сообщение с URL или рекламное сообщение](receiving/notifications-format/outgoing-message/ExtendedTextMessage/)
*   [Отправленное сообщение с цитированием](receiving/notifications-format/outgoing-message/QuotedMessage/)
*   [Отправленное сообщение с изображением, видео, аудио, документом](receiving/notifications-format/outgoing-message/ImageMessage/)
*   [Отправленное сообщение с геолокацией](receiving/notifications-format/outgoing-message/LocationMessage/)
*   [Отправленное сообщение с контактом](receiving/notifications-format/outgoing-message/ContactMessage/)
*   [Отправленное сообщение со стикером](receiving/notifications-format/outgoing-message/StickerMessage/)
*   [Отправленное сообщение-реакция](receiving/notifications-format/outgoing-message/ReactionMessage/)
*   [Отправленное сообщение с приглашением в группу](receiving/notifications-format/outgoing-message/GroupInviteMessage/)
*   [Отправленное сообщение с опросом](receiving/notifications-format/outgoing-message/PollMessage/)
*   [Отправленное сообщение с обновлением опроса](receiving/notifications-format/outgoing-message/PollUpdateMessage/)
*   [Отправленное отредактированное сообщение](receiving/notifications-format/outgoing-message/EditedMessage/)
*   [Отправленное удаленное сообщение](receiving/notifications-format/outgoing-message/DeletedMessage/)
*   [Отправленное сообщение с интерактивными кнопками](receiving/notifications-format/outgoing-message/InteractiveButtons/)
*   [Отправленное сообщение с интерактивными кнопками ответа](receiving/notifications-format/outgoing-message/InteractiveButtonsReply/)

#### Звонки[#](#receiving-calls "Permanent link")

*   [Входящий звонок](receiving/notifications-format/IncomingCall/)
*   [Исходящий звонок](receiving/notifications-format/OutgoingCall/)

#### Каталоги[#](#catalogs "Permanent link")

*   [Создать продукт в каталоге](catalogs/CreateProduct/)
*   [Редактировать продукт](catalogs/EditProduct/)
*   [Удалить продукт(ы)](catalogs/DeleteProduct/)
*   [Получить список продуктов каталога](catalogs/GetProducts/)
*   [Получить конкретный продукт](catalogs/GetProduct/)
*   [Отправить продукт в чат](catalogs/SendProduct/)
*   [Отправить заказ (корзину)](catalogs/SendOrder/)
*   [Создать коллекцию продуктов](catalogs/CreateCollection/)
*   [Получить список коллекций](catalogs/GetCollections/)
*   [Получить конкретную коллекцию](catalogs/GetCollection/)
*   [Редактировать коллекцию](catalogs/EditCollection/)
*   [Удалить коллекцию](catalogs/DeleteCollection/)
*   [Изменить порядок коллекций](catalogs/MoveCollections/)
*   [Получить данные о заказе](catalogs/GetOrderDetails/)

#### Прочие[#](#receiving-dif "Permanent link")

*   [Статус инстанса](receiving/notifications-format/StateInstanceChanged/)
*   [Превышены ограничения на тарифе](receiving/notifications-format/QuotaExceeded/)

#### Объекты[#](#receiving-obj "Permanent link")

*   [Типы входящих уведомлений](receiving/notifications-format/type-webhook/)

### Получение файлов[#](#receiving-files "Permanent link")

*   [Скачать файл из входящего сообщения](receiving/files/DownloadFile/)

## [Журналы](journals/)[#](#journals "Permanent link")

*   [Получить историю сообщений чата](journals/GetChatHistory/)
*   [Получить сообщение чата](journals/GetMessage/)
*   [Получить журнал входящих сообщений](journals/LastIncomingMessages/)
*   [Получить журнал отправленных сообщений](journals/LastOutgoingMessages/)
*   [Получить журнал входящих звонков](journals/LastIncomingCalls/)
*   [Получить журнал исходящих звонков](journals/LastOutgoingCalls/)

## [Очереди](queues/)[#](#queues "Permanent link")

*   [Получить очередь сообщений к отправке](queues/ShowMessagesQueue/)
*   [Очистить очередь сообщений к отправке](queues/ClearMessagesQueue/)

## [Группы](groups/)[#](#groups "Permanent link")

*   [Создать группу](groups/CreateGroup/)
*   [Изменить имя группы](groups/UpdateGroupName/)
*   [Получить информацию о группе](groups/GetGroupData/)
*   [Изменить настройки группы](groups/UpdateGroupSettings/)
*   [Добавить участника в группу](groups/AddGroupParticipant/)
*   [Удалить участника из группы](groups/RemoveGroupParticipant/)
*   [Назначить права администратора группы](groups/SetGroupAdmin/)
*   [Отозвать права администратора группы](groups/RemoveAdmin/)
*   [Выйти из группы](groups/LeaveGroup/)

## [Статусы (бета-версия)](statuses/)[#](#statuses "Permanent link")

### Статусы[#](#_1 "Permanent link")

*   [Отправить текстовый статус](statuses/SendTextStatus/)
*   [Отправить голосовой статус](statuses/SendVoiceStatus/)
*   [Отправить медиа статус](statuses/SendMediaStatus/)
*   [Удалить статус](statuses/DeleteStatus/)

### Статистика[#](#_2 "Permanent link")

*   [Получить статистику статуса](statuses/GetStatusStatistic/)

### История[#](#_3 "Permanent link")

*   [Получить входящие статусы](statuses/GetIncomingStatuses/)
*   [Получить исходящие статусы](statuses/GetOutgoingStatuses/)

## [Отметка прочтения](marks/)[#](#marks "Permanent link")

*   [Отметить чат прочитанным](marks/ReadChat/)

## [Сервисные методы](service/)[#](#service "Permanent link")

*   [Проверить наличие WhatsApp](service/CheckWhatsapp/)
*   [Получить аватар](service/GetAvatar/)
*   [Получить контакты](service/GetContacts/)
*   [Получить информацию о контакте](service/GetContactInfo/)
*   [Удалить сообщение](service/DeleteMessage/)
*   [Архивировать чат](service/archiveChat/)
*   [Разархивировать чат](service/unarchiveChat/)
*   [Изменить настройки исчезающих сообщений чата](service/SetDisappearingChat/)
*   [Отправить уведомление набора текста](service/SendTyping/)
*   [Получить список последних чатов](service/GetChats/)
*   [Отправить реакцию на сообщение в чат](service/SendReaction/)
*   [Получить список доступных реакций](service/GetAllowedReactions/)

## Контакты[#](#contacts "Permanent link")

*   [Добавить контакт](contacts/AddContact/)
*   [Редактировать контакт](contacts/EditContact/)
*   [Удалить контакт](contacts/DeleteContact/)

## Прочее[#](#dif "Permanent link")

*   [Идентификатор чата](chat-id/)
*   [Интервал отправки сообщений](send-messages-delay/)
*   [Стандартные ошибки](common-errors/)
*   [Достижение лимитов на тарифе Разработчик](466-error-example-body/)

## [Рекомендации по интеграции](recommendations/)[#](#recommendations "Permanent link")

*   [Создание и настройка инстанса](recommendations/creating-and-configuring-an-instance/)
*   [Cозданиe и настройка инстанса с использованием ключа партнёра](recommendations/creating-and-configuring-partners-instance/)
*   [Подключение WhatsApp к GREEN-API](recommendations/connecting-a-phone-number-to-the-Green-API/)
*   [Синхронизация данных между WhatsApp и Green-API](recommendations/data-synchronization/)
*   [Использование хостов GREEN-API](recommendations/using-green-api-hosts/)
*   [Работа с вебхуками и уведомлениями](recommendations/working-with-incomming-webhooks/)
*   [Отслеживание состояния инстанса](recommendations/instance-status-tracking/)
*   [Работа с редактируемыми и удаленными сообщениями](recommendations/working-with-method-edit-delete-message/)
*   [Работа с уведомлением о печати сообщений](recommendations/working-with-autotyping-message/)
*   [Работа с входящими звонками](recommendations/working-with-incomming-calls/)
*   [Как получить имя собеседника в интеграциях?](recommendations/how-to-get-contact-name/)

## Архив[#](#arch "Permanent link")

### [Аккаунт](account/)[#](#arch-account "Permanent link")

*   [Получить состояние сокета инстанса](account/GetStatusInstance/)

### [Отправка](sending/)[#](#arch-sending "Permanent link")

*   [Отправить обычные кнопки](sending/SendButtons/)
*   [Отправить шаблонные кнопки](sending/SendTemplateButtons/)
*   [Отправить список выбора](sending/SendListMessage/)

### [Получение](receiving/)[#](#arch-receiving-dif "Permanent link")

*   [Статус сокета инстанса](receiving/notifications-format/StatusInstanceChanged/)
*   [Аватар контакта](receiving/notifications-format/AvatarInfo/)
*   [Входящая блокировка](receiving/notifications-format/IncomingBlock/)
*   [Статус устройства](receiving/notifications-format/DeviceInfo/)

### [Устройство (телефон)](phone/)[#](#arch-phone "Permanent link")

*   [Получить информацию об устройстве](phone/GetDeviceInfo/)

[

Назад Коллекция Postman на сайте



](../postman-collection-site/)[

Вперед Аккаунт обзор

](account/)

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

