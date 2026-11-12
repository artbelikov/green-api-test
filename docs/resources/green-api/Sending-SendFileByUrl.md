# GREEN-API: Sending-SendFileByUrl

> Source: https://green-api.com/docs/api/sending/SendFileByUrl/
> Saved: 2026-11-12

Редактировать страницу")

# SendFileByUrl[#](#sendfilebyurl "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/sendFileByUrl) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/r4gj4v6/send-video-audio-image-document-via-url) [![Apidog](../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE-%D0%B0%D1%83%D0%B4%D0%B8%D0%BE-%D0%B8%D0%B7%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B4%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82-%D0%BF%D0%BE-url-12124703e0)

Метод предназначен для отправки файла, загружаемого по ссылке. Сообщение будет добавлено в очередь на отправку. Сообщение на отправку хранится 24 часа в очереди и будет отправлено сразу же после авторизации телефона. Скорость отправки сообщений из очереди регулирует параметр [Интервал отправки сообщений](../../send-messages-delay/).

Для формирования ссылки на файл, вы можете воспользоваться [сервисами внешнего хранения файлов](../../../faq/how-to-send-file-by-sendFileByUrl-method-using-external-storage/).  
Мы рекомендуем использовать наше внешнее хранилище файлов с помощью метода [UploadFile](../UploadFile/).

Файлы видео, аудио и изображений отправляются, как и в родном WhatsApp\* с возможностью просмотра и прослушки.  
Документы отправляются так же как в родном WhatsApp\*.  
Тип отправляемого файла и способ его отправки определяется по расширению файла. Описание добавляется только к изображениям и видео.

Файлы

Максимальный размер отправляемых файлов равен 100 Мбайт.

Отправка нескольких файлов одним запросом невозможна. 1 файл отправляется только 1 сообщением. Возможность отправки нескольких файлов одновременно формируется только на стороне приложения WhatsApp\*.

Ограничений на разрешения изображений нет. Однако при отправке изображений через API с разрешением свыше 3000х3000 пикселей, превью не формируется.

[Список файловых форматов](../../../faq/types-of-extensions-supported-by-API/), которые успешно отправляются и принимаются через API

## Запрос[#](#request "Permanent link")

Для отправки файла требуется выполнить запрос по адресу:

POST

`{{apiUrl}}/waInstance{{idInstance}}/sendFileByUrl/{{apiTokenInstance}}`

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

`urlFile`

**string**

Да

Ссылка на отправляемый файл

`fileName`

**string**

Да

Название файла. Должно содержать расширение файла. Требуется использовать кодировку UTF-8 без BOM. Например: `test.jpg`

`caption`

**string**

Нет

Описание под файлом. Описание добавляется к видео, изображениям, документам, файлам. Максимальная длина поля 1024 символов

`quotedMessageId`

**string**

Нет

Идентификатор цитируемого сообщения. При заполнении параметра сообщение отправится с цитированием указанного сообщения чата.  
Цитирование сообщения возможно только _из того же чата_, в который производится отправка.  
Для отправки сообщений из другого чата используется метод [ForwardMessages](../ForwardMessages/)

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

*   Рекомендации по формату ссылок
    
    1.  В ссылке могут быть использованы символы a-z, A-Z, 0-9, - (дефис), \_ (нижнее подчеркивание)
    2.  В ссылке должны отсутствовать спец символы ~$€%#£?! и пробелы
    3.  Кодировка символов ссылки UTF-8 без BOM
    4.  Требуется передавать не кодированные ссылки (система сама кодирует ссылку)
    5.  Требуется чтобы ссылка указывала на конкретный файл, а не на html страницу [примеры ссылок](../../../faq/how-to-send-file-by-sendFileByUrl-method-using-external-storage/)
    6.  Требуется использовать быстрое хранилище, без ограничения на количество запросов файлов
*   Поле fileName
    
    Требуется обязательно указывать поле fileName с верным расширением файла.
    
    Определение типа файла системой:
    
    1.  По расширению указанного в названии файла, в поле fileName
    2.  Если поле fileName не содержит расширения, то тип файла получаем по Content-Type из заголовка ссылки
    3.  Если в заголовке поле Content-Type отсутствует или содержит несуществующий тип файла, система постарается определить тип файла по байтам файла
    4.  Если система не сможет определить тип файла, то произойдет отправка с типом по умолчанию (бинарный файл)

Время на отправку файла

Отправка файлов происходит в несколько этапов:

1.  Получение файла
2.  Выгрузка файла на сервер WhatsApp\*
3.  Запрос на отправку файла в WhatsApp\*

Время на отправку файла зависит от размера файла, скорости получения файла и обработки файла WhatsApp\*. В зависимости от данных факторов время на отправку файла может меняться от 1 до 20 секунд.

Цитирование сообщений

Для корректной работы с механизмом цитирования сообщений система должна знать о сообщении, которое будет процитировано. Убедится о том что сообщение доступно к цитированию можно запросив метод журналирования [getMessage](../../journals/GetMessage/), если сообщение отсутствует в системе, то цитировать такое сообщение невозможно.

*   Для цитирования **входящих сообщений** необходимо включить настройку `Получать уведомления о входящих сообщениях и файлах`.
    
*   Для цитирования **исходящих сообщений** отправленных с телефона, включите настройку `Получать уведомления о сообщениях, отправленных с телефона`.  
    Так сообщения будут попадать в систему и их можно будет цитировать.
    

