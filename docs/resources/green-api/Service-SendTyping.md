# GREEN-API: Service-SendTyping

> Source: https://green-api.com/docs/api/service/SendTyping/
> Saved: 2026-11-12

Редактировать страницу")

# SendTyping[#](#sendtyping "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/sendTyping) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/kv0iggn/send-typing-text) [![Apidog](../../../assets/apidog.svg)](https://apidog.com/apidoc/docs-site/746016/%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%83%D0%B2%D0%B5%D0%B4%D0%BE%D0%BC%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5-%D0%BD%D0%B0%D0%B1%D0%BE%D1%80%D0%B0-%D1%82%D0%B5%D0%BA%D1%81%D1%82%D0%B0-18170225e0)

Метод предназначен для отправки уведомления о наборе текста или записи аудио в чат.

## Запрос[#](#request "Permanent link")

Для отправки уведомления требуется выполнить запрос по адресу:

POST

`{{apiUrl}}/waInstance{{idInstance}}/sendTyping/{{apiTokenInstance}}`

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

`typingTime`

**integer**

Нет

Время показа уведомления набора сообщения в чате собеседника.  
Время ограничено значениями от 1000 до 20000 миллисекунд (от 1 до 20 секунд).

`typingType`

**string**

Нет

Тип набора сообщения. Для отправки уведомления для записи аудио необходимо отправить строку `recording`

Примечание

Время доставки уведомления будет складываться из интервала отправки сообщений из очереди ([`delaySendMessagesMilliseconds`](../../send-messages-delay/)) и заданного времени набора текста (`typingTime`).

### Пример тела запроса[#](#request-example-body "Permanent link")

Отправка уведомления набора текста:  

`{     "chatId": "79876543210@c.us",     "typingTime": 5000 }`

Отправка уведомления записи аудио:  

`{     "chatId": "79876543210@c.us",     "typingTime": 5000,     "typingType": "recording" }`

## Ответ[#](#response "Permanent link")

### Пример тела ответа[#](#response-example-body "Permanent link")

Тело ответа пустое. При успехе ответ сервера 200.

### Ошибки SendTyping[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

Код HTTP

Идентификатор ошибки

Описание

400

`Validation failed`

'typingTime' должно быть числом

400

`Validation failed`

typingTime' должно быть больше или равно 1000

400

`Validation failed`

'typingTime' должно быть меньше или равно 20000

## Примеры кода[#](#request-example "Permanent link")

PythonPHPcURLJava - UnirestGo

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/sendTyping/{{apiTokenInstance}}"  payload = {     "chatId": "79876543210@c.us",     "typingTime": 5000 } headers = { 'Content-Type': 'application/json' }  response = requests.post(url, json=payload, headers=headers)  print(response.text.encode('utf8'))`

`<?php  $curl = curl_init();  curl_setopt_array($curl, array( CURLOPT_URL => '/waInstance%7B%7BidInstance%7D%7D/sendTyping/%7B%7BapiTokenInstance%7D%7D', CURLOPT_RETURNTRANSFER => true, CURLOPT_ENCODING => '', CURLOPT_MAXREDIRS => 10, CURLOPT_TIMEOUT => 0, CURLOPT_FOLLOWLOCATION => true, CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1, CURLOPT_CUSTOMREQUEST => 'POST', CURLOPT_POSTFIELDS =>'{     "chatId": "79876543210@c.us",     "typingTime": 5000 }', CURLOPT_HTTPHEADER => array(     'Content-Type: application/json' ), ));  $response = curl_exec($curl);  curl_close($curl); echo $response;`

`curl --location -g --request POST '/waInstance{{idInstance}}/sendTyping/{{apiTokenInstance}}' \ --header 'Content-Type: application/json' \ --data-raw '{     "chatId": "79876543210@c.us",     "typingTime": 5000 }'`

`Unirest.setTimeouts(0, 0); HttpResponse<String> response = Unirest.post("/waInstance{{idInstance}}/sendTyping/{{apiTokenInstance}}") .header("Content-Type", "application/json") .body("{\r\n    \"chatId\": \"79123456789@c.us\",\r\n    \"typingTime\": 5000,\r\n}") .asString();`

``package main  import ( "fmt" "strings" "net/http" "io/ioutil" )  func main() {  url := "/waInstance%7B%7BidInstance%7D%7D/sendTyping/%7B%7BapiTokenInstance%7D%7D" method := "POST"  payload := strings.NewReader(`{`+" "+`     "chatId": "79123456789@c.us",`+" "+`     "typingTime": 5000`+" "+` }`)  client := &http.Client { } req, err := http.NewRequest(method, url, payload)  if err != nil {     fmt.Println(err)     return } req.Header.Add("Content-Type", "application/json")  res, err := client.Do(req) if err != nil {     fmt.Println(err)     return } defer res.Body.Close()  body, err := ioutil.ReadAll(res.Body) if err != nil {     fmt.Println(err)     return } fmt.Println(string(body)) }``

[

Назад Изменить настройки исчезающих сообщений чата



](../SetDisappearingChat/)[

Вперед Получить список последних чатов

](../GetChats/)

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

