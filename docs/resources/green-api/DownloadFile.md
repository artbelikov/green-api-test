# GREEN-API: DownloadFile

> Source: https://green-api.com/docs/api/receiving/files/DownloadFile/
> Saved: 2026-11-12

Редактировать страницу")

# DownloadFile[#](#downloadfile "Permanent link")

[![Test](../../../../assets/test.svg)](https://console.green-api.com/app/api/downloadFile) [![Postman](../../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/ngupurs/download-file-from-incoming-message) [![Apidog](../../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D1%81%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C-%D1%84%D0%B0%D0%B9%D0%BB-%D0%B8%D0%B7-%D0%B2%D1%85%D0%BE%D0%B4%D1%8F%D1%89%D0%B5%D0%B3%D0%BE-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D1%8F-12124710e0)

Метод предназначен для скачивания принятых и отправленных файлов. Ссылки на принятые файлы передаются во [Входящих сообщениях](../../notifications-format/incoming-message/Webhook-IncomingMessageReceived/), а также их можно получить методом [LastIncomingMessages](../../../journals/LastIncomingMessages/). Ссылки на отправленные файлы можно получить методом [LastOutgoingMessages](../../../journals/LastOutgoingMessages/).

> Срок хранения файлов и соответственно возможность их первоначального скачивания ограничено временем, которое хранит их у себя WhatsApp\*

## Запрос[#](#request "Permanent link")

POST

`{{apiUrl}}/waInstance{{idInstance}}/downloadFile/{{apiTokenInstance}}`

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../../before-start/#parameters).

### Параметры запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`chatId`

**string**

Да

[Идентификатор личного или группового чата](../../../chat-id/) историю сообщений которого требуется получить

`idMessage`

**string**

Да

Идентификатор сообщения

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`downloadUrl`

**string**

Ссылка на файл из сообщения

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "downloadUrl": "https://sw-media.storage.yandexcloud.net/1103912412/a6679d42-2f7f-4121-acfe-1f993dfcf123.png" }`

### Ошибки DownloadFile[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../../common-errors/)

Код HTTP

Идентификатор ошибки

Описание

400

`Bad Request`  
`Validation failed`

[Ошибка валидации](../../../common-errors/#400-validation-failed)

400

`Validation failed.`  
`Details: 'value' must have at least 2 keys`

Ошибка валидации. Поле `value` должно содержать минимум 2 символа

400

`File message encrypted url not found by chatId 790000312312@c.us and idMessage A322F800D3F12CD4858CC947DAFB77A2`

Файл отсутствует в сообщении

500

`Internal error when downloading file by chatId 790000312312@c.us and idMessage A322F800D3F12CD4858CC947DAFB77A2`

Файл не доступен на серверах WhatsApp\*, загрузка через API невозможна

## Примеры кода[#](#request-example "Permanent link")

PythoncURLJava - SpringJava - UnirestVBA

`import requests import json  url = "{{apiUrl}}/waInstance{{idInstance}}/downloadFile/{{apiTokenInstance}}"  payload = json.dumps({   "chatId": "790000312312@c.us",   "idMessage": "A322F800D3F12CD4858CC947DAFB77A2" }) headers = {   'Content-Type': 'application/json' }  response = requests.post(url, json=payload)  print(response.text)`

`curl --location -g --request POST '{{apiUrl}}/waInstance{{idInstance}}/downloadFile/{{apiTokenInstance}}' \ --header 'Content-Type: application/json' \ --data-raw '{     "chatId": "79000001234@c.us",     "idMessage": "A322F800D3F12CD4858CC947DAFB77A2" }'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/downloadFile/")     .append({{apiTokenInstance}});  var headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);  var jsonBody = "{\"chatId\": \"79000001234@c.us\",\"idMessage\": \"A322F800D3F12CD4858CC947DAFB77A2\"}";  var requestEntity = new HttpEntity<>(jsonBody, headers);  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.POST, requestEntity, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/downloadFile/")     .append({{apiTokenInstance}});  var response = Unirest.post(requestUrl.toString())     .header("Content-Type", "application/json")     .body("{\"chatId\": \"79000001234@c.us\",\"idMessage\": \"A322F800D3F12CD4858CC947DAFB77A2\"}")     .asString();  System.out.println(response);`

`Sub DownloadFile()     Dim url As String     Dim RequestBody As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/downloadFile/{{apiTokenInstance}}"      ' chatId - personal or group chat identifier whose message history you want to receive, count - number of messages to receive, default value 100     RequestBody = "{""chatId"":""71234567890@c.us"",""idMessage"":""E5A2563784F535FD43B3B83142E1234E""}"      Set http = CreateObject("MSXML2.XMLHTTP")      With http         .Open "POST", url, False         .setRequestHeader "Content-Type", "application/json"         .send RequestBody     End With      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     Range("A1").Value = response      Set http = Nothing End Sub`

[

Назад Типы входящих уведомлений



](../../notifications-format/type-webhook/)[

Вперед Журналы обзор

](../../../journals/)

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

