# GREEN-API: Sending-SendFileByUpload

> Source: https://green-api.com/docs/api/sending/SendFileByUpload/
> Saved: 2026-11-12

Редактировать страницу")

# SendFileByUpload[#](#sendfilebyupload "Permanent link")

[![Test](../../../assets/test.svg)](https://console.green-api.com/app/api/sendFileByUpload) [![Postman](../../../assets/postman.svg)](https://www.postman.com/green-api-2991/green-api/request/f40zdob/send-video-audio-image-document) [![Apidog](../../../assets/apidog.svg)](https://uovbvc3jgi.apidog.io/%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE-%D0%B0%D1%83%D0%B4%D0%B8%D0%BE-%D0%B8%D0%B7%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B4%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82-12124702e0)

> **Для метода SendFileByUpload рекомендуется использовать хост media.green-api.com**

Метод предназначен для отправки файла, загружаемого через форму (form-data). Сообщение будет добавлено в очередь на отправку, в ответе Вы получите ссылку на загруженный файл. Скорость отправки сообщений из очереди регулирует параметр [Интервал отправки сообщений](../../send-messages-delay/).

Файлы видео, аудио и изображений отправляются, как и в родном WhatsApp\* с возможностью просмотра и прослушки. Документы отправляются так же как в родном WhatsApp\*. Тип отправляемого файла и способ его отправки определяется по расширению файла. Описание добавляется только к изображениям и видео.

Файлы

Максимальный размер отправляемых файлов равен 100 Мбайт.

Отправка нескольких файлов одним запросом невозможна. 1 файл отправляется только 1 сообщением. Возможность отправки нескольких файлов одновременно формируется только на стороне приложения WhatsApp\*.

Ограничений на разрешения изображений нет. Однако при отправке изображений через API с разрешением свыше 3000х3000 пикселей, превью не формируется.

[Список файловых форматов](../../../faq/types-of-extensions-supported-by-API/), которые успешно отправляются и принимаются через API

> Срок действия ссылки 15 дней.
> 
> Ссылку можно использовать повторно методом [SendFileByUrl](../SendFileByUrl/).

## Запрос[#](#request "Permanent link")

Для отправки файла требуется выполнить запрос по адресу:

POST

`{{mediaUrl}}/waInstance{{idInstance}}/sendFileByUpload/{{apiTokenInstance}}`

Для получения параметров запроса `mediaUrl`, `idInstance` и `apiTokenInstance` обратитесь к разделу [Перед началом работы](../../../before-start/#parameters).

### Параметры запроса[#](#request-parameters "Permanent link")

Параметр

Тип

Обязательный

Описание

`chatId`

**string**

Да

[Идентификатор чата](../../chat-id/)

`file`

**file**

Да

Отправляемый файл

`fileName`

**string**

Нет

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

## Ответ[#](#response "Permanent link")

### Поля ответа[#](#response-parameters "Permanent link")

Поле

Тип

Описание

`idMessage`

**string**

Идентификатор отправленного сообщения

`urlFile`

**string**

Ссылка на файл (срок действия ссылки 15 дней)

> ["Как получить информацию о сроке хранения файла в хранилище GREEN-API?"](../../../faq/link-lifetime/)

### Пример тела ответа[#](#response-example-body "Permanent link")

`{     "idMessage": "3EB0C767D097B7C7C030",     "urlFile": "https://sw-media-out.storage.yandexcloud.net/1101776123/c1aabd48-c1c2-49b1-8f2d-f575a41777be.jpg" }`

### Ошибки SendFileByUpload[#](#errors "Permanent link")

Перечень общих для всех методов ошибок смотрите в разделе [Стандартные ошибки](../../common-errors/)

Код HTTP

Идентификатор ошибки

Описание

200

`failed to upload file`

Превышение 100кб в теле запроса

400

`failed to upload file`

Отсутствует поле `chatId` / Присутствует лишнее поле / Указан некорректный `messageId` для цитаты / Отсутствует файл / Неверный тип поля / Используются не form-data / Некорректный номер

400

`Bad Request`  
`Validation failed`

[Ошибка валидации](../../common-errors/#400-validation-failed)

400

`file should not be empty`

Пользователь отправил пустой файл. Загружаемый файл не должен быть пустым.

413

`request entity too large`

Превышение допустимого размера файла (~99.9mb)  
Возникает при отправке файлов в обработке 1С (версия 8.3.22.1923). Возможное решение: Сменить версию 1С

500

`Internal Server Error`  
`failed to upload file`

Отсутствует поле `file`

500

`Internal Server Error`

Указан неверный метод для запроса. Укажите метод `POST` и повторите отправку

500

`Internal Server Error`

Превышение допустимой длины поля `caption`

Отправка с неверным идентификатором цитируемого сообщения

В случае некорректного указания `quotedMessageId`, система вернёт код 200 и id отправляемого сообщения, но оно не будет доставлено получателю.

### Пример тела запроса[#](#request-example-body "Permanent link")

Примеры кода

PythoncURLJava - SpringJava - UnirestDelphi

`import requests  url = "{{mediaUrl}}/waInstance{{idInstance}}/sendFileByUpload/{{apiTokenInstance}}"  payload = {'chatId': '79876543210@c.us', 'caption': 'Описание'} files = [   ('file', ('window.jpg', open('C:/window.jpg','rb'),'image/jpeg')) ] headers= {}  response = requests.post(url, data=payload, files=files)  print(response.text.encode('utf8'))`

`curl --location '{{mediaUrl}}/waInstance{{idInstance}}/sendFileByUpload/{{apiTokenInstance}}' \ --form 'chatId="12345678910@c.us"' \ --form 'file=@"/Users/you/files/file.jpeg"' \ --form 'fileName="file.jpg"'`

`var restTemplate = new RestTemplate(); var requestUrl = new StringBuilder(); requestUrl     .append({{mediaUrl}})     .append("/waInstance").append({{idInstance}})     .append("/sendFileByUpload/")     .append({{apiTokenInstance}});  var headers = new HttpHeaders(); headers.setContentType(MediaType.MULTIPART_FORM_DATA);  var form = new LinkedMultiValueMap<>();     form.add("chatId", "12345678910@c.us");     form.add("file", new FileSystemResource(new File("/Users/you/files/file.jpeg")));     form.add("fileName", file.jpg);     form.add("caption", "Описание");     form.add("quotedMessageId", "BAE5F4886F6F2D05");  var requestEntity = new HttpEntity<>(form, headers);  var response = restTemplate.exchange(requestUrl.toString(), HttpMethod.POST, requestEntity, String.class); System.out.println(response);`

`var file = new File("/Users/user/Desktop/fileExample.jpeg"); var requestUrl = new StringBuilder(); requestUrl     .append({{mediaUrl}})     .append("/waInstance").append({{idInstance}})     .append("/sendFileByUpload/")     .append({{apiTokenInstance}});  var form = new HashMap<String, Object>();     form.put("chatId", dto.getChatId());     form.put("file", dto.getFile());     form.put("fileName", dto.getFileName());     form.put("caption", dto.getCaption());     form.put("quotedMessageId", dto.getQuotedMessageId());  var response = Unirest.post(requestUrl.toString())     .fields(form)     .asString();  System.out.println(response);`

`program sendFileByUpload;  {$APPTYPE CONSOLE}  uses   System.SysUtils,   System.Classes, System.Net.HttpClient, System.Net.Mime, System.Net.URLClient, System.Net.HttpClientComponent;  var   HttpClient: TNetHTTPClient;   Response: IHTTPResponse;   FormData: TMultipartFormData;   EndpointURL, MEDIA_URL, ID_INSTANCE, API_TOKEN_INSTANCE: string;  begin   MEDIA_URL := 'https://media.green-api.com';   ID_INSTANCE := '110100001';   API_TOKEN_INSTANCE := 'd75b3a66374942c5b3c019c698abc2067e151558acbd451234';    EndpointURL := MEDIA_URL +'/waInstance' + ID_INSTANCE + '/sendFileByUpload/' + API_TOKEN_INSTANCE;    HttpClient := TNetHTTPClient.Create(nil);    FormData := TMultipartFormData.Create();   FormData.AddField('chatId', '71234567890@c.us');   FormData.AddField('caption', 'test');   FormData.AddFile('file', 'C:\tmp\bp.png');    try     Response := HTTPClient.Post(EndpointURL, FormData, nil);      if Response.StatusCode = 200 then       Writeln('[Response]: ' + Response.ContentAsString)     else       Writeln('[ERROR ' + IntToStr(Response.StatusCode) + ']:' + Response.StatusText + '' + Response.ContentAsString);      readln;   except     on E: Exception do       Writeln(E.ClassName, ': ', E.Message);   end;    HttpClient.Free;   FormData.Free;  end.`

[

Назад Отправить опрос



](../SendPoll/)[

Вперед Отправить видео, аудио, изображение, документ по URL

](../SendFileByUrl/)

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

