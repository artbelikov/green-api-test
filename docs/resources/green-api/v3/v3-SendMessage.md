# GREEN-API v3 (MAX): v3-SendMessage

> Source: https://green-api.com/v3/docs/api/sending/SendMessage/
> Saved: 2026-11-12

Редактировать страницу")

# SendMessage[#](#sendmessage "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/sendMessage) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api-max/request/3clhrum/) [![Apidog](../../../assets/apidog.svg)](https://ln3fqbtgjx.apidog.io/%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%82%D0%B5%D0%BA%D1%81%D1%82-20289450e0)

Метод предназначен для отправки текстового сообщения в чат.

Перед отправкой сообщения требуется получить [Идентификатор чата](../../chat-id/) из своей информационной системы, либо использовать метод [CheckAccount](../../service/CheckAccount/).

Сообщение будет добавлено в очередь на отправку.

> Сообщение хранится в очереди до 24 часов и отправляется сразу же после авторизации инстанса.  
> Скорость отправки сообщений из очереди регулирует параметр [Интервал отправки сообщений](../../send-messages-delay/).

Также ознакомьтесь с [Рекомендациями по отправке сообщений](../../send-messages-recommendations/).

Для метода используются [ограничения](../../ratelimiter/#SendMessage) на частоту запросов в секунду.

## Запрос[#](#request "Permanent link")

Для отправки текстового сообщения требуется выполнить запрос по адресу:

POST

`{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}`

Префикс `v3` стал необязательным параметром запроса

Для вашего удобства унифицировали формат запросов методов API для всех мессенджеров.  
Подробнее о правилах вызова методов читайте в статье [Выполнение запросов](../../../request-format/).

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

### Параметры запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`chatId`

**string**

Да

[Идентификатор чата](../../chat-id/)

`message`

**string**

Да

Текст сообщения.  
Поддерживаются [символы emoji 😃](#emoji).  
Максимальная длина текстового сообщения составляет 4000 символов. Требуется использовать кодировку UTF-8 без BOM.

`typingTime`

**integer**

Нет

Время показа уведомления набора сообщения в чате собеседника.  
Время ограничено значениями от 1000 до 20000 миллисекунд (от 1 до 20 секунд).

`quotedMessageId`

**string**

Нет

[Идентификатор цитируемого сообщения](../../message-id/). При заполнении параметра сообщение отправится с цитированием указанного сообщения чата.  
Цитирование сообщения возможно только _из того же чата_, в который производится отправка.  
Для отправки сообщений из другого чата используется метод [ForwardMessages](../ForwardMessages/)

Цитирование сообщений

Для корректной работы с механизмом цитирования сообщений система должна знать о сообщении, которое будет процитировано. Убедится о том что сообщение доступно к цитированию можно запросив метод журналирования [getMessage](../../journals/GetMessage/), если сообщение отсутствует в системе, то цитировать такое сообщение невозможно.

*   Для цитирования **входящих сообщений** необходимо включить настройку `Получать уведомления о входящих сообщениях и файлах`.
    
*   Для цитирования **исходящих сообщений** отправленных с телефона, включите настройку `Получать уведомления о сообщениях, отправленных с телефона`.  
    Так сообщения будут попадать в систему и их можно будет цитировать.
    

Установку настроек можно сделать методом [SetSettings](../../account/SetSettings/) или через [личный кабинет](https://console.green-api.com/).

### Пример тела запроса[#](#request-example-body "Permanent link")

Отправка сообщения в личный чат:

`{     "chatId": "10000000",     "message": "Я использую GREEN-API для отправки этого сообщения!" }`

Отправка сообщения по номеру телефона:

`{     "chatId": "79991234567@c.us",     "message": "Я использую GREEN-API для отправки этого сообщения!" }`

Отправка сообщения в групповой чат:

`{     "chatId": "-10000000000000",     "message": "Я использую GREEN-API для отправки этого сообщения!" }`

Отправка сообщения с цитированием:

`{     "chatId": "10000000",     "message": "I use Green-API to send this message to you!",     "quotedMessageId": "1763115112345" }`

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`idMessage`

**string**

[Идентификатор отправленного сообщения](../../message-id/)

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "idMessage": "1763115112345" }`

### Ошибки SendMessage[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

Код HTTP

Идентификатор ошибки

Описание

400

`Bad Request`  
`Validation failed`

[Ошибка валидации](../../common-errors/#400-validation-failed)

400

`Validation failed.`  
`Details: 'message' length must be less than or equal to 4000 characters long`

Текст сообщения должен быть меньше или равен 4000 символам

403

`Your account is suspended`

На аккаунте временные ограничения (частичный запрет отправки сообщений)  
Отправка возможно только на номера, сохранившие ваш номер у себя в контактах  
  
_Время окончания ограничений указано в поле ответа [GetAccountSettings](../../account/GetAccountSettings/) `suspendedUntil`_

500

`request entity too large`

Превышение допустимой длины json (>100кб)

Отправка в сервисный чат

Отправка в сервисный чат (например, "Сервисные уведомления") будет приводить к ошибке. Система вернёт код 200 и id сообщения, но сообщение не отправится, по нему придет вебхук `outgoingMessageStatus` с `"status": "failed"`.

Отправка с неверным идентификатором цитируемого сообщения

В случае некорректного указания `quotedMessageId`, система вернёт код 200 и id отправляемого сообщения, но оно не будет доставлено получателю.

## Примеры кода[#](#request-example "Permanent link")

PythonPHPcURLJava - SpringJava - UnirestVBADelphi

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}"  payload = {     "chatId": "10000000",     "message": "Я использую GREEN-API для отправки этого сообщения!" } headers = { 'Content-Type': 'application/json' }  response = requests.post(url, json=payload, headers=headers)  print(response.text.encode('utf8'))`

`<?php //The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed $url = '{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}';  //chatId is the number to send the message to (@c.us for private chats, @g.us for group chats) $data = array(     'chatId' => '10000000',     'message' => 'Я использую GREEN-API для отправки этого сообщения!' );  $options = array(     'http' => array(         'header' => "Content-Type: application/json\r\n",         'method' => 'POST',         'content' => json_encode($data)     ) );  $context = stream_context_create($options);  $response = file_get_contents($url, false, $context);  echo $response; ?>`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}' \ --header 'Content-Type: application/json' \ --data-raw '{     "chatId": "10000000",     "message": "Я использую GREEN-API для отправки этого сообщения!" }'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/sendMessage/")     .append({{apiTokenInstance}});  var headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);  var jsonBody = "{\r\n\t\"chatId\": \"10000000\",\r\n\t\"message\": \"Я использую GREEN-API для отправки этого сообщения!\"\r\n}";  var requestEntity = new HttpEntity<>(jsonBody, headers);  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.POST, requestEntity, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/sendMessage/")     .append({{apiTokenInstance}});  var response = Unirest.post(requestUrl.toString())     .header("Content-Type", "application/json")     .body("{\r\n\t\"chatId\": \"10000000\",\r\n\t\"message\": \"Я использую GREEN-API для отправки этого сообщения!\"\r\n}")     .asString();  System.out.println(response);`

`Sub SendMessage() Dim URL As String Dim RequestBody As String Dim http As Object  ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed URL = "{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}"  ' chatId is the number to send the message to (@c.us for private chats, - for group chats) RequestBody = "{""chatId"":""10000000"",""message"":""Я использую GREEN-API для отправки этого сообщения!""}"  Set http = CreateObject("MSXML2.XMLHTTP")  With http     .Open "POST", URL, False     .setRequestHeader "Content-Type", "application/json"     .send RequestBody End With  Set http = Nothing  End Sub`

`program sendMessage;  {$APPTYPE CONSOLE}  uses System.SysUtils, System.Classes, System.Net.HttpClient, System.Net.URLClient, System.Net.HttpClientComponent;  var HttpClient: TNetHTTPClient; RequestBody: TStringStream; RequestHeaders: TNetHeaders; Response: IHTTPResponse; EndpointURL, ID_INSTANCE, API_TOKEN_INSTANCE: string;  begin ID_INSTANCE := '110100001'; API_TOKEN_INSTANCE := 'd75b3a66374942c5b3c019c698abc2067e151558acbd451234';  EndpointURL := 'https://api.green-api.com/waInstance' + ID_INSTANCE + '/sendMessage/' + API_TOKEN_INSTANCE;  HttpClient := TNetHTTPClient.Create(nil); RequestBody := TStringStream.Create('{ "chatId": "10000000", "message": "Я использую GREEN-API для отправки этого сообщения!" }', TEncoding.UTF8); RequestHeaders := [     TNetHeader.Create('Content-Type', 'application/json') ];  try     Response := HTTPClient.Post(EndpointURL, RequestBody, nil, RequestHeaders);      if Response.StatusCode = 200 then     Writeln('[Response]: ' + Response.ContentAsString)     else     Writeln('[ERROR ' + IntToStr(Response.StatusCode) + ']:' + Response.StatusText + '' + Response.ContentAsString);      readln; except     on E: Exception do     Writeln(E.ClassName, ': ', E.Message); end;  HttpClient.Free; RequestBody.Free;  end.`

* * *

## Cимволы emoji 😃[#](#emoji "Permanent link")

Существует несколько способов отправить смайлик или другие символы через API:

1.  [Горячими клавишами](#001)
2.  [Копированием](#002)
3.  [С использованием кодов символов](#003)

### 1\. Горячими клавишами[#](#001 "Permanent link")

Cамый простой способ сделать это - использовать встроенные в вашу операционную систему эмодзи.

Для этого поставьте курсор в поле для текста и используйте горячие клавиши:

*   Для Windows: `Win + ю`
*   Для MacOS: `control + command + space`

Затем выберите интересующий символ во всплывшем окне.

> К сожалению, данный способ работает не везде.

### 2\. Копированием[#](#002 "Permanent link")

Иногда самое простое решение - скопировать эмодзи из мессенджера, браузера или любого другого источника.

Пример: 😃😎🤯

> [Пример сайта](https://getemoji.com/) с эмодзи.

### 3\. С использованием кодов символов[#](#003 "Permanent link")

Если поле не поддерживает вставку, или вставленные смайлики отображаются некорректно, попробуйте использовать кодировку символов.

Чтобы отправить смайлики рекомендуем использовать UTF-16. Для этого, вам нужно представить символ в виде шестнадцатеричного числа или суррогатной пары, двух шестнадцатеричных чисел.

`\uD83D\uDE01` - пример суррогатной пары

> Эти числа есть в [таблице символов Unicode](https://apps.timwhitlock.info/emoji/tables/unicode).

[

Назад Отправка обзор



](../)[

Вперед Отправить видео, аудио, изображение, документ

](../SendFileByUpload/)

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

