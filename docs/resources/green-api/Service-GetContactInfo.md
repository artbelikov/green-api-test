# GREEN-API: Service-GetContactInfo

> Source: https://green-api.com/docs/api/service/GetContactInfo/
> Saved: 2026-11-12

Редактировать страницу")

# GetContactInfo[#](#getcontactinfo "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/getContactInfo) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/7ru9821/get-contact-info) [![Apidog](../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C-%D0%B8%D0%BD%D1%84%D0%BE-%D0%BA%D0%BE%D0%BD%D1%82%D0%B0%D0%BA%D1%82%D0%B0-12124739e0)

Метод предназначен для получения информации о контакте.

## Запрос[#](#request "Permanent link")

Для получения информации о контакте требуется выполнить запрос по адресу:

POST

`{{apiUrl}}/waInstance{{idInstance}}/getContactInfo/{{apiTokenInstance}}`

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

### Параметры запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`chatId`

**string**

Да

[Идентификатор корреспондента](../../chat-id/)

### Пример тела запроса[#](#request-example-body "Permanent link")

`{     "chatId": "71234567890@c.us" }`

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`avatar`

**string**

ссылка на аватар

`base64Avatar`

**string**

Аватар в формате base64

`name`

**string**

Имя контакта. Возможные значения:

1) Если есть входящая переписка/реакции от аккаунта, то получаем имя из профиля WhatsApp\*;

2) Если нет входящей переписки/реакций от аккаунта, то получаем пустую строку.

`contactName`

**string**

Имя контакта из телефонной книги. Возможные значения:

1) Если номер сохранён в контактах, то получаем имя из контактной книги;

2) Если номер не добавлен или удалён из контактной книги, то получаем пустую строку.

`email`

**string**

Электронная почта контакта

`category`

**string**

Категория бизнес контакта

`description`

**string**

Описание бизнес контакта

`products`

**object**

Карточки товаров контакта

`chatId`

**string**

[Идентификатор корреспондента](../../chat-id/)

`lastSeen`

**string**

Время последнего статуса онлайн

`isArchive`

**boolean**

Статус архивации чата, принимает значения `true`/`false`

`isDisappearing`

**boolean**

Статус исчезающих сообщений чата, принимает значения `true`/`false`

`isMute`

**boolean**

Статус уведомлений чата, принимает значения `true`/`false`

`messageExpiration`

**integer**

Время жизни сообщений в чате, в секундах

`muteExpiration`

**integer**

Время, через сколько будут включены уведомления в чате

`isBusiness`

**boolean**

Флаг, который указывает использует ли контакт WhatsApp\* Business, принимает значения `true`/`false`

Поля объекта `products`

Параметр

Тип

Описание

`id`

**string**

id товара

`imageUrls`

**object**

Ссылки на изображения товара

`availability`

**string**

Доступность товара

`reviewStatus`

**object**

Статус валидации товара

`name`

**string**

Название товара

`description`

**string**

Описание товара

`price`

**string**

Цена товара

`isHidden`

**boolean**

Состояние товара

Поля объекта `imageUrls`

Параметр

Тип

Описание

`requested`

**string**

Ссылка на изображение товара с маленьким разрешением (превью)

`original`

**string**

Ссылка на изображение товара с большим разрешением (оригинал)

Поля объекта `reviewStatus`

Параметр

Тип

Описание

`whatsapp`

**string**

