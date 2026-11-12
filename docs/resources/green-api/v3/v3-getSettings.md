# GREEN-API v3 (MAX): v3-getSettings

> Source: https://green-api.com/v3/docs/api/account/GetSettings/
> Saved: 2026-11-12

Редактировать страницу")

# GetSettings[#](#getsettings "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/getSettings) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api-max/request/16itz0e/) [![Apidog](../../../assets/apidog.svg)](https://ln3fqbtgjx.apidog.io/%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C-%D0%BD%D0%B0%D1%81%D1%82%D1%80%D0%BE%D0%B9%D0%BA%D0%B8-%D0%B8%D0%BD%D1%81%D1%82%D0%B0%D0%BD%D1%81%D0%B0-20289444e0)

Метод предназначен для получения текущих настроек инстанса.

Для метода используются [ограничения](../../ratelimiter/#GetSettings) на частоту запросов в секунду.

## Запрос[#](#request "Permanent link")

Для получения текущих настроек инстанса требуется выполнить запрос по адресу:

GET

`{{apiUrl}}/waInstance{{idInstance}}/getSettings/{{apiTokenInstance}}`

Префикс `v3` стал необязательным параметром запроса

Для вашего удобства унифицировали формат запросов методов API для всех мессенджеров.  
Подробнее о правилах вызова методов читайте в статье [Выполнение запросов](../../../request-format/).

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`wid`

**string**

Идентификатор аккаунта

`typeInstance`

**string**

Версия интерфейса. Поле принимает значение `v3` для мессенджера MAX и `whatsapp` - для мессенджера WhatsApp

`webhookUrl`

**string**

Адрес отправки уведомлений (URL). При получении уведомлений технологией [HTTP API](../../receiving/technology-http-api/), поле должно быть пустым. [Описание работы поля.](../../receiving/technology-webhook-endpoint/)

`webhookUrlToken`

**string**

Заголовок авторизации для отправки уведомлений. [Описание работы поля.](../../receiving/technology-webhook-endpoint/)

`delaySendMessagesMilliseconds`

**integer**

[Интервал отправки сообщений](../../send-messages-delay/) в миллисекундах

`markIncomingMessagesReaded`

**string**

Отмечать входящие сообщения прочитанными, возможные значения: `yes`, `no`. Игнорируется, если markIncomingMessagesReadedOnReply в значении 'yes'.

`markIncomingMessagesReadedOnReply`

**string**

Отмечать входящие сообщения прочитанными при отправке сообщения через API, возможные значения: `yes`, `no`. Если в значении 'yes', то настройка markIncomingMessagesReaded игнорируется.

`outgoingWebhook`

**string**

Получать уведомления о статусах отправленных сообщений, возможные значения: `yes`, `no`.

`outgoingMessageWebhook`

**string**

Получать уведомления о сообщениях, отправленных с телефона, web версии и desktop версии, возможные значения: `yes`, `no`

`outgoingAPIMessageWebhook`

**string**

Получать уведомления о сообщениях, отправленных через API, возможные значения: `yes`, `no`. При отправке сообщения на несуществующий аккаунт MAX, уведомление не придет.

`stateWebhook`

**string**

Получать уведомления об изменении состояния авторизации инстанса, возможные значения: `yes`, `no`

`incomingWebhook`

**string**

Получать уведомления о входящих сообщениях и файлах, возможные значения: `yes`, `no`

`editedMessageWebhook`

**string**

Получать уведомления об отредактированных сообщениях: `yes`, `no`

`deletedMessageWebhook`

**string**

Получать уведомления об удалённых сообщениях: `yes`, `no`

`pollMessageWebhook`

**string**

Получать уведомления об опросах: `yes`, `no`

`downloadUrlJpeg`

**string**

Получать ссылку с jpeg файлом для сообщений типа `imageMessage, stickerMessage`: `yes`, `no`

Применение настроек

Для получения уведомлений о **статусах отправки/доставки/прочтении сообщений**, отправленных с телефона требуется включить настройки:

*   `outgoingMessageWebhook`
*   `outgoingWebhook`

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "wid": "79991234567@c.us",     "typeInstance": "v3",     "webhookUrl": "",     "webhookUrlToken": "",     "delaySendMessagesMilliseconds": 0,     "markIncomingMessagesReaded": "no",     "markIncomingMessagesReadedOnReply": "no",     "outgoingWebhook": "yes",     "outgoingMessageWebhook": "yes",     "outgoingAPIMessageWebhook": "yes",     "stateWebhook": "yes",     "incomingWebhook": "yes",     "editedMessageWebhook": "no",     "deletedMessageWebhook": "no",     "pollMessageWebhook": "no",     "downloadUrlJpeg": "no" }`

### Ошибки GetSettings[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

## Примеры кода[#](#request-example "Permanent link")

PythonPHPcURLJava - SpringJava - UnirestVBADelphi

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/getSettings/{{apiTokenInstance}}"  payload = {} headers= {}  response = requests.request("GET", url, headers=headers, data = payload)  print(response.text.encode('utf8'))`

`<?php //The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed $url = "{{apiUrl}}/waInstance{{idInstance}}/getSettings/{{apiTokenInstance}}";  $options = array(     'http' => array(         'header' => "Content-Type: application/json\r\n",         'method' => 'GET'     ) );  $context = stream_context_create($options);  $response = file_get_contents($url, false, $context);  echo $response; ?>`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/getSettings/{{apiTokenInstance}}'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getSettings/")     .append({{apiTokenInstance}});  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.GET, null, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getSettings/")     .append({{apiTokenInstance}});  var response = Unirest.get(requestUrl.toString())     .header("Content-Type", "application/json")     .asString();  System.out.println(response);`

`Sub GetSettings()     Dim url As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/getSettings/{{apiTokenInstance}}"      Set http = CreateObject("WinHttp.WinHttpRequest.5.1")      http.Open "GET", url, False     http.Send      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     ' Range("A1").Value = response      Set http = Nothing End Sub`

`program GetSettings;  {$APPTYPE CONSOLE}  uses System.SysUtils, System.Classes, System.Net.HttpClient, System.Net.URLClient, System.Net.HttpClientComponent;  var HttpClient: TNetHTTPClient; RequestHeaders: TNetHeaders; Response: IHTTPResponse; EndpointURL, ID_INSTANCE, API_TOKEN_INSTANCE: string;  begin ID_INSTANCE := '110100001'; API_TOKEN_INSTANCE := 'd75b3a66374942c5b3c019c698abc2067e151558acbd451234';  EndpointURL := 'https://api.green-api.com/waInstance' + ID_INSTANCE + '/getSettings/' + API_TOKEN_INSTANCE;  HttpClient := TNetHTTPClient.Create(nil); RequestHeaders := [     TNetHeader.Create('Content-Type', 'application/json') ];  try     Response := HTTPClient.Get(EndpointURL, nil, RequestHeaders);      if Response.StatusCode = 200 then     Writeln('[Response]: ' + Response.ContentAsString)     else     Writeln('[ERROR ' + IntToStr(Response.StatusCode) + ']:' + Response.StatusText + '' + Response.ContentAsString);      readln; except     on E: Exception do     Writeln(E.ClassName, ': ', E.Message); end;  HttpClient.Free;  end.`

[

Назад Перезапустить инстанс



](../Reboot/)[

Вперед Установить настройки инстанса

](../SetSettings/)

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

