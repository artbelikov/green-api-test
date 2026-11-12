# GREEN-API v3 (MAX): v3-common-errors

> Source: https://green-api.com/v3/docs/api/common-errors/
> Saved: 2026-11-12

Редактировать страницу")

# Стандартные ошибки[#](#_1 "Permanent link")

## HTTP Ошибки[#](#http "Permanent link")

Код HTTP

Идентификатор ошибки

Описание

204

`No Content`

Использован метод запроса `OPTIONS`, измените метод запроса на `GET`

400

`instance in starting process try later`

Инстанс находится в процессе запуска/перезапуска. Попробуйте повторить попытку спустя несколько секунд

400

`instance is starting or not authorized`

Инстанс не авторизован. Для авторизации инстанса перейдите в [личный кабинет](https://console.green-api.com)

400

`Instance account is expired. Renew your instance from personal area`

Срок действия инстанса истек. Продлите свой инстанс из [личного кабинета](https://console.green-api.com)

400

`bad request data`

Данные запроса не валидны. Исправьте ошибку в параметрах запроса и повторите попытку

400

`Instance is deleted`

Инстанс был удалён

400

`Bad Request`  
`Validation failed`

Ошибка валидации, подробнее в [таблице](./#400-validation-failed)

400

`Validation failed. Details: 'chatId' is required`

Обязательный параметр `chatId` идентификатор чата не указан.

400

`Unexpected token _ in JSON at position ХХ`

Ошибка в структуре JSON

401

`Unauthorized`

Проблема с авторизацией, проверьте корректность указания `apiTokenInstance`, `partnerToken`

403

`Forbidden`

Проблема с аутентификацией, проверьте корректность указания `idInstance` и адрес запроса

404

`Not Found`

Некорректный метод запроса

499

`Client Closed Request`

Пользователь закрыл соединение, пока сервер обрабатывал запрос. Требуется увеличить время ожидания ответа от сервера и повторить запрос с задержкой. Если ошибка повториться, то информировать оператора и дать возможность повторить отправку

500

`File from url exceeded max upload size. Size: XXXXmb Limit: 100mb Url:`

Попытка отправки файла размером более 100 МБайт

500

`request entity too large`

Превышение допустимой длины json (>100кб)

502

`Bad Gateway`

Сервер не способен получить ответ от целевого сервера. Требуется 3 раза повторить запрос с задержкой. Если ошибка повторится, то информировать оператора и дать возможность повторить отправку

## Ошибки валидации (400: Validation failed)[#](#400-validation-failed "Permanent link")

Идентификатор ошибки

Описание

`'chatId' must be one of the next formats: 'phone_number@c.us' or 'chatId'`

Неверный формат поля `chatId`, поле указывается в формате `phone_number@c.us` либо `chatId`

`'wrongFieldName' is not allowed`

Недопустимое поле в теле запроса

`'{{field}}' is not allowed`

Недопустимое поле в теле запроса

`'{{field}}' is required`

Отсутствует обязательное поле в теле запроса

`'{{field}}' is not allowed to be empty`

Обязательное поле не может быть пустым

`'XXX' must be a string`

Неверный тип данных поля `XXX` - поле должно быть типа `string`. Поля данного типа: `message`, `idMessage`,`chatId`, `participantChatId`, `options[X].optionName`, `urlFile`

`'XXX' must be a boolean`

Неверный тип данных поля `XXX` - поле должно быть типа `boolean`. Поля данного типа: `multipleAnswers`

`'XXX' must be an array`

Неверный тип данных поля `XXX` - поле должно быть типа `array`. Поля данного типа: `chatIds`, `options`, `messages`

[

Назад Рекомендации по отправке сообщений



](../send-messages-recommendations/)[

Вперед Достижение лимитов на тарифе Разработчик

](../466-error-example-body/)

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

