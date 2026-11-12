# GREEN-API: Service-GetContacts

> Source: https://green-api.com/docs/api/service/GetContacts/
> Saved: 2026-11-12

Редактировать страницу")

# GetContacts[#](#getcontacts "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/getContacts) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/zfsbhyd/get-contacts) [![Apidog](../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C-%D0%BA%D0%BE%D0%BD%D1%82%D0%B0%D0%BA%D1%82%D1%8B-12124738e0)

Метод предназначен для получения списка контактов текущего аккаунта.

> Обновление информации о контактах может занимать до 5 минут.
> 
> При получении пустого массива данных - повторить вызов метода.

## Запрос[#](#request "Permanent link")

Для получения списка контактов требуется выполнить запрос по адресу:

GET

`{{apiUrl}}/waInstance{{idInstance}}/getContacts/{{apiTokenInstance}}`

Для получения параметров запроса `apiUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

### Параметры URL запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`group`

**boolean**

Нет

При указании `group=true` отображаются только группы

При указании `group=false` отображаются только персональные чаты

При отсутствии параметра отображается полный список контактов

`count`

**integer**

Нет

При указании числа `count={{number}}`, отображается указанное количество контактов

Если контактов меньше, чем указанное число, то отображаются все контакты, соответствующие запросу

При отсутствии параметра показываются все контакты

### Примеры запроса с необязательными параметрами[#](#request-examples "Permanent link")

Получить список групп текущего аккаунта:

GET

`{{apiUrl}}/waInstance{{idInstance}}/getContacts/{{apiTokenInstance}}?group=true`

Получить список личных чатов текущего аккаунта в заданном количестве:

GET

`{{apiUrl}}/waInstance{{idInstance}}/getContacts/{{apiTokenInstance}}?group=false&count={{number}}`

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`id`

**string**

[Идентификатор корреспондента или группового чата](../../chat-id/)

`name`

**string**

Имя контакта. Возможные значения:

1) Если есть входящая переписка/реакции от аккаунта, то получаем имя из профиля WhatsApp\*

2) Если нет входящей переписки/реакций от аккаунта, то получаем пустую строку

`contactName`

**string**

Имя контакта из телефонной книги

`type`

**string**

Тип контакта. Возможные значения:

`user` - контакт принадлежит корреспонденту

`group` - контакт является групповым чатом

`newChatId`

**string**

Новый идентификатор `lid` чата. Поле необязательное: возвращается, только если для пользователя доступен новый `lid`. Подробнее - [Смена lid](../../../faq/lid-important-differences/#lid-change)

### Пример тела ответа[#](#response-example-body "Permanent link")

`[     {         "id": "79876543210@c.us",         "name": "Иван Петров",         "contactName": "Иван Петоров Работа",         "type": "user"     },     {         "id": "79001234567@c.us",         "name": "Люся Сидорова",         "contactName": "Люся Сидорова кружок шитья",         "type": "user"     },     {         "id": "79001234567-1479621234@g.us",         "name": "Моя группа",         "type": "group"     } ]`

### Ошибки GetContacts[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

Код HTTP

Описание ошибки

Возможные решения

200

Метод getContacts возвращает пустой массив `[]`

1\. Пересканировать QR-код.  
2\. Обратиться в службу техподдержки.

## Примеры кода[#](#request-example "Permanent link")

PythoncURLJava - SpringJava - UnirestVBA

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/getContacts/{{apiTokenInstance}}"  payload = {} headers= {}  response = requests.request("GET", url, headers=headers, data = payload)  print(response.text.encode('utf8'))`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/getContacts/{{apiTokenInstance}}'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getContacts/")     .append({{apiTokenInstance}});  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.GET, null, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/getContacts/")     .append({{apiTokenInstance}});  var response = Unirest.get(requestUrl.toString())     .header("Content-Type", "application/json")     .asString();  System.out.println(response);`

`Sub GetContacts()     Dim url As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/GetContacts/{{apiTokenInstance}}"      Set http = CreateObject("MSXML2.XMLHTTP")      http.Open "GET", url, False     http.Send      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     Range("A1").Value = response      Set http = Nothing End Sub`

[

Назад Получить аватар



](../GetAvatar/)[

Вперед Получить информацию о контакте

](../GetContactInfo/)

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

