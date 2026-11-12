# GREEN-API: Sending-UploadFile

> Source: https://green-api.com/docs/api/sending/UploadFile/
> Saved: 2026-11-12

Редактировать страницу")

# UploadFile[#](#uploadfile "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/uploadFile) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/kovjbb3/upload-file) [![Apidog](../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D0%B2%D1%8B%D0%B3%D1%80%D1%83%D0%B7%D0%B8%D1%82%D1%8C-%D1%84%D0%B0%D0%B9%D0%BB-12124704e0)

**Для метода UploadFile рекомендуется использовать хост mediaUrl из личного кабинета**

Метод предназначен для загрузки файла в облачное хранилище, который можно отправить методом [sendFileByUrl](../SendFileByUrl/). А так же позволяет избежать ошибок получения файлов из внешних хранилищ и ускорить отправку сообщений, например, в сценарии рассылки.

Альтернативный способ отправить файл загрузкой с диска: [sendFileByUpload](../SendFileByUpload/).

Рекомендуется применять метод при рассылках однотипных сообщений:

1.  Методом UploadFile загрузите требуемый файл в хранилище Green-API, в ответе получите ссылку на файл.
2.  Методом [SendFileByUrl](../SendFileByUrl/) производите отправку используя полученную ссылку.

> Срок жизни ссылки 15 дней.
> 
> Максимальный размер отправляемых файлов равен 100 Мбайт.
> 
> Тип отправляемого файла и способ его отправки определяется по расширению файла.
> 
> [Список файловых форматов](../../../faq/types-of-extensions-supported-by-API/), которые успешно отправляются и принимаются через API

## Запрос[#](#request "Permanent link")

Для выгрузки файла требуется выполнить запрос по адресу:

POST

`{{mediaUrl}}/waInstance{{idInstance}}/uploadFile/{{apiTokenInstance}}`

Для получения параметров запроса `mediaUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

### Параметры заголовка[#](#request-headers "Permanent link")

Параметр

Обязательный

Описание

`Content-Type`

Да

Тип файла в соответствии со [списком MIME-типов](https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_MIME-%D1%82%D0%B8%D0%BF%D0%BE%D0%B2) . _(Если тип файла отсутствует в списке, то вместо данной стоки передаётся `GA-Filename`)_

`GA-Filename`

Нет

Имя файла с расширением, если файл отсутствует в списке MIME-типов. Например, файлы как `.go` или `.py`. _(Если тип файла соответствует [списку](https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_MIME-%D1%82%D0%B8%D0%BF%D0%BE%D0%B2), строка не передаётся, используется только `Content-Type`)_

> Если система не сможет определить тип файла, то произойдет отправка с типом по умолчанию (бинарный файл): `.bin`

### Параметры запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`file`

**binary**

Да

Выгружаемый файл

### Пример тела запроса[#](#request-example-body "Permanent link")

`В качестве тела запроса необходимо указать сам файл`

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`urlFile`

**string**

Ссылка на выгруженный файл (срок действия ссылки 15 дней)

> ["Как получить информацию о сроке хранения файла в хранилище GREEN-API?"](../../../faq/link-lifetime/)

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "urlFile": "https://sw-media-out.storage.yandexcloud.net/1101123456/c1aabd48-c1c2-49b1-8f2d-f575a41777be.jpg" }`

### Ошибки uploadFile[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

Код HTTP

Идентификатор ошибки

Описание

400

`file should not be empty`

Пользователь отправил пустой файл. Загружаемый файл не должен быть пустым.

413

`request entity too large`

Превышение допустимого размера файла (~99.9mb)  
Возникает при отправке файлов в обработке 1С (версия 8.3.22.1923). Возможное решение: Сменить версию 1С.

500

`Internal Server Error`

Неверно указан метод запроса. Измените метод на `POST` и повторите запрос

## Примеры кода[#](#request-example "Permanent link")

### Примеры кода uploadFile[#](#request-example-body-uploadFile "Permanent link")

PythoncURLJava - SpringJava - UnirestPHP

`import requests url = "{{mediaUrl}}/waInstance{{idInstance}}/uploadFile/{{apiTokenInstance}}"  headers = { 'Content-Type': 'image/jpeg' }  with open('C:\\window.jpg', mode='rb') as file:     payload = file.read()  response = requests.post(url, headers=headers, data=payload)  print(response.text.encode('utf8'))`

`curl --location '{{mediaUrl}}/{{idInstance}}/uploadFile/{{apiTokenInstance}}' \ --header 'Content-Type: image/jpeg' \ --data '@test.jpg'`

`var file = new File("/Users/user/Desktop/fileExample.jpeg"); var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{mediaUrl}})     .append("/waInstance").append({{idInstance}})     .append("/uploadFile/")     .append({{apiTokenInstance}});  var byteArrayResource = new ByteArrayResource(Files.readAllBytes(file.toPath()));  var headers = new HttpHeaders(); headers.setContentType(MediaTypeFactory.getMediaType(file.getName())     .orElse(MediaType.APPLICATION_OCTET_STREAM));  var requestEntity = new HttpEntity<>(byteArrayResource, headers);  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.POST, requestEntity, String.class); System.out.println(response);`

`var file = new File("/Users/user/Desktop/fileExample.jpeg"); var requestUrl = new StringBuilder(); requestUrl     .append({{mediaUrl}})     .append("/waInstance").append({{idInstance}})     .append("/uploadFile/")     .append({{apiTokenInstance}});  var response = Unirest.post(requestUrl.toString())     .header("Content-Type", Files.probeContentType(file.toPath()))     .body(Files.readAllBytes(file.toPath()))     .asString();  System.out.println(response);`

`<?php // Need to use SDK https://github.com/green-api/whatsapp-api-client-php require './vendor/autoload.php';  use GreenApi\RestApi\GreenApiClient;  define( "ID_INSTANCE", "1101712345" ); define( "API_TOKEN_INSTANCE", "d75b3a66374942c5b3c019c698abc2067e151558acbd412345" );  $greenApi = new GreenApiClient( ID_INSTANCE, API_TOKEN_INSTANCE );  $result = $greenApi->sending->uploadFile(     'C:\Games\PicFromDisk.png' );  print_r(  $result->data );`

### Пример кода с использованием методов uploadFile + sendFileByUrl[#](#request-example-body-uploadFile-sendFileByUrl "Permanent link")

PHP

`<?php // Need to use SDK https://github.com/green-api/whatsapp-api-client-php require './vendor/autoload.php';  use GreenApi\RestApi\GreenApiClient;  define( "ID_INSTANCE", "1101123456" ); define( "API_TOKEN_INSTANCE", "d75b3a66374942c5b3c019c698abc2067e151558acbd412345" );  $greenApi = new GreenApiClient( ID_INSTANCE, API_TOKEN_INSTANCE, 'http://127.0.0.1:8080' );  $result = $greenApi->sending->uploadFile(     'C:\Games\PicFromDisk.png' );  print_r(  $result->data );  $result = $greenApi->sending->sendFileByUrl(     '79876543210@c.us',     $result->data->urlFile,     'googlelogo_color_272x92dp.png',     'Google logo' );  print_r(  $result->data );`

[

Назад Отправить видео, аудио, изображение, документ по URL



](../SendFileByUrl/)[

Вперед Отправить геолокацию

](../SendLocation/)

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

