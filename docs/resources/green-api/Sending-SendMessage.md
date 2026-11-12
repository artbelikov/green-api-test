# GREEN-API: Sending-SendMessage

> Source: https://green-api.com/docs/api/sending/SendMessage/
> Saved: 2026-11-12

Редактировать страницу")

# SendMessage[#](#sendmessage "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/sendMessage) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/0ukfqj0/send-text) [![Apidog](../../../assets/apidog.svg)](https://apidog.com/apidoc/docs-site/746016/send-text-17727995e0)

Метод предназначен для отправки текстового сообщения в личный или групповой чат. Сообщение будет добавлено в очередь на отправку. Сообщение на отправку хранится 24 часа в очереди и будет отправлено сразу же после авторизации телефона. Скорость отправки сообщений из очереди регулирует параметр [Интервал отправки сообщений](../../send-messages-delay/).

## Видеоинструкция[#](#_1 "Permanent link")

YouTubeRuTube

Отправка сообщения себе

При отправке сообщений себе на номер или в группу с одним участником, [статус сообщения](https://green-api.com/docs/api/receiving/notifications-format/outgoing-message/OutgoingMessageStatus/) будет `sent` (одна галочка).

## Запрос[#](#request "Permanent link")

Для отправки текстового сообщения требуется выполнить запрос по адресу:

POST

`{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}`

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
Поддерживаются [символы emoji 😃](../../../faq/how-to-send-emoji/).  
Максимальная длина текстового сообщения составляет 20000 символов.  
Форматирование текста производится в соответствии с правилами, указанными в [нашей статье.](../../../faq/how-to-format-messages/)  
Требуется использовать кодировку UTF-8 без BOM.

`quotedMessageId`

**string**

Нет

Идентификатор цитируемого сообщения. При заполнении параметра сообщение отправится с цитированием указанного сообщения чата.  
Цитирование сообщения возможно только _из того же чата_, в который производится отправка.  
Для отправки сообщений из другого чата используется метод [ForwardMessages](../ForwardMessages/)

`linkPreview`

**boolean**

Нет

Параметр включает отображение превью и описание ссылки. По умолчанию включен.  
Принимает значения: `true`/`false`  
Превью ссылки не будет добавлено, если оно весит более 2Мб

`typePreview`

**string**

Нет

Размер превью. Возможные значения: `large` для большого превью и `small` для маленького.  
Если `typePreview`: `large` и передается `jpegThumbnail`, вместо `urlFile`, то превью ссылки будет маленькое

`customPreview`

**object**

Нет

Объект пользовательского превью.  
Для отправки сообщения с превью рекомендуем ознакомиться со статьей [Как отправить сообщение с превью](../../recommendations/how-to-use-custom-preview/).

`typingTime`

**integer**

Нет

Время показа уведомления набора сообщения в чате собеседника.  
Время ограничено значениями от 1000 до 20000 миллисекунд (от 1 до 20 секунд).

Поля объекта [`customPreview`](../../recommendations/how-to-use-custom-preview/):

Поле

Тип

Обязательный

Описание

`title`

**string**

Да

Заголовок превью (до 300 символов)

`description`

**string**

Нет

Описание (до 300 символов)

`link`

**string**

Нет

Доменное имя сайта со ссылкой (до 300 символов). Обязательно должно дублироваться в поле `message`.

`urlFile`

**string**

Нет

Ссылка на файл с картинкой для создания большого превью. Рекомендуемый формат изображения - `jpeg`

`jpegThumbnail`

**string**

Нет

Предпросмотр изображения в base64

Цитирование сообщений

Для корректной работы с механизмом цитирования сообщений система должна знать о сообщении, которое будет процитировано. Убедится о том что сообщение доступно к цитированию можно запросив метод журналирования [getMessage](../../journals/GetMessage/), если сообщение отсутствует в системе, то цитировать такое сообщение невозможно.

*   Для цитирования **входящих сообщений** необходимо включить настройку `Получать уведомления о входящих сообщениях и файлах`.
    
*   Для цитирования **исходящих сообщений** отправленных с телефона, включите настройку `Получать уведомления о сообщениях, отправленных с телефона`.  
    Так сообщения будут попадать в систему и их можно будет цитировать.
    

Установку настроек можно сделать методом [SetSettings](../../account/SetSettings/) или через [личный кабинет](https://console.green-api.com/).

### Пример тела запроса[#](#request-example-body "Permanent link")

Отправка сообщения в личный чат:

`{     "chatId": "79876543210@c.us",     "message": "I use Green-API to send this message to you!" }`

Отправка сообщения в групповой чат:

`{     "chatId": "120363043968066561@g.us",     "message": "I use Green-API to send this message to you!" }`

Отправка сообщения с цитированием:

`{     "chatId": "79876543210@с.us",     "message": "I use Green-API to send this message to you!",     "quotedMessageId": "361B0E63F2FDF95903B6A9C9A102F34B" }`

Отправка сообщения с большим пользовательским превью:

`{     "chatId": "79876543210@c.us",     "message": "ссылка 1: https://green-api.com/docs/api/sending/SendMessage/ \n ссылка 2: https://green-api.com",     "linkPreview": true,     "typePreview": "large",      "customPreview": {          "title": "Пользовательское превью",          "description": "Уау",          "link": "https://green-api.com",          "urlFile": "https://storage.yandexcloud.net/green-api.com/logo/Logo_GREEN-API.jpg"     } }`

Отправка сообщения с маленьким пользовательским превью:

`{     "chatId": "79876543210@c.us",     "message": "ссылка 1: https://green-api.com/docs/api/sending/SendMessage/ \n ссылка 2: https://green-api.com",     "linkPreview": true,     "typePreview": "small",      "customPreview": {          "title": "Пользовательское превью",          "description": "Уау",          "link": "https://green-api.com",          "jpegThumbnail": "https://storage.yandexcloud.net/green-api.com/logo/Logo_GREEN-API.jpg"     } }`

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`idMessage`

**string**

Идентификатор отправленного сообщения

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "idMessage": "3EB0C767D097B7C7C030" }`

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
`Details: 'message' length must be less than or equal to 20000 characters long`

Текст сообщения должен быть меньше или равен 20000 символам

500

`request entity too large`

Превышение допустимой длины json (>100кб)

Отправка с неверным идентификатором цитируемого сообщения

В случае некорректного указания `quotedMessageId`, система вернёт код 200 и id отправляемого сообщения, но оно не будет доставлено получателю.

## Примеры кода[#](#request-example "Permanent link")

PythonPHPcURLJava - SpringJava - UnirestVBADelphi

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}"  payload = {     "chatId": "79876543210@c.us",     "message": "I use Green-API to send this message to you!" } headers = { 'Content-Type': 'application/json' }  response = requests.post(url, json=payload, headers=headers)  print(response.text.encode('utf8'))`

`<?php //The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed $url = '{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}';  //chatId is the number to send the message to (@c.us for private chats, @g.us for group chats) $data = array(     'chatId' => '71234567890@c.us',     'message' => 'Hello World' );  $options = array(     'http' => array(         'header' => "Content-Type: application/json\r\n",         'method' => 'POST',         'content' => json_encode($data)     ) );  $context = stream_context_create($options);  $response = file_get_contents($url, false, $context);  echo $response; ?>`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}' \ --header 'Content-Type: application/json' \ --data-raw '{     "chatId": "71234567890@c.us",     "message": "Hello World" }'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/sendMessage/")     .append({{apiTokenInstance}});  var headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);  var jsonBody = "{\r\n\t\"chatId\": \"79876543210@c.us\",\r\n\t\"message\": \"I use Green-API to send this message to you!\"\r\n}";  var requestEntity = new HttpEntity<>(jsonBody, headers);  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.POST, requestEntity, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/sendMessage/")     .append({{apiTokenInstance}});  var response = Unirest.post(requestUrl.toString())     .header("Content-Type", "application/json")     .body("{\r\n\t\"chatId\": \"79876543210@c.us\",\r\n\t\"message\": \"I use Green-API to send this message to you!\"\r\n}")     .asString();  System.out.println(response);`

