# GREEN-API: Groups-GetGroupData

> Source: https://green-api.com/docs/api/groups/GetGroupData/
> Saved: 2026-11-12

Редактировать страницу")

# GetGroupData[#](#getgroupdata "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/getGroupData) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/o0ai43s/get-group-data) [![Apidog](../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C-%D0%B8%D0%BD%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D1%86%D0%B8%D1%8E-%D0%BE-%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B5-12124719e0)

Метод получает данные группового чата.

## Запрос[#](#request "Permanent link")

Для получения данных группового чата требуется выполнить запрос по адресу:

POST

`{{apiUrl}}/waInstance{{idInstance}}/getGroupData/{{apiTokenInstance}}`

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

### Параметры запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`groupId`

**string**

Да

[Идентификатор группового чата](../../chat-id/#gus)

Примечание

Для получения валидной ссылки **groupInviteLink** получатель является администратором или владельцем группы, либо участником группы, у которого есть разрешение на отправку ссылки для вступления в группу (для этого поле `allowParticipantsSendInviteLink` должно иметь значение `true`). Иначе метод вернёт код 200 и пустое поле **groupInviteLink**. Для получения ссылки необходимо запрашивать метод с номера у которого есть необходимы права (владелец группы, администратор, либо у пользователей есть разрешение на отправку ссылки).

### Пример тела запроса[#](#request-example-body "Permanent link")

`{     "groupId": "120363043968066561@g.us" }`

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`groupId`

**string**

[Идентификатор группового чата](../../chat-id/#gus)

`owner`

**string**

[Идентификатор](../../chat-id/#corr) владельца группы

`subject`

**string**

Наименование группы

`description`

**string**

Описание группы

`creation`

**number**

Время создания группы в Unix-формате

`subjectTime`

**number**

Время создания наименования группы в Unix-формате

`subjectOwner`

**string**

[Идентификатор](../../chat-id/#corr) пользователя создавшего наименование группы

`groupInviteLink`

**string**

Ссылка приглашения в группу. Чтобы присылать всем пользователям, а не только администраторам необходимо включить разрешение участникам отправлять ссылку на вступление в группу. Узнать разрешение можно в поле `allowParticipantsSendInviteLink`

`ephemeralExpiration`

**number**

Время жизни исчезающих сообщений

`allowParticipantsEditGroupSettings`

**boolean**

Разрешение изменять настройки группы, `true`/`false`

`allowParticipantsSendMessages`

**boolean**

Разрешение отправлять сообщение в группу, `true`/`false`

`allowParticipantsAddMembers`

**boolean**

Разрешение добавлять других участников в группу, `true`/`false`

`isCommunity`

**boolean**

Данная группа является сообществом (доступно только для администраторов сообщества), `true`/`false`

`isCommunityAnnounce`

**boolean**

Данная группа является группой объявлений в сообществе (доступно только для администраторов сообщества), `true`/`false`

`size`

**number**

Количество участников в группе

`participants`

**array**

Коллекция участников группы

`allowParticipantsSendInviteLink`

**boolean**

Разрешение участникам отправлять ссылку на вступление в группу, `true`/`false`

`allowParticipantsSendMessages`

**boolean**

Разрешение участникам просматривать историю сообщений, `true`/`false`

Поля объектов из массива `participants`

Поле

Тип

Описание

`id`

**string**

[Идентификатор](../../chat-id/#corr) участника группового чата

`lid`

**string**

[Идентификатор](../../chat-id/#corr) участника группового чата

`phoneNumber`

**string**

Номер телефона участника в формате [идентификатора](../../chat-id/#corr). Если номер скрыт настройками приватности, возвращается пустая строка

`username`

**string**

Имя пользователя WhatsApp\*. Если имя пользователя не задано, возвращается пустая строка

`isAdmin`

**boolean**

Флаг, является ли пользователь администратором группы

`isSuperAdmin`

**boolean**

Флаг, является ли пользователь супер администратором группы

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "groupId": "120363043968066561@g.us",     "owner": "79876543210@c.us",     "subject": "GREEN-API Group",     "description": "Лучшая группа",     "creation": 1587570015,         "participants": [         {             "id": "79876543210@c.us",             "lid": "123456789098765@lid",             "phoneNumber": "79876543210@c.us",             "username": "",             "isAdmin": true,             "isSuperAdmin": true         },         {             "id": "79001234567@c.us",             "lid": "123456789012345@lid",             "phoneNumber": "79001234567@c.us",             "username": "",             "isAdmin": true,             "isSuperAdmin": false         },         {             "id": "79001234567@c.us",             "lid": "123456789000000@lid",             "phoneNumber": "79001234567@c.us",             "username": "",             "isAdmin": false,             "isSuperAdmin": false         }     ],     "subjectTime": 1587737715,     "subjectOwner": "79876543210@c.us",     "groupInviteLink": "https://chat.whatsapp.com/xxxxxxxxxxxxxxxxxxxxxx",     "allowParticipantsSendMessages": true,     "size": 2,     "ephemeralExpiration": 0,     "allowParticipantsEditGroupSettings": true,     "allowParticipantsAddMembers": false,     "isCommunity": false,     "isCommunityAnnounce": false,     "allowParticipantsSendInviteLink": true,     "allowParticipantsSendMessageHistory": true }`

### Ошибки GetGroupData[#](#errors "Permanent link")

Ограничения WhatsApp\* при частом вызове метода

При частом выполнении запросов, WhatsApp\* может ограничивать получение ссылки на группу. В этом случае, в ответе GetGroupData будет пустое поле `groupInviteLink`.

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

Код HTTP

Идентификатор ошибки

Описание

500

`Error: forbidden`

Вы не состоите в группе

500

`Error: item-not-found`

Группы не существует

400

`Bad Request`  
`Validation failed`

[Ошибка валидации](../../common-errors/#400-validation-failed)

400

`Bad Request`  
`Validation failed.`  
`Details: 'groupId' must be the next formats: 'group_id@g.us`

Неверный формат поля `groupId`, поле указывается в формате `group_id@g.us`

## Примеры кода[#](#request-example "Permanent link")

PythoncURLJava - SpringJava - UnirestVBA

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/getGroupData/{{apiTokenInstance}}"  payload = {(     "groupId": "11011234567@g.us") } headers = {   'Content-Type': 'application/json' }  response = requests.post(url, json=payload)  print(response.text.encode('utf8'))`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/getGroupData/{{apiTokenInstance}}' \ --header 'Content-Type: application/json' \ --data-raw '{     "groupId": "11111111111111111@g.us" }'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getGroupData/")     .append({{apiTokenInstance}});  var headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);  var jsonBody = "{\"groupId\": \"11111111111111111@g.us\"}";  var requestEntity = new HttpEntity<>(jsonBody, headers);  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.POST, requestEntity, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getGroupData/")     .append({{apiTokenInstance}});  var response = Unirest.post(requestUrl.toString())     .header("Content-Type", "application/json")     .body("{\"groupId\": \"11111111111111111@g.us\"}")     .asString();  System.out.println(response);`

`Sub GetGroupData()     Dim url As String     Dim RequestBody As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/getGroupData/{{apiTokenInstance}}"      ' groupId - group chat identifier     RequestBody = "{""groupId"":""120123400367448864@g.us""}"      Set http = CreateObject("MSXML2.XMLHTTP")      With http         .Open "POST", url, False         .setRequestHeader "Content-Type", "application/json"         .Send RequestBody     End With      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     Range("A1").Value = response      Set http = Nothing End Sub`

[

Назад Изменить имя группы



](../UpdateGroupName/)[

Вперед Изменить настройки группы

](../UpdateGroupSettings/)

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

