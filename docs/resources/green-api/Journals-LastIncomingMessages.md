# GREEN-API: Journals-LastIncomingMessages

> Source: https://green-api.com/docs/api/journals/LastIncomingMessages/
> Saved: 2026-11-12

Редактировать страницу")

# LastIncomingMessages[#](#lastincomingmessages "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/lastIncomingMessages) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/u7kjhla/get-incoming-messages-journal) [![Apidog](../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C-%D0%B6%D1%83%D1%80%D0%BD%D0%B0%D0%BB-%D0%B2%D1%85%D0%BE%D0%B4%D1%8F%D1%89%D0%B8%D1%85-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B9-12124713e0)

Метод возвращает крайние входящие сообщения инстанса. По умолчанию возвращаются последние сообщения за 24 часа.

Настройки

Чтобы получить **входящие сообщения**, включите настройку `Получать уведомления о входящих сообщениях и файлах` методом [SetSettings](../../account/SetSettings/) или через [личный кабинет](https://console.green-api.com/instanceList).

Применение настроек занимает до 5 минут.

Чтобы получить сообщения, отправленные и полученные с телефона **до подключения инстанса**, необходимо после сохранения настроек на инстансе сделать [разлогин](../../account/Logout/) и [авторизоваться](../../../before-start/#_4) повторно.

Метод возвращает последние **10000 сообщений**. Метод LastIncomingMessages возвращает только ту историю, которую системе отдает WhatsApp\*.

Появления сообщений в журнале может занимать время до 2 минут, методы журналов необходимо использовать только для получения истории переписки. Для быстрого получения сообщений необходимо использовать [систему уведомлений](../../receiving/).

## Запрос[#](#request "Permanent link")

Для получения входящих сообщений требуется выполнить запрос по адресу:

GET

`{{apiUrl}}/waInstance{{idInstance}}/lastIncomingMessages/{{apiTokenInstance}}?minutes={{minutes_count}}`

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

### Параметры URL запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`minutes`

**integer**

нет

Время в минутах, за которое требуется показать сообщения (по умолчанию равно 1440 минут)

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Массив объектов с полями:

Поле

Тип

Описание

`type`

**string**

Вид сообщения, `incoming` - входящее сообщение

`idMessage`

**string**

Идентификатор входящего сообщения

`timestamp`

**integer**

Время принятия сообщения в UNIX-формате

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

`extendedTextMessage` - сообщение со ссылкой и превью

`pollMessage` - сообщение с опросом

`pollUpdateMessage` - сообщение с обновлением опросом

`incomingBlock` - уведомление о добавлении чата в список заблокированных контактов. (Уведомление временно не работает)

`quotedMessage` - сообщение с цитированием

`groupInviteMessage` - сообщение с приглашением в группу

`buttonsMessage` - сообщение с кнопками (Метод временно не работает)

`templateMessage` - сообщение с шаблонными кнопками (Метод временно не работает)

`listMessage` - сообщение с кнопкой со списком (Метод временно не работает)

`buttonsResponseMessage` - ответ с кнопками (Метод временно не работает)

`templateButtonsReplyMessage` - ответ с фигурными кнопками (Метод временно не работает)

`listResponseMessage` - ответ со списком (Метод временно не работает)

`chatId`

**string**

[Идентификатор чата](../../chat-id/), в котором получено сообщение. По умолчанию принимает значение `10000000000@c.us`, если `typeMessage` = `incomingBlock`

`senderId`

**string**

[Идентификатор](../../chat-id/#corr) отправителя сообщения. По умолчанию принимает значение `10000000000@c.us`, если `typeMessage` = `incomingBlock`

`senderName`

**string**

Имя отправителя сообщения

`senderContactName`

**string**

Имя отправителя из списка контактов телефонной книги

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

`chatState`

**string**

Состояние чата, если `typeMessage` = `incomingBlock`

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

``[         {         "type": "incoming",         "idMessage": "BAE57784B879480F",         "timestamp": 1757583630,         "typeMessage": "interactiveButtons",         "chatId": "70000000012@c.us",         "interactiveButtons": {             "titleText": "Header text",             "contentText": "Кнопки для взаимодействия!",             "footerText": "Footer text",             "buttons": [                 {                     "type": "copy",                     "buttonId": "1",                     "buttonText": "Copy me",                     "copyCode": "Осень"                 },                 {                     "type": "call",                     "buttonId": "2",                     "buttonText": "Call me",                     "phoneNumber": "79329843267"                 },                 {                     "type": "url",                     "buttonId": "3",                     "buttonText": "GREEN-API",                     "url": "https://green-api.com"                 }             ]         },         "statusMessage": "read",         "sendByApi": true,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "BAE5854C6CED1648",         "timestamp": 1757582429,         "typeMessage": "interactiveButtonsReply",         "chatId": "70000000012@c.us",         "interactiveButtons": {             "titleText": "Header text",             "contentText": "Твой любимый цвет!",             "footerText": "Footer text",             "buttons": [                 {                     "type": "reply",                     "buttonId": "1",                     "buttonText": "Синий"                 },                 {                     "type": "reply",                     "buttonId": "2",                     "buttonText": "Зеленый"                 },                 {                     "type": "reply",                     "buttonId": "3",                     "buttonText": "Красный"                 }             ]         },         "statusMessage": "delivered",         "sendByApi": true,         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "9DB14F14A253D33F4A9CD84123456789",         "timestamp": 1706522263,         "typeMessage": "textMessage",         "chatId": "120363153000000000@g.us",         "textMessage": "Привет",         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A1EBA0F23004BD415BB",         "timestamp": 1760887709,         "typeMessage": "extendedTextMessage",         "chatId": "70000000012@c.us",         "textMessage": "Это рекламное сообщение",         "extendedTextMessage": {             "text": "Это рекламное сообщение",             "description": "📢",             "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAGVHJBKAQABAAD///Z",             "forwardingScore": 0,             "isForwarded": false,             "mediaType": "VIDEO",             "showAdAttribution": true,             "sourceId": "6571508941249",             "sourceType": "ad",             "sourceUrl": "https://www.ram.com/p/DOGOyEhBUYb/",              "thumbnailUrl": "https://scontent.xx.fbcdn.net/v/t15.5256"         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "EAAE5A5CD000000000",         "timestamp": 1706601620,         "typeMessage": "imageMessage",  //"videoMessage"/`documentMessage`/`audioMessage`/`stickerMessage`         "chatId": "120363153000000000@g.us",         "downloadUrl": "{{APIUrl}}/waInstance1234/downloadFile/EA1BD1AE042DC4F3609867126309D67C.jpg",         "caption": "Как тебе?",         "fileName": "03963bac-6020-423c-80df-1aa123456789.jpg",         "jpegThumbnail": "/9j/4AAQSkZJ/aAAgBAwEBPwCVYw//xAApEAACAx/2kOVh/VKAoAH/leFhX//+AAMA/9k=",         "mimeType": "image/jpeg",         "isAnimated": false,         "isForwarded": true,         "forwardingScore": 1,         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A1EBA0F23004BD415BB",         "timestamp": 1706601621,         "typeMessage": "reactionMessage",         "chatId": "70000000012@c.us",         "extendedTextMessageData": {             "text": "😄"         },         "quotedMessage": {             "stanzaId": "46618B98B3B9DF50F123456789123456",             "participant": "70000000012@c.us",         },         "senderId": "70000000013@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A8427EF85F000000000",         "timestamp": 1706674611,         "typeMessage": "locationMessage",         "chatId": "70000000012@c.us",         "location": {             "nameLocation": "Cafe",             "address": "Астана",             "jpegThumbnail": "/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRX",             "latitude": 51.1280000000000,             "longitude": 71.4307620000000,             "forwardingScore": 0,             "isForwarded": false         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3AA2C1D83560000000000",         "timestamp": 1706675513,         "typeMessage": "contactMessage",         "chatId": "70000000012@c.us",         "contact": {             "displayName": "Виктор Петров",             "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:;Виктор Петров;;;\nFN:Виктор Петров\nTEL;type=CELL;type=VOICE;waid=70000000013:+7 000 000-00-13\nEND:VCARD",             "forwardingScore": 0,             "isForwarded": false         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },         {         "type": "incoming",         "idMessage": "AC6BF2D7592B937284995D50B4DE6594",         "timestamp": 1766567237,         "typeMessage": "contactsArrayMessage",         "chatId": "79876543210@c.us",         "messageData": {             "contacts": [                 {                     "displayName": "Green Api",                     "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:;Green Api;;;\nFN:Green Api\nORG:Green Api\nTITLE:\nitem1.TEL:+7 999 999-99-99\nitem1.X-ABLabel:Мобильный\nEND:VCARD",                     "contextInfo": null                 },                 {                     "displayName": "GREEN-API",                     "vcard": "BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:GREEN-API\nitem1.TEL;waid=79876543210:+7 987 654-32-10\nitem1.X-ABLabel:Мобильный\nPHOTO;BASE64:/9j/4AAQSkZJRgABjFySP//Z\nEND:VCARD",                     "contextInfo": null                 }             ],             "forwardingScore": 0,             "isForwarded": false         },         "senderId": "79876543210@c.us",         "senderName": "GREEN-API",         "senderContactName": "",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A66D7F0B50000000000",         "timestamp": 1706675928,         "typeMessage": "extendedTextMessage",         "chatId": "70000000012@c.us",         "textMessage": "Hqhqhhqh\nhttps://green-api.com/",         "extendedTextMessage": {             "text": "Hqhqhhqh\nhttps://green-api.com/",             "description": "GREEN-API - интеграция с WhatsApp на любом языке программирования PHP, JavaScript, 1С, Python, Java, C#, VBA",             "title": "GREEN-API для отправки и получения сообщений Whatsapp",             "previewType": "None",             "jpegThumbnail": "/9j/4AAQSkZJRgABAQAASAB9k=",             "forwardingScore": 0,             "isForwarded": false         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A71511C3A0000000000",         "timestamp": 1706676278,         "typeMessage": "pollMessage",         "chatId": "70000000012@c.us",         "pollMessageData": {             "name": "Выберите любимый цвет",             "options": [                 {                     "optionName": "Красный"                 },                 {                     "optionName": "Зеленый"                 }             ],             "multipleAnswers": true         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A0493ED90000000000000",         "timestamp": 1706676447,         "typeMessage": "pollUpdateMessage",         "chatId": "70000000012@c.us",         "pollMessageData": {             "name": "Куда пойдем?",             "stanzaId": "46618B98B3B9DF50F123456789123456",             "votes": [                 {                     "optionName": "Пляж",                     "optionVoters": [                         "70000000012@c.us"                     ]                 },                 {                     "optionName": "Горы",                     "optionVoters": []                 }             ],             "multipleAnswers": true         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "typeMessage": "incomingBlock", //Уведомление временно не работает         "timestamp": 1706676650,         "chatId": "10000000000@c.us",         "senderId": "10000000000@c.us",         "chatState": "blocked"     },     {         "type": "incoming",         "idMessage": "3AB0EB938BA0000000000",         "timestamp": 1706677013,         "typeMessage": "quotedMessage",         "chatId": "70000000012@c.us",         "extendedTextMessage": {             "text": "За пляж",             "stanzaId": "46618B98B3B9DF50F123456789123456",             "participant": "70000000012@c.us"         },         "quotedMessage": {             "stanzaId": "46618B98B3B9DF50F123456789123456",             "participant": "70000000012@c.us",             "typeMessage": "pollMessage",             "pollMessageData": {                 "name": "Куда пойдем?",                 "options": [],                 "multipleAnswers": true             }         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3A70B27A6020000000000",         "timestamp": 1706677254,         "typeMessage": "quotedMessage",         "chatId": "70000000012@c.us",         "extendedTextMessage": {             "text": "Круто!",             "stanzaId": "EAAE5A5CD000000000",             "participant": "70000000012@c.us"         },         "quotedMessage": {             "stanzaId": "EAAE5A5CD000000000",             "participant": "70000000012@c.us",             "typeMessage": "imageMessage", //"videoMessage"/`documentMessage`/`audioMessage`/`stickerMessage`             "downloadUrl": "",             "caption": "",             "fileName": "",             "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAA=",             "mimeType": "image/jpeg",             "isAnimated": false,             "isForwarded": false,             "forwardingScore": 0         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     }     {         "type": "incoming",         "idMessage": "F7AEC1B7086ECDC7E6E45923F5EDB825",         "timestamp": 1728018697,         "typeMessage": "extendedTextMessage",         "chatId": "79001234567@c.us",         "textMessage": "https://send.me/gUdvBWgIH",         "extendedTextMessage": {             "text": "Новый инстанс для вашего бизнеса!",             "description": "",             "title": "GREEN-API",             "jpegThumbnail": "/9j/4AAQSkZJRgABAQAAAQABAAD/7QCEUGhvdG9zaG9wIDMuMAA4qIJUeuMEjYwGc9BtFMXTYvgsnm4ADy6HLLZDqn1Ye5RMev+ae1hED2B9dQIARwjvDIwYCg4/r/9k=",             "forwardingScore": 0,             "isForwarded": false,             "mediaType": "IMAGE",             "sourceUrl": "https://send.me/gUdvBWgIH",             "thumbnailUrl": "https://scontent.xx.fbcdn.net/v/t39.30808-6/436945887_122115998378256688_307643393252141869_n.jpg?stp=dst-jpg_s851x315&_nc_cat=111&ccb=1-7&_nc_sid=5f2048&_nc_ohc=x61r6W-VrJIAb69T4Dl&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&oh=00_AfDLFkjNOBYEntBu6SYaUOxDuxbvarjKha9Ez5RQUXjsfg&oe=662D7680"         },         "senderId": "79001234567@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3AC57AE5BB0784C80047",         "timestamp": 1739539809,         "typeMessage": "deletedMessage",         "chatId": "70000000012@c.us",         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "deletedMessageData": {             "stanzaId": "3ABB6C1B73334C9741F4"         },         "senderContactName": "Василиса"     },     {         "type": "incoming",         "idMessage": "3ABB6C1B73334C9741F4",         "timestamp": 1739539803,         "typeMessage": "textMessage",         "chatId": "70000000012@c.us",         "textMessage": "Привет!",         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "3AC57AE5BB0784C80047",         "editedMessageId": "",         "isEdited": false,         "isDeleted": true     },     {         "type": "incoming",         "idMessage": "3ABB6C1B73334C9741F4",         "timestamp": 1739539803,         "typeMessage": "extendedTextMessage",         "chatId": "70000000012@c.us",         "textMessage": "Привет!",             "extendedTextMessage": {             "text": "Привет!",             "description": "",             "title": "",             "previewType": "None",             "jpegThumbnail": "",             "forwardingScore": 0,             "isForwarded": false         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "830E8ADA4C4F3C9CB54506791099A3AF",         "isEdited": true,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "A5044C1535772B4D060C57C62A530AAB",         "timestamp": 1774943001,         "typeMessage": "groupInviteMessage",         "chatId": "70000000012@c.us",         "groupInviteMessageData": {             "groupJid": "120363425469355954@g.us",             "inviteCode": "B060dkNctUdXvUHC",             "inviteExpiration": "1775202192",             "groupName": "ntcn",             "caption": "Invitation to join my WhatsApp group",             "jpegThumbnail": "",         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     },     {         "type": "incoming",         "idMessage": "3AC3BB68475D6EC5BBD1",         "timestamp": 1785992892,         "typeMessage": "extendedTextMessage",         "chatId": "70000000012@c.us",         "textMessage": "Здравствуйте! Хочу сделать заказ",         "extendedTextMessage": {             "text": "Здравствуйте! Хочу сделать заказ",             "description": ":thinking_face:Думаете что выбрать сегодня?\n\Общайтесь с клиентами в лучшем мессенджере Земли \nМенеджеры по продажам уже готовы ответить вам\n:mailto: support@green-api.com",             "title": "Напишите нам",             "previewType": "None",             "jpegThumbnail": "",             "forwardingScore": 0,             "isForwarded": false,             "containsAutoReply": false,             "mediaType": "VIDEO",             "showAdAttribution": true,             "sourceId": "120252186701100169",             "sourceType": "ad",             "sourceUrl": "https://www.instagram.com/p/187 ... xWK/",             "thumbnailUrl": "https://instagram.ftse3-2.fna.fbcdn.net/ ... =6A79CE3D",             "greetingMessageBody": "Здравствуйте! Рады вам помочь!",             "ctwaClid": "Afh6oztQClFhp ... bjQ",             "automatedGreetingMessageShown": true,             "sourceApp": "instagram",             "originalImageUrl": "https://instagram.ftse3-2.fna.fbcdn.net/ ... =6A79CE3D"         },         "senderId": "70000000012@c.us",         "senderName": "Василиса Премудрая",         "senderContactName": "Василиса",         "deletedMessageId": "",         "editedMessageId": "",         "isEdited": false,         "isDeleted": false     } ]``

### Ошибки LastIncomingMessages[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

## Примеры кода[#](#request-example "Permanent link")

PythoncURLJava - SpringJava - UnirestVBA

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/lastIncomingMessages/{{apiTokenInstance}}?minutes=3240"  payload = {} headers= {}  response = requests.request("GET", url, headers=headers, data = payload)  print(response.text.encode('utf8'))`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/lastIncomingMessages/{{apiTokenInstance}}?minutes=3240'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/lastIncomingMessages/")     .append({{apiTokenInstance}});  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.GET, null, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/lastIncomingMessages/")     .append({{apiTokenInstance}});  var response = Unirest.get(requestUrl.toString())     .header("Content-Type", "application/json")     .asString();  System.out.println(response);`

`Sub LastIncomingMessages()     Dim url As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/lastIncomingMessages/{{apiTokenInstance}}"      Set http = CreateObject("MSXML2.XMLHTTP")      http.Open "GET", url, False     http.send      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     Range("A1").Value = response      Set http = Nothing End Sub`

Внимание

*   Организация Meta, а также её продукты Instagram и Facebook, на которые мы ссылаемся в этой статье, признаны экстремистскими на территории РФ.

[

Назад Получить сообщение чата



](../GetMessage/)[

Вперед Получить журнал отправленных сообщений

](../LastOutgoingMessages/)

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

