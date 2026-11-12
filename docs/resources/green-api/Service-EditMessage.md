# GREEN-API: Service-EditMessage

> Source: https://green-api.com/docs/api/service/EditMessage/
> Saved: 2026-11-12

Редактировать страницу")

# EditMessage[#](#editmessage "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/editMessage) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/usgljp0/edit-message) [![Apidog](../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B5-12124740e0)

Метод предназначен для редактирования текстового сообщения в личном или групповом чате.

## Запрос[#](#request "Permanent link")

Для редактирования сообщения требуется выполнить запрос по адресу:

POST

`{{apiUrl}}/waInstance{{idInstance}}/editMessage/{{apiTokenInstance}}`

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

`idMessage`

**string**

Да

ID редактируемого оригинального сообщения

`message`

**string**

Да

Текст сообщения. Максимальная длина текстового сообщения составляет 20000 символов. Поддерживаются символы emoji 😃. Требуется использовать кодировку UTF-8 без BOM

Примечание

При редактировании сообщения [WhatsApp\*](https://faq.whatsapp.com/6614640168569481/?helpref=search&cms_platform=web&cms_id=6614640168569481&draft=true) накладывает следующие ограничения:

1.  Редактирование сообщения возможно в течение 15 минут после его отправки.  
    При попытке редактирования сообщения позднее запрос получит ответ 200, а инстанс получит уведомление о том, что [сообщение не было отредактировано](../../receiving/notifications-format/outgoing-message/OutgoingMessageStatus/#expired).
2.  Сообщение, отправленное через API, возможно изменить только через API.  
    Изменение с телефона или другого связанного устройства (WhatsApp\* Web, WhatsApp\* Desktop) невозможно.
3.  При изменении сообщений новое уведомление участникам чата не отправляется
4.  Редактируется только текст сообщения, фото, видео и другие медиафайлы не редактируются.

### Пример тела запроса[#](#request-example-body "Permanent link")

Редактирование сообщения в личном чате:

`{     "chatId": "79876543210@c.us",     "idMessage": "BAE5367237E13A87",     "message": "I use Green-API to send this message to you!" }`

Редактирование сообщения в групповом чате:

`{     "chatId": "120363043968066561@g.us",     "idMessage": "BAE5367237E13A87",     "message": "I use Green-API to send this message to you!" }`

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`idMessage`

**string**

Идентификатор отредактированного сообщения

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "idMessage": "3EB0C767D097B7C7C030" }`

### Ошибки EditMessage[#](#errors "Permanent link")

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

## Примеры кода[#](#request-example "Permanent link")

PythonPHPcURLJava - UnirestGo

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/editMessage/{{apiTokenInstance}}"  payload = {     "chatId": "79123456789@c.us",     "idMessage": "BAE5367237E13A87",     "message": "I use Green-API to send this message to you!" } headers = {     'Content-Type': 'application/json' }  response = requests.post(url, json=payload, headers=headers)  print(response.text.encode('utf8'))`

`<?php  $curl = curl_init();  curl_setopt_array($curl, array( CURLOPT_URL => '/waInstance%7B%7BidInstance%7D%7D/editMessage/%7B%7BapiTokenInstance%7D%7D', CURLOPT_RETURNTRANSFER => true, CURLOPT_ENCODING => '', CURLOPT_MAXREDIRS => 10, CURLOPT_TIMEOUT => 0, CURLOPT_FOLLOWLOCATION => true, CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1, CURLOPT_CUSTOMREQUEST => 'POST', CURLOPT_POSTFIELDS =>'{     "chatId": "79123456789@c.us",     "idMessage": "BAE5367237E13A87",     "message": "I use Green-API to send this message to you!" }', CURLOPT_HTTPHEADER => array(     'Content-Type: application/json' ), ));  $response = curl_exec($curl);  curl_close($curl); echo $response;`

`curl --location -g --request POST '/waInstance{{idInstance}}/editMessage/{{apiTokenInstance}}' \ --header 'Content-Type: application/json' \ --data-raw '{     "chatId": "79123456789@c.us",     "idMessage": "BAE5367237E13A87",     "message": "I use Green-API to send this message to you!" }'`

`Unirest.setTimeouts(0, 0); HttpResponse<String> response = Unirest.post("/waInstance{{idInstance}}/editMessage/{{apiTokenInstance}}") .header("Content-Type", "application/json") .body("{\r\n    \"chatId\": \"79123456789@c.us\",\r\n    \"idMessage\": \"BAE5367237E13A87\",\r\n    \"message\": \"I use Green-API to send this message to you!\"\r\n}") .asString();`

``package main  import ( "fmt" "strings" "net/http" "io/ioutil" )  func main() {  url := "/waInstance%7B%7BidInstance%7D%7D/editMessage/%7B%7BapiTokenInstance%7D%7D" method := "POST"  payload := strings.NewReader(`{`+" "+`     "chatId": "79123456789@c.us",`+" "+`     "idMessage": "BAE5367237E13A87",`+" "+`     "message": "I use Green-API to send this message to you!"`+" "+` }`)  client := &http.Client { } req, err := http.NewRequest(method, url, payload)  if err != nil {     fmt.Println(err)     return } req.Header.Add("Content-Type", "application/json")  res, err := client.Do(req) if err != nil {     fmt.Println(err)     return } defer res.Body.Close()  body, err := ioutil.ReadAll(res.Body) if err != nil {     fmt.Println(err)     return } fmt.Println(string(body)) }``

[

Назад Получить информацию о контакте



](../GetContactInfo/)[

Вперед Удалить сообщение

](../DeleteMessage/)

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