Товар одобрен WhatsApp-ом\*

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "avatar": "https://pps.whatsapp.net/v/t61.24694-24/24_1349471992200940_2091838963901201896_n.jpg?ccb=11-4&oh=01_AVzZilQn10nj9M9cfQV4PW5dgdXOkiOuD_jCqP2MCXIpyA",     "base64Avatar": "/9j/4AAQSkZJRgABAQAAAQABAAD/7QC...12Ff/Z",     "name": "Dealer",     "contactName": "Dealer",     "email": "24service@tt.tt",     "category": "Automotive Dealership",     "description": "Официальный сервис",     "products": [         {             "id": "42079728159",             "imageUrls": {                 "requested": "https://mmg.whatsapp.net/v/t45.5328-4/263329037_6625110154227932_2879714823340281709_n.jpg?stp=dst-jpg_p100x100&ccb=1-7&_nc_sid=c48759&_nc_ohc=NKICbZlqfPMAX9077mo&_nc_ad=z-m&_nc_cid=0&_nc_ht=mmg.whatsapp.net&oh=01_AVwYzx7CckCFf8F8xIIZ5m2AGdeC8YTnLyd29",                 "original": "https://mmg.whatsapp.net/v/t45.5328-4/263329037_6625110154227932_2879714823340281709_n.jpg?ccb=1-7&_nc_sid=c48759&_nc_ohc=NKICbZlqfPMAX9077mo&_nc_ad=z-m&_nc_cid=0&_nc_ht=mmg.whatsapp.net&oh=01_AVzn_O9azpKNRs1iPId0TQkGYk4D7HZFSQMeobvRiR"             },             "reviewStatus": {                 "whatsapp": "APPROVED"             },             "availability": "in stock",             "name": "Замена",             "description": "От 1000 р.",             "price": null,             "isHidden": false         },         {             "id": "3545870328871389",             "imageUrls": {                 "requested": "https://mmg.whatsapp.net/v/t45.5328-4/261250418_4513761695371199_1710541959703469822_n.jpg?stp=dst-jpg_p100x100&ccb=1-7&_nc_sid=c48759&_nc_ohc=eps8lAw2_3MAX_mWW8K&_nc_ad=z-m&_nc_cid=0&_nc_ht=mmg.whatsapp.net&oh=01_AVxT3HnbR04qKZJSOeK4d8p-noZokqly9QbpYFK-c_8kSA&oe",                 "original": "https://mmg.whatsapp.net/v/t45.5328-4/261250418_4513761695371199_1710541959703469822_n.jpg?ccb=1-7&_nc_sid=c48759&_nc_ohc=eps8lAw2_3MAX_mWW8K&_nc_ad=z-m&_nc_cid=0&_nc_ht=mmg.whatsapp.net&oh=01_AVx2wTCmzof0BoZDmIUpD328CtpJmlvEXGdVzew&o"             },             "reviewStatus": {                 "whatsapp": "APPROVED"             },             "availability": "in stock",             "name": "Техническое обслуживание",             "price": null,             "isHidden": false         }     ],     "chatId": "71234567890@c.us",     "lastSeen": null,     "isArchive": false,     "isDisappearing": false,     "isMute": false,     "messageExpiration": 0,     "muteExpiration": null,     "isBusiness": true }`

### Ошибки GetContactInfo[#](#errors "Permanent link")

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
`Details: The method GetContactInfo does not support group chats, to work with groups, use the GetGroupData method`

Пустое тело запроса  
  
либо неверное `chatId`  
  
либо метод был использован с `groupId`

500

`Internal Server Error`  
`interface conversion: interface {} is bool, not string`

Неверно указан тип данных поля `chatId`

## Примеры кода[#](#request-example "Permanent link")

PythoncURLJava - SpringJava - UnirestVBA

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/getContactInfo/{{apiTokenInstance}}"  payload = {     "chatId": "71234567890@c.us" }  response = requests.post(url, json=payload)  print(response.text.encode('utf8'))`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/getContactInfo/{{apiTokenInstance}}' \ --header 'Content-Type: application/json' \ --data-raw '{     "chatId": "71234567890@c.us" }'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getContactInfo/")     .append({{apiTokenInstance}});  var headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);  var jsonBody = "{\"chatId\": \"71234567890@c.us\"}";  var requestEntity = new HttpEntity<>(jsonBody, headers);  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.POST, requestEntity, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getContactInfo/")     .append({{apiTokenInstance}});  var response = Unirest.post(requestUrl.toString())     .header("Content-Type", "application/json")     .body("{\"chatId\": \"71234567890@c.us\"}")     .asString();  System.out.println(response);`

`Sub GetContactInfo()     Dim url As String     Dim RequestBody As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/GetContactInfo/{{apiTokenInstance}}"      ' chatId - is the number to send the message to (@c.us for private chats, @g.us for group chats)     RequestBody = "{""chatId"":""71234567890@c.us""}"      Set http = CreateObject("MSXML2.XMLHTTP")      With http         .Open "POST", url, False         .setRequestHeader "Content-Type", "application/json"         .Send RequestBody     End With      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     Range("A1").Value = response      Set http = Nothing End Sub`

[

Назад Получить контакты



](../GetContacts/)[

Вперед Редактировать сообщение

](../EditMessage/)

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