Установку настроек можно сделать методом [SetSettings](../../account/SetSettings/) или через [личный кабинет](https://console.green-api.com/).

### Пример тела запроса[#](#request-example-body "Permanent link")

Отправка сообщения в личный чат:

`{     "chatId": "79876543210@c.us",     "urlFile": "https://my.site.com/img/horse.png",     "fileName": "horse.png",     "caption": "Лошадка" }`

Отправка сообщения в групповой чат:

`{     "chatId": "120363043968066561@g.us",     "urlFile": "https://my.site.com/img/horse.png",     "fileName": "horse.png",     "caption": "Лошадка" }`

Отправка сообщения с цитированием:

`{     "chatId": "79876543210@с.us",     "urlFile": "https://my.site.com/img/horse.png",     "fileName": "horse.png",     "caption": "Лошадка",     "quotedMessageId": "361B0E63F2FDF95903B6A9C9A102F34B" }`

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

### Ошибки SendFileByUrl[#](#errors "Permanent link")

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
`Details: url has incorrect format. It should start with http(s)://'`

Некорректная ссылка

500

`request entity too large`

Превышение допустимой длины Json (>100кб)

500

`Internal Server Error`

Превышение допустимой длины поля `caption`

Отправка с неверным идентификатором цитируемого сообщения

В случае некорректного указания `quotedMessageId`, система вернёт код 200 и id отправляемого сообщения, но оно не будет доставлено получателю.

Отправка в группу, в которой отправка разрешена только администраторам

При отправке сообщения в группу, в которой отправка разрешена только администраторам, если участник не является администратором, сообщение будет удалено из очереди и не будет отправлено.  
По сообщению будет получен вебхук со статусом `failed` и описанием [`"description": "Error: forbidden"`](../../receiving/notifications-format/outgoing-message/OutgoingMessageStatus/#admin)

## Примеры кода[#](#request-example "Permanent link")

PythoncURLJava - SpringJava - UnirestVBA

`import requests  url = "{{apiUrl}}/waInstance{{idInstance}}/sendFileByUrl/{{apiTokenInstance}}"  payload = { "chatId": "79876543210@c.us",  "urlFile": "https://avatars.mds.yandex.net/get-pdb/477388/77f64197-87d2-42cf-9305-14f49c65f1da/s375",  "fileName": "horse.png",  "caption": "лошадка" } headers = {     'Content-Type': 'application/json' }  response = requests.post(url, json=payload)  print(response.text.encode('utf8'))`

`curl --location '{{apiUrl}}/waInstance{{idInstance}}/sendFileByUrl/{{apiTokenInstance}}' \ --header 'Content-Type: application/json' \ --data-raw '{     "chatId": "12345678910@c.us",     "urlFile": "https://avatars.mds.yandex.net/get-pdb/477388/77f64197-87d2-42cf-9305-14f49c65f1da/s375",     "fileName": "horse.png",     "caption": "лошадка" }'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/sendFileByUrl/")     .append({{apiTokenInstance}});  var headers = new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);  var jsonBody = "{\r\n   \t\"chatId\": \"79876543210@c.us\",\r\n\t\"urlFile\": \"https://avatars.mds.yandex.net/get-pdb/477388/77f64197-87d2-42cf-9305-14f49c65f1da/s375\",\r\n\t\"fileName\": \"horse.png\",\r\n\t\"caption\": \"little horse\"\r\n}";  var requestEntity = new HttpEntity<>(jsonBody, headers);  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.POST, requestEntity, String.class); System.out.println(response);`

`var requestUrl = new StringBuilder(); requestUrl     .append({{apiUrl}})     .append("/waInstance").append({{idInstance}})     .append("/sendFileByUrl/")     .append({{apiTokenInstance}});  var response = Unirest.post(requestUrl.toString())     .header("Content-Type", "application/json")     .body("{\r\n   \t\"chatId\": \"79876543210@c.us\",\r\n\t\"urlFile\": \"https://avatars.mds.yandex.net/get-pdb/477388/77f64197-87d2-42cf-9305-14f49c65f1da/s375\",\r\n\t\"fileName\": \"horse.png\",\r\n\t\"caption\": \"little horse\"\r\n}")     .asString();  System.out.println(response);`

`Sub SendFileByUrl()     Dim url As String     Dim RequestBody As String     Dim http As Object     Dim response As String      ' The apiUrl, idInstance and apiTokenInstance values are available in console, double brackets must be removed     url = "{{apiUrl}}/waInstance{{idInstance}}/SendFileByUrl/{{apiTokenInstance}}"      ' chatId is the number to send the message (@c.us for private chats, @g.us for group chats), urlFile - url link, fileName - file name with extension, caption - title     RequestBody = "{""chatId"":""71234567890@c.us"",""urlFile"":""https://my.site.com/img/horse.png"",""fileName"":""horse.png"",""caption"":""Лошадка""}"      Set http = CreateObject("MSXML2.XMLHTTP")      With http         .Open "POST", url, False         .setRequestHeader "Content-Type", "application/json"         .Send RequestBody     End With      response = http.responseText      Debug.Print response      ' Outputting the answer to the desired cell     ' Range("A1").Value = response      Set http = Nothing End Sub`  

[

Назад Отправить видео, аудио, изображение, документ



](../SendFileByUpload/)[

Вперед Выгрузить файл

](../UploadFile/)

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

