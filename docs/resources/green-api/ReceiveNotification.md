# GREEN-API: ReceiveNotification

> Source: https://green-api.com/docs/api/receiving/technology-http-api/ReceiveNotification/
> Saved: 2026-11-12

Редактировать страницу")

# ReceiveNotification[#](#receivenotification "Permanent link")

[![Test](../../../../assets/test.svg)](https://console.green-api.com/app/api/receiveNotification) [![Postman](../../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/zpuqobf/receive-notification) [![Apidog](../../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C-%D1%83%D0%B2%D0%B5%D0%B4%D0%BE%D0%BC%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5-12124708e0)

Метод предназначен для получения одного входящего уведомления из очереди уведомлений.

> Метод ReceiveNotification ожидает получения уведомления в течение 5 секунд. Вызов метода завершается с пустым ответом в случае достижения таймаута. Если в течение 5 секунд в очереди появляется уведомление, то вызов метода завершается, и метод возвращает полученное уведомление.

После получения и обработки входящего уведомления требуется удалить уведомление из очереди. Для этого требуется выполнить метод [DeleteNotification](../DeleteNotification/). После вызова метода [DeleteNotification](../DeleteNotification/) уведомление будет считаться принятым и обработанным и будет безвозвратно удалено из очереди. Таким образом следующий вызов метода [ReceiveNotification](#request) вернет следующее уведомление из очереди в порядке поступления уведомлений в очередь.

> Срок хранения входящих уведомлений в очереди составляет 24 часа.
> 
> Уведомления отдаются из очереди в порядке [FIFO](https://ru.wikipedia.org/wiki/FIFO)

## Запрос[#](#request "Permanent link")

Для получения следующего входящего уведомления из очереди требуется выполнить запрос по адресу:

GET

`{{apiUrl}}/waInstance{{idInstance}}/receiveNotification/{{apiTokenInstance}}?receiveTimeout={{seconds}}`

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../../before-start/#parameters).

### Параметры URL запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`receiveTimeout`

**integer**

нет

Таймаут ожидания уведомления, принимает значение от 5 до 60 секунд (по умолчанию 5 секунд)

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`receiptId`

**integer**

Идентификатор доставки для удаления входящего уведомления методом [DeleteNotification](../DeleteNotification/)

`body`

**object**

Входящее уведомление согласно [Формату входящих уведомлений](../../notifications-format/)

#### Возникла ошибка[#](#response-type-error "Permanent link")

Поле

Тип

Описание

`code`

**string**

Описание кода ошибки

`message`

**string**

Описание ошибки

`status`

**string**

"error" - в случае ошибки

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "receiptId": 1234567,     "body": {         "typeWebhook": "incomingMessageReceived",         "instanceData": {             "idInstance": 1101111111,             "wid": "79876543210@c.us",             "typeInstance": "whatsapp"         },         "timestamp": 1588091580,         "idMessage": "F7AEC1B7086ECDC7E6E45923F5EDB825",         "senderData": {             "chatId": "79001234567@c.us",             "sender": "79001234567@c.us",             "senderName": "Иван",             "senderContactName": "Иван Царевич"         },         "messageData":{             "typeMessage":"textMessage",             "textMessageData":{                 "textMessage":"I use Green-API to send this message to you!"             }         }     } }`

### Пример тела ответа с ошибкой[#](#response-example-body-error "Permanent link")

    `{     "code": "INVALID_PARAM",     "message": "Message cannot be received because custom webhook url is set. Go to cabinet, clear webhook url for instance: XXXXXXXXXXXXX and wait for about 1 minute for another attempt",     "status": "error"     }`

### Ошибки ReceiveNotification[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../../common-errors/)

Код HTTP

Идентификатор ошибки

Описание

400

`Parameter idInstance not an integer`

Параметр `idInstance` не задан или содержит нецифровые символы

400

`Parameter apiTokenInstance not define`

Параметр `apiTokenInstance` не задан

400

`Message cannot be received because custom webhook url is set. Go to cabinet, clear webhook url for instance: ХХХХХХХХХХ and wait for about 1 minute for another attempt`

Поле `webhookUrl` не пустое. Очистите URL-адрес для инстанса ХХХХХХХХХХ и подождите около 1 минуты перед тем, как начать запрашивать уведомления.

## Примеры кода[#](#request-example "Permanent link")

PythoncURLJava - SpringJava - UnirestVBA

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/receiveNotification/{{apiTokenInstance}}"  payload = {} headers= {}  response = requests.request("GET", url, headers=headers, data = payload)  print(response.text.encode('utf8'))`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/receiveNotification/{{apiTokenInstance}}'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/receiveNotification/")     .append({{apiTokenInstance}});  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.GET, null, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/receiveNotification/")     .append({{apiTokenInstance}});  var response = Unirest.get(requestUrl.toString())     .header("Content-Type", "application/json")     .asString();  System.out.println(response);`

`Sub ReceiveNotification()     Dim url As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/receiveNotification/{{apiTokenInstance}}"      Set http = CreateObject("MSXML2.XMLHTTP")      http.Open "GET", url, False     http.Send      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     ' Range("A1").Value = response      Set http = Nothing End Sub` 

Пример кода получения уведомлений на [NodeJS](https://nodejs.org) можно посмотреть в файле [ReceiveNotifications](https://github.com/green-api/whatsapp-api-client/blob/master/examples/ReceiveNotifications.js)

[

Назад Технология HTTP API



](../)[

Вперед Удалить уведомление

](../DeleteNotification/)

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

