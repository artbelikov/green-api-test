# GREEN-API: Journals-GetChatHistory

> Source: https://green-api.com/docs/api/journals/GetChatHistory/
> Saved: 2026-11-12

Редактировать страницу")

# GetChatHistory[#](#getchathistory "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/getChatHistory) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/tql60ho/get-chat-history) [![Apidog](../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C-%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%8E-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B9-%D1%87%D0%B0%D1%82%D0%B0-12124711e0)

Метод возвращает историю сообщений чата.

Настройки

Чтобы получить **входящие сообщения**, включите настройку `Получать уведомления о входящих сообщениях и файлах` методом [SetSettings](../../account/SetSettings/) или через [личный кабинет](https://console.green-api.com/instanceList).

Чтобы получить **сообщения, отправленные с телефона** включите настройку `Получать уведомления о сообщениях, отправленных с телефона методом` [SetSettings](../../account/SetSettings/) или через [личный кабинет](https://console.green-api.com/instanceList).

Чтобы получить **статусы отправленных сообщений**, включите настройку `Получать уведомления о статусах отправленных сообщений` методом [SetSettings](../../account/SetSettings/) или через [личный кабинет](https://console.green-api.com/instanceList).

Применение настроек занимает до 5 минут.

Чтобы получить сообщения, отправленные и полученные с телефона **до подключения инстанса**, необходимо после сохранения настроек на инстансе сделать [разлогин](../../account/Logout/) и [авторизоваться](../../../before-start/#_4) повторно.

Метод GetChatHistory возвращает только те сообщения, которые системе отдает WhatsApp\*.

Появление сообщений в журнале может занимать время до 2 минут, методы журналов необходимо использовать только для получения истории переписки. Для быстрого получения сообщений необходимо использовать [систему уведомлений](../../receiving/).

## Запрос[#](#request "Permanent link")

Для получения истории сообщений требуется выполнить запрос по адресу:

POST

`{{apiUrl}}/waInstance{{idInstance}}/getChatHistory/{{apiTokenInstance}}`

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

### Параметры запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`chatId`

**string**

Да

[Идентификатор личного или группового чата](../../chat-id/) историю сообщений которого требуется получить

`count`

**integer**

Нет

Количество сообщений для получения. Значение по умолчанию `100`

### Пример тела запроса[#](#request-example-body "Permanent link")

Запрос последних 10 сообщений:

`{     "chatId": "79876543210@c.us",     "count": 10 }`

## Ответ[#](#response "Permanent link")

Ответ содержит список всех полученных и отправленных сообщений в чате. Сортировка по убыванию даты отправки сообщения.

### Поля ответа[#](#response-parameters "Permanent link")

Массив объектов с полями:

Поле

Тип

Описание

`type`

**string**

Вид сообщения: `outgoing` - исходящее сообщение; `incoming` - входящее сообщение

`idMessage`

**string**

Идентификатор входящего сообщения

`timestamp`

**integer**

Время принятия сообщения в UNIX-формате

`statusMessage`

**string**

Статус исходящего сообщения. Присутствует только для `type` = `outgoing`. Возможные значения:

`pending` - сообщение отправляется

`sent` - сообщение отправлено

`delivered` - сообщение доставлено

`read` - сообщение прочитано/просмотрено/прослушано

`yellowCard` - Статус устарел.Заменён на статус suspended

`failed` - произошла ошибка при отправке сообщения на сервер WhatsApp\*

`suspended` - На инстансе действуют временные ограничения. Подробнее читайте в статье [Что означает статус suspended у аккаунта WhatsApp?](../../../faq/what-is-meaning-status-suspended/)

`description`

**string**

Описание ошибки. Присутствует только при `statusMessage` = `failed`

`sendByApi`

**boolean**

Флаг указывает отправлено сообщение из API или нет. Присутствует только для `type` = `outgoing`

`typeMessage`

**string**

Тип сообщения, возможные значения:

`textMessage` - текстовое сообщение

`imageMessage` - сообщение с изображением

`videoMessage` - видео сообщение

`documentMessage` - сообщение с файлом документа

`audioMessage` - аудио сообщение

`stickerMessage` - сообщение со стикером

`reactionMessage` - сообщение с реакцией

`locationMessage` - сообщение геолокации

`contactMessage` - сообщение с контактом

`contactsArrayMessage` - сообщение с массивом контактов

`extendedTextMessage` - сообщение со ссылкой и превью / рекламное сообщение

`pollMessage` - сообщение с опросом

`pollUpdateMessage` - сообщение с обновлением опросом. Присутствует только для `type` = `incoming`

`quotedMessage` - сообщение с цитированием

`groupInviteMessage` - сообщение с приглашением в группу

`chatId`

**string**

[Идентификатор чата](../../chat-id/), в котором получено сообщение.

`senderId`

**string**

[Идентификатор](../../chat-id/#corr) отправителя сообщения. Присутствует только для `type` = `incoming`

`senderName`

**string**

Имя отправителя сообщения. Присутствует только для `type` = `incoming`

`senderContactName`

**string**

Имя отправителя из списка контактов телефонной книги. Присутствует только для `type` = `incoming`

`isForwarded`

**boolean**

Флаг указывает является ли сообщение пересланным

`forwardingScore`

**integer**

Количество пересылок сообщения

`textMessage`

**string**

Текст сообщения, если `typeMessage`\=`textMessage`/`extendedTextMessage`

`downloadUrl`

**string**

Ссылка на скачивание файла, если `typeMessage` = `imageMessage` /`videoMessage`/`documentMessage`/`audioMessage`/`stickerMessage`

`caption`

**string**

Описание файла, если `typeMessage` = `imageMessage`/`videoMessage` /`documentMessage`/`audioMessage`/`stickerMessage`

`fileName`

**string**

Название файла, если `typeMessage` = `imageMessage`/`videoMessage` /`documentMessage`/`audioMessage`/`stickerMessage`. Поле заполняется корректно только для `typeMessage` = `documentMessage`, в остальных случаях название файла генерируется автоматически

`jpegThumbnail`

**string**

Превью изображения в `base64` кодировке, если `typeMessage` = `imageMessage`/`videoMessage`/`documentMessage`/`audioMessage`/`stickerMessage`

`mimeType`

**string**

Тип файла, согласно классификации [Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml), если `typeMessage` = `imageMessage`/`videoMessage`/`documentMessage`/`audioMessage`/`stickerMessage`

`isAnimated`

**boolean**

Флаг указывает анимирован ли файл, если `typeMessage` = `imageMessage`/`videoMessage`/`documentMessage`/`audioMessage`/`stickerMessage`

`location`

**object**

Объект о структуре локации, если `typeMessage` = `locationMessage`

`contact`

**object**

Объект о структуре контакта, если `typeMessage` = `contactMessage`

`extendedTextMessage`

**object**

Объект с текстовым сообщением (расширенный), если `typeMessage` = `extendedTextMessage`/`quotedMessage`

`extendedTextMessageData`

**object**

Объект с реакцией, если `typeMessage` = `reactionMessage`

`pollMessageData`

**object**

Объект о структуре данных опроса, если `typeMessage` = `pollMessage`/`pollUpdateMessage`

`quotedMessage`

**object**

Объект данных о цитируемом сообщении, если `typeMessage` = `quotedMessage`/`reactionMessage`

`groupInviteMessageData`

**object**

Объект о структуре приглашения в группу, если `typeMessage` = `groupInviteMessage`

`deletedMessageId`

**string**

Идентификатор сообщения которое удалили. Присутствует если сообщение было удалено

`editedMessageId`

**string**

Идентификатор сообщения которое отредактировали. Присутствует если сообщение было отредактировано

`isEdited`

**boolean**

Флаг указывает редактировали ли сообщение

`isDeleted`

**boolean**

Флаг указывает удалили ли сообщение

Поля объекта `location`:

Поле

Тип

Описание

`nameLocation`

**string**

Название локации

`address`

**string**

Адрес локации

`latitude`

**double**

Широта локации

`longitude`

**double**

Долгота локации

`jpegThumbnail`

**string**

Превью изображения в `base64` кодировке

`isForwarded`

**boolean**

Флаг указывает является ли сообщение пересланным

`forwardingScore`

**integer**

Количество пересылок сообщения

Поля объекта `contact`:

Поле

Тип

Описание

`displayName`

**string**

Отображаемое имя контакта

`vcard`

**string**

Структура VCard (визитной карточки контакта)

`isForwarded`

**boolean**

Флаг указывает является ли сообщение пересланным

`forwardingScore`

**integer**

Количество пересылок сообщения

Поля объекта `contacts`:

Поле

Тип

Описание

`displayName`

**string**

Отображаемое имя контакта

`vcard`

**string**

Структура VCard (визитной карточки контакта)

`contextInfo`

**boolean**

Поле не используется

Поля объекта `extendedTextMessage`:

Поле

Тип

Описание

`text`

**string**

Текст ссылки

`description`

**string**

Описание ссылки

`title`

**string**

Заголовок ссылки

`previewType`

**string**

Тип превью ссылки. Значение `previewType`:`None` устарело

`jpegThumbnail`

**string**

Превью изображения в `base64` кодировке

`stanzaId`

**string**

ID цитируемого сообщения. Присутствует только для `typeMessage` = `quotedMessage`

`participant`

**string**

ID чата получателя/отправителя. Присутствует только для `typeMessage` = `quotedMessage`

`isForwarded`

**boolean**

Флаг указывает является ли сообщение пересланным

`forwardingScore`

**integer**

Количество пересылок сообщения

`showAdAttribution`

**boolean**

Индикатор рекламного сообщения

`mediaType`

**string**

Тип медиа сообщения, например "IMAGE" (только для рекламных сообщений)

`sourceId`

**string**

Id рекламы (только для рекламных сообщений)

`sourceType`

**string**

Тип источника, например "ad" (только для рекламных сообщений)

`sourceUrl`

**string**

Ссылка на рекламу (только для рекламных сообщений)

`thumbnailUrl`

**string**

URL превью рекламного контента (только для рекламных сообщений)

`greetingMessageBody`

**string**

Текст приветственного сообщения, которое было автоматически отправлено пользователю. (только для рекламных сообщений)

`ctwaClid`

**string**

Идентификатор перехода по рекламе Click to WhatsApp. Используется для связи диалога с рекламной кампанией (только для рекламных сообщений)

`automatedGreetingMessageShown`

**boolean**

Признак того, что пользователю было показано автоматическое приветственное сообщение (только для рекламных сообщений)

`sourceApp`

**string**

Приложение, из которого было инициировано взаимодействие с WhatsApp: например, Facebook, Instagram или другое приложение Meta. (только для рекламных сообщений)

`originalImageUrl`

**string**

Исходная ссылка на изображение, связанное с рекламным объявлением. (только для рекламных сообщений)

`videoNote`

**boolean**

Поле для видео сообщений. Принимает значение `true` - для мгновенного видео сообщения и `false` для обычного видео сообщения

Поля объекта `extendedTextMessageData`:

Поле

Тип

Описание

`text`

**string**

Реакция (эмоджи) на сообщение

Поля объекта `pollMessageData`:

Поле

Тип

Описание

`stanzaId`

**string**

id сообщения с исходящим опросом. Присутствует только для `typeMessage`\=`pollUpdateMessage`

`name`

**string**

Текст опроса

`options`

**array**

Массив данных о вариантах выбора. Присутствует только для `typeMessage`\=`pollMessage`

`votes`

**array**

Массив данных ответов. Присутствует только для `typeMessage`\=`pollUpdateMessage`

`multipleAnswers`

**boolean**

Флаг о разрешении нескольких ответов

Поля массива `options`

Параметр

Тип

Описание

`optionName`

**string**

Текст варианта выбора

Поля массива `votes`:

Параметр

Тип

Описание

`optionName`

**string**

Текст варианта выбора

`optionVoters`

**array**

Массив идентификаторов проголосовавших аккаунтов

Поля объекта `quotedMessage`:

Поле

Тип

Описание

`stanzaId`

**string**

ID цитируемого сообщения

`participant`

**string**

ID чата получателя

> Остальные поля объекта `quotedMessage` заполняются в зависимости от типа цитируемого сообщения и идентичны полям описанных выше

Поля объекта `groupInviteMessageData`:

Поле

Тип

Описание

`groupJid`

**string**

id группы

`inviteCode`

**string**

Код приглашения в группу

`inviteExpiration`

**string**

Дата, до которой валидно приглашение в группу

`groupName`

**string**

Имя группы

`caption`

**string**

Описание изображения

`name`

**string**

Поле устарело, оставлено для обратной совместимости

`jpegThumbnail`

**string**

Превью изображения в `base64` кодировке

### Пример тела ответа[#](#response-example-body "Permanent link")

``[     {         "type": "outgoing",         "idMessage": "BAE57784B879480F",         "timestamp": 1757583630,         "typeMessage": "interactiveButtons",         "chatId": "120363153000000000@g.us",         "interactiveButtons": {             "titleText": "Header text",             "contentText": "Кнопки для взаимодействия!",             "footerText": "Footer text",             "buttons": [                 {                     "type": "copy",                     "buttonId": "1",                     "buttonText": "Copy me",                     "copyCode": "Осень"                 },                 {                     "type": "call",                     "buttonId": "2",                     "buttonText": "Call me",                     "phoneNumber": "79329843267"                 },                 {                     "type": "url",                     "buttonId": "3",                     "buttonText": "GREEN-API",                     "url": "https://green-api.com"                 }             ]         },         "statusMessage": "read",         "sendByApi": true,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "BAE5854C6CED1648",         "timestamp": 1757582429,         "typeMessage": "interactiveButtonsReply",          "chatId": "120363153000000000@g.us",         "interactiveButtons": {             "titleText": "Header text",             "contentText": "Твой любимый цвет!",             "footerText": "Footer text",             "buttons": [                 {                     "type": "reply",                     "buttonId": "1",                     "buttonText": "Синий"                 },                 {                     "type": "reply",                     "buttonId": "2",                     "buttonText": "Зеленый"                 },                 {                     "type": "reply",                     "buttonId": "3",                     "buttonText": "Красный"                 }             ]         },         "statusMessage": "delivered",         "sendByApi": true,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },       {         "type": "incoming",         "idMessage": "9DB14F14A253D33F4A9CD84123456789",         "timestamp": 1706522263,         "typeMessage": "textMessage",         "chatId": "120363153000000000@g.us",         "textMessage": "Привет",         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "BAE5143000000000",         "timestamp": 1706761225,         "typeMessage": "textMessage",         "chatId": "70000000012@c.us",         "textMessage": "Привет",         "statusMessage": "read",         "sendByApi": true,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "EAAE5A5CD000000000",         "timestamp": 1706601620,         "typeMessage": "imageMessage",  //"videoMessage"/`documentMessage`/`audioMessage`/`stickerMessage`         "chatId": "120363153000000000@g.us",         "downloadUrl": "https://api.green-api.com/waInstance1234/downloadFile/EA1BD1AE042DC4F3609867126309D67C.jpg",         "caption": "Как тебе?",         "fileName": "03963bac-6020-423c-80df-1aa123456789.jpg",         "jpegThumbnail": "/9j/4AAQSkZJ/aAAgBAwEBPwCVYw//xAApEAACAx/2kOVh/VKAoAH/leFhX//+AAMA/9k=",         "mimeType": "image/jpeg",         "isAnimated": false,         "isForwarded": true,         "forwardingScore": 1,         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A1EBA0F23004BD415BB",         "timestamp": 1760887709,         "typeMessage": "extendedTextMessage",         "chatId": "70000000012@c.us",         "textMessage": "Это рекламное сообщение",         "extendedTextMessage": {             "text": "Это рекламное сообщение",             "description": "📢",             "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAGVHJBKAQABAAD///Z",             "forwardingScore": 0,             "isForwarded": false,             "mediaType": "VIDEO",             "showAdAttribution": true,             "sourceId": "6571508941249",             "sourceType": "ad",             "sourceUrl": "https://www.ram.com/p/DOGOyEhBUYb/",              "thumbnailUrl": "https://scontent.xx.fbcdn.net/v/t15.5256"         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "3A1EBA0F23004BD415BB",         "timestamp": 1706601621,         "typeMessage": "reactionMessage",         "chatId": "70000000012@c.us",         "extendedTextMessageData": {             "text": "😄"         },         "quotedMessage": {             "stanzaId": "46618B98B3B9DF50F123456789123456",             "participant": "70000000012@c.us",         },         "statusMessage": "read",         "sendByApi": false,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "BAE58798765432100",         "timestamp": 1706761414,         "typeMessage": "locationMessage",         "chatId": "70000000012@c.us",         "location": {             "nameLocation": "Cafe",             "address": "Астана",             "jpegThumbnail": "/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRX",             "latitude": 51.1280000000000,             "longitude": 71.4307620000000,             "forwardingScore": 0,             "isForwarded": false         },         "statusMessage": "read",         "sendByApi": true,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3AA2C1D83560000000000",         "timestamp": 1706675513,         "typeMessage": "contactMessage",         "chatId": "70000000012@c.us",         "contact": {             "displayName": "Виктор Петров",             "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:;Виктор Петров;;;\nFN:Виктор Петров\nTEL;type=CELL;type=VOICE;waid=70000000013:+7 000 000-00-13\nEND:VCARD",             "forwardingScore": 0,             "isForwarded": false         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A66D7F0B50000000000",         "timestamp": 1706675928,         "typeMessage": "extendedTextMessage",         "chatId": "70000000012@c.us",         "textMessage": "Hqhqhhqh\nhttps://green-api.com/",         "extendedTextMessage": {             "text": "Hqhqhhqh\nhttps://green-api.com/",             "description": "GREEN-API - интеграция с WhatsApp на любом языке программирования PHP, JavaScript, 1С, Python, Java, C#, VBA",             "title": "GREEN-API для отправки и получения сообщений Whatsapp",             "previewType": "None",             "jpegThumbnail": "/9j/4AAQSkZJRgABAQAASAB9k=",             "forwardingScore": 0,             "isForwarded": false         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "460D84E00000000000",         "timestamp": 1706762412,         "typeMessage": "pollMessage",         "chatId": "70000000012@c.us",         "pollMessageData": {             "name": "Выберите любимый цвет",             "options": [                 {                     "optionName": "Красный"                 },                 {                     "optionName": "Зеленый"                 }             ],             "multipleAnswers": true         },         "statusMessage": "delivered",         "sendByApi": true,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A0493ED90000000000000",         "timestamp": 1706676447,         "typeMessage": "pollUpdateMessage",         "chatId": "70000000012@c.us",         "pollMessageData": {             "name": "Выберите любимый цвет",             "stanzaId": "460D84E00000000000",             "votes": [                 {                     "optionName": "Красный",                     "optionVoters": [                         "70000000012@c.us"                     ]                 },                 {                     "optionName": "Зеленый",                     "optionVoters": []                 }             ],             "multipleAnswers": true         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "B1494991277FD000000000000000000000",         "timestamp": 1706849516,         "typeMessage": "quotedMessage",         "chatId": "70000000012@c.us",         "extendedTextMessage": {             "text": "Черный",             "stanzaId": "460D84E00000000000",             "participant": "70000000012@c.us"         },         "quotedMessage": {             "stanzaId": "460D84E00000000000",             "participant": "70000000012@c.us",             "typeMessage": "pollMessage",             "pollMessageData": {                 "name": "Выберите любимый цвет",                 "options": [],                 "multipleAnswers": true             }         },         "statusMessage": "delivered",         "sendByApi": false,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "21D6C50B400DBCEC30000000000000",         "timestamp": 1706852882,         "typeMessage": "quotedMessage",         "chatId": "70000000012@c.us",         "extendedTextMessage": {             "text": "Круто",             "stanzaId": "46618B98B3B9DF50F123456789123456",             "participant": "70000000012@c.us"         },         "quotedMessage": {             "stanzaId": "46618B98B3B9DF50F123456789123456",             "participant": "70000000012@c.us",             "typeMessage": "imageMessage", //"videoMessage"/`documentMessage`/`audioMessage`/`stickerMessage`             "downloadUrl": "",             "caption": "",             "fileName": "",             "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAgq7O/wD/2Q==",             "mimeType": "image/jpeg",             "isAnimated": false,             "isForwarded": false,             "forwardingScore": 0         },         "statusMessage": "read",         "sendByApi": true,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3AC57AE5BB0784C80047",         "timestamp": 1739539809,         "typeMessage": "deletedMessage",         "chatId": "70000000012@c.us",         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "deletedMessageData": {             "stanzaId": "3ABB6C1B73334C9741F4"         },         "senderContactName": "Василиса"     },     {         "type": "incoming",         "idMessage": "3ABB6C1B73334C9741F4",         "timestamp": 1739539803,         "typeMessage": "textMessage",         "chatId": "70000000012@c.us",         "textMessage": "Привет!",         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "3AC57AE5BB0784C80047",         "editedMessageId": "",         "isEdited": false,         "isDeleted": true     },     {         "type": "outgoing",         "idMessage": "E4E0E381ACE74B5845437A8F0E365D75",         "timestamp": 1739538875,         "typeMessage": "textMessage",         "chatId": "70000000012@c.us",         "textMessage": "Привет!",         "statusMessage": "read",         "sendByApi": false,         "deletedMessageId": "7863F3285595F3A296FEF8C6C386871F",         "editedMessageId": "",         "isEdited": false,         "isDeleted": true     },     {         "type": "incoming",         "idMessage": "3ABB6C1B73334C9741F4",         "timestamp": 1739539803,         "typeMessage": "extendedTextMessage",         "chatId": "70000000012@c.us",         "textMessage": "Привет!",             "extendedTextMessage": {             "text": "Привет!",             "description": "",             "title": "",             "previewType": "None",             "jpegThumbnail": "",             "forwardingScore": 0,             "isForwarded": false         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "3AC57AE5BB0784C80047",         "isEdited": true,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "BAE5143000000000",         "timestamp": 1706761225,         "typeMessage": "extendedTextMessage",         "chatId": "70000000012@c.us",         "textMessage": "Привет",             "extendedTextMessage": {             "text": "Привет",             "description": "",             "title": "",             "previewType": "None",             "jpegThumbnail": "",             "forwardingScore": 0,             "isForwarded": false         },         "statusMessage": "read",         "sendByApi": true,         "deletedMessageId": "",         "editedMessageId": "3AC57AE5BB0784C80047",         "isEdited": true,         "isDeleted": false     },      {         "type": "outgoing",         "idMessage": "3EB0F7F9962913D8AF3B",         "timestamp": 1766567116,         "typeMessage": "contactsArrayMessage",         "chatId": "79876543210@c.us",         "messageData": {             "contacts": [                 {                     "displayName": "Green Api",                     "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:;Green Api;;;\nFN:Green Api\nORG:Green Api\nTITLE:\nitem1.TEL:+7 999 999-99-99\nitem1.X-ABLabel:Мобильный\nEND:VCARD",                     "contextInfo": null                 },                 {                     "displayName": "GREEN-API",                     "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:GREEN-API\nitem1.TEL;waid=79876543210:+7 987 654-32-10\nitem1.X-ABLabel:Мобильный\nPHOTO;BASE64:/9j/4AAQSkZJRgABjFySP//Z\nEND:VCARD",                     "contextInfo": null                 }             ],             "forwardingScore": 0,             "isForwarded": false         },         "statusMessage": "delivered",         "sendByApi": false,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },      {         "type": "incoming",         "idMessage": "AC6BF2D7592B937284995D50B4DE6594",         "timestamp": 1766567237,         "typeMessage": "contactsArrayMessage",         "chatId": "79876543210@c.us",         "messageData": {             "contacts": [                 {                     "displayName": "Green Api",                     "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:;Green Api;;;\nFN:Green Api\nORG:Green Api\nTITLE:\nitem1.TEL:+7 999 999-99-99\nitem1.X-ABLabel:Мобильный\nEND:VCARD",                     "contextInfo": null                 },                 {                     "displayName": "GREEN-API",                     "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:GREEN-API\nitem1.TEL;waid=79876543210:+7 987 654-32-10\nitem1.X-ABLabel:Мобильный\nPHOTO;BASE64:/9j/4AAQSkZJRgABjFySP//Z\nEND:VCARD",                     "contextInfo": null                 }             ],             "forwardingScore": 0,             "isForwarded": false         },         "senderId": "79876543210@c.us",         "senderName": "GREEN-API",         "senderContactName": "",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "A5044C1535772B4D060C57C62A530AAB",         "timestamp": 1774942997,         "typeMessage": "groupInviteMessage",         "chatId": "70000000012@c.us",         "groupInviteMessageData": {             "groupJid": "120363425469355954@g.us",             "inviteCode": "B060dkNctUdXvUHC",             "inviteExpiration": "1775202192",             "groupName": "ntcn",             "caption": "Invitation to join my WhatsApp group",             "jpegThumbnail": "",         },         "statusMessage": "read",         "sendByApi": false,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "A5044C1535772B4D060C57C62A530AAB",         "timestamp": 1774943001,         "typeMessage": "groupInviteMessage",         "chatId": "70000000012@c.us",         "groupInviteMessageData": {             "groupJid": "120363425469355954@g.us",             "inviteCode": "B060dkNctUdXvUHC",             "inviteExpiration": "1775202192",             "groupName": "ntcn",             "caption": "Invitation to join my WhatsApp group",             "jpegThumbnail": "",         },         "senderId": "70000000012@c.us",         "senderName": "тест номер",         "senderContactName": "тест номер",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "outgoing",         "idMessage": "3AC3BB68475D6EC5BBD1",         "timestamp": 1785992892,         "typeMessage": "extendedTextMessage",         "chatId": "70000000012@c.us",         "textMessage": "Здравствуйте! Хочу сделать заказ",         "extendedTextMessage": {             "text": "Здравствуйте! Хочу сделать заказ",             "description": ":thinking_face:Думаете что выбрать сегодня?\n\Общайтесь с клиентами в лучшем мессенджере Земли \nМенеджеры по продажам уже готовы ответить вам\n:mailto: support@green-api.com",             "title": "Напишите нам",             "previewType": "None",             "jpegThumbnail": "",             "forwardingScore": 0,             "isForwarded": false,             "containsAutoReply": false,             "mediaType": "VIDEO",             "showAdAttribution": true,             "sourceId": "120252186701100169",             "sourceType": "ad",             "sourceUrl": "https://www.instagram.com/p/187 ... xWK/",             "thumbnailUrl": "https://instagram.ftse3-2.fna.fbcdn.net/ ... =6A79CE3D",             "greetingMessageBody": "Здравствуйте! Рады вам помочь!",             "ctwaClid": "Afh6oztQClFhp ... bjQ",             "automatedGreetingMessageShown": true,             "sourceApp": "instagram",             "originalImageUrl": "https://instagram.ftse3-2.fna.fbcdn.net/ ... =6A79CE3D"         },         "statusMessage": "sent",         "sendByApi": false,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     } ]``

### Ошибки GetChatHistory[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

Код HTTP

Идентификатор ошибки

Описание

400

`Bad Request`  
`Validation failed`

[Ошибка валидации](../../common-errors/#400-validation-failed)

400

`Bad Request`  
`Validation failed.`  
`Details: 'count' must be a number`

Некорректный тип данных для поля `count`  
  
либо значение поля превышает максимальное безопасное целочисленное значение

## Примеры кода[#](#request-example "Permanent link")

PythoncURLJava - SpringJava - UnirestVBA

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/getChatHistory/{{apiTokenInstance}}"  payload = "{\r\n\t\"chatId\": \"79876543210@c.us\",\r\n\t\"count\": 100\r\n}" headers = {   'Content-Type': 'application/json' }  response = requests.post(url, json=payload)  print(response.text.encode('utf8'))`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/getChatHistory/{{apiTokenInstance}}' \ --header 'Content-Type: application/json' \ --data-raw '{     "chatId": "79876543210@c.us",     "count": 10 }'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getChatHistory/")     .append({{apiTokenInstance}});  var headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);  var jsonBody = "{\"chatId\": \"79876543210@c.us\",\"count\": 10}";  var requestEntity = new HttpEntity<>(jsonBody, headers);  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.POST, requestEntity, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getChatHistory/")     .append({{apiTokenInstance}});  var response = Unirest.post(requestUrl.toString())     .header("Content-Type", "application/json")     .body("{\"chatId\": \"79876543210@c.us\",\"count\": 10}")     .asString();  System.out.println(response);`

`Sub GetChatHistory()     Dim url As String     Dim RequestBody As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/getChatHistory/{{apiTokenInstance}}"      ' chatId - personal or group chat identifier whose message history you want to receive, count - number of messages to receive, default value 100     RequestBody = "{""chatId"":""71234567890@c.us"",""count"":10}"      Set http = CreateObject("MSXML2.XMLHTTP")      With http         .Open "POST", url, False         .setRequestHeader "Content-Type", "application/json"         .send RequestBody     End With      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     Range("A1").Value = response      Set http = Nothing End Sub`

Внимание

*   Организация Meta, а также её продукты Instagram и Facebook, на которые мы ссылаемся в этой статье, признаны экстремистскими на территории РФ.

[

Назад Журналы обзор



](../)[

Вперед Получить сообщение чата

](../GetMessage/)

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

