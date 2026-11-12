# GREEN-API v3 (MAX): v3-GetStateInstance

> Source: https://green-api.com/v3/docs/api/account/GetStateInstance/
> Saved: 2026-11-12

Редактировать страницу")

# GetStateInstance[#](#getstateinstance "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/getStateInstance) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api-max/request/eqjk9u3/) [![Apidog](../../../assets/apidog.svg)](https://ln3fqbtgjx.apidog.io/%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C-%D1%81%D0%BE%D1%81%D1%82%D0%BE%D1%8F%D0%BD%D0%B8%D0%B5-%D0%B8%D0%BD%D1%81%D1%82%D0%B0%D0%BD%D1%81%D0%B0-20289446e0)

Метод предназначен для получения состояния инстанса.

Для метода используются [ограничения](../../ratelimiter/#GetStateInstance) на частоту запросов в секунду.

## Запрос[#](#request "Permanent link")

Для получения состояния инстанса требуется выполнить запрос по адресу:

GET

`{{apiUrl}}/waInstance{{idInstance}}/getStateInstance/{{apiTokenInstance}}`

Префикс `v3` стал необязательным параметром запроса

Для вашего удобства унифицировали формат запросов методов API для всех мессенджеров.  
Подробнее о правилах вызова методов читайте в статье [Выполнение запросов](../../../request-format/).

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`stateInstance`

**string**

Состояние инстанса. Принимает значения:

`notAuthorized` - Инстанс не авторизован  
Для авторизации инстанса обратитесь к разделу [Перед началом работы](../../../before-start/)

`authorized` - Инстанс авторизован

`blocked` - Аккаунт МАХ получил блокировку. После reboot/logout инстанс перейдёт в статус `notAuthorized`

`starting` - Инстанс в процессе запуска (сервисный режим)  
Происходит перезагрузка инстанса, сервера или инстанс в режиме обслуживания  
Может потребоваться до 5 минут для перехода состояния инстанса в значение `authorized`

`suspended` - На аккаунте временные ограничения (частичный запрет отправки сообщений)  
Время окончания ограничений находится в поле ответа [GetAccountSettings](../GetAccountSettings/) `suspendedUntil`  
Подробнее о статусе `suspended` читайте в [статье](../../../faq/what-is-meaning-status-suspended/)

`pendingPassword` - Для завершения авторизации необходимо отправить пароль двухфакторной аутентификации (2fa) методом [SendAuthorizationPassword](../SendAuthorizationPassword/)

> При статусе `suspended` отправка сообщений возможна только на номера, сохранённые в контакты.  
> При отправке на номер, не сохранённый в контактах, будет получена ошибка **403** с описанием `Your account is suspended`.

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "stateInstance": "authorized" }`

### Ошибки GetStateInstance[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

Код HTTP

Идентификатор ошибки

Описание

200

Инстанс долго (более 5 минут) в состоянии `starting`

1\. Сделать перезапуск инстанса методом [reboot](../Reboot/)  
2\. Обратиться в службу технической поддержки

## Примеры кода[#](#request-example "Permanent link")

PythoncURLJava - SpringJava - UnirestVBA

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/getStateInstance/{{apiTokenInstance}}"  payload = {} headers= {}  response = requests.request("GET", url, headers=headers, data = payload)  print(response.text.encode('utf8'))`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/getStateInstance/{{apiTokenInstance}}'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getStateInstance/")     .append({{apiTokenInstance}});  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.GET, null, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getStateInstance/")     .append({{apiTokenInstance}});  var response = Unirest.get(requestUrl.toString())     .header("Content-Type", "application/json")     .asString();  System.out.println(response);`

`Sub GetStateInstance()     Dim url As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/getStateInstance/{{apiTokenInstance}}"      Set http = CreateObject("MSXML2.XMLHTTP")      http.Open "GET", url, False     http.Send      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     ' Range("A1").Value = response      Set http = Nothing End Sub`

[

Назад Разлогинить инстанс



](../Logout/)[

Вперед Получить историю состояния инстанса

](../GetStateInstanceHistory/)

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