`Sub SendMessage() Dim URL As String Dim RequestBody As String Dim http As Object  ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed URL = "{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}"  ' chatId is the number to send the message to (@c.us for private chats, @g.us for group chats) RequestBody = "{""chatId"":""71234567890@c.us"",""message"":""Hello World""}"  Set http = CreateObject("MSXML2.XMLHTTP")  With http     .Open "POST", URL, False     .setRequestHeader "Content-Type", "application/json"     .send RequestBody End With  Set http = Nothing  End Sub`

`program sendMessage;  {$APPTYPE CONSOLE}  uses System.SysUtils, System.Classes, System.Net.HttpClient, System.Net.URLClient, System.Net.HttpClientComponent;  var HttpClient: TNetHTTPClient; RequestBody: TStringStream; RequestHeaders: TNetHeaders; Response: IHTTPResponse; EndpointURL, ID_INSTANCE, API_TOKEN_INSTANCE: string;  begin ID_INSTANCE := '110100001'; API_TOKEN_INSTANCE := 'd75b3a66374942c5b3c019c698abc2067e151558acbd451234';  EndpointURL := 'https://api.green-api.com/waInstance' + ID_INSTANCE + '/sendMessage/' + API_TOKEN_INSTANCE;  HttpClient := TNetHTTPClient.Create(nil); RequestBody := TStringStream.Create('{ "chatId": "71234567890@c.us", "message": "test" }', TEncoding.UTF8); RequestHeaders := [     TNetHeader.Create('Content-Type', 'application/json') ];  try     Response := HTTPClient.Post(EndpointURL, RequestBody, nil, RequestHeaders);      if Response.StatusCode = 200 then     Writeln('[Response]: ' + Response.ContentAsString)     else     Writeln('[ERROR ' + IntToStr(Response.StatusCode) + ']:' + Response.StatusText + '' + Response.ContentAsString);      readln; except     on E: Exception do     Writeln(E.ClassName, ': ', E.Message); end;  HttpClient.Free; RequestBody.Free;  end.`

[

Назад Отправка обзор



](../)[

Вперед Отправить опрос

](../SendPoll/)

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

