# GREEN-API v3 (MAX): v3-important-differences

> Source: https://green-api.com/v3/docs/important-differences/
> Saved: 2026-11-12

Редактировать страницу")

# Важные отличия версии v3[#](#v3 "Permanent link")

Версия v3 разработана на базе текущей версии GREEN-API. Архитектура и логика взаимодействия с API осталась прежней, однако имеется ряд отличий ввиду особенностей работы мессенджера MAX. Ниже представлены основные отличия версии v3.

### Содержание[#](#TOC "Permanent link")

*   [Адресная строка вызова методов](#address-line)
*   [Способ авторизации инстанса](#authorization)
*   [Отправка сообщений](#send-messages)
*   [Идентификатор чата](#chatid)
*   [Отказ от использования префиксов `@c.us` и `@g.us`](#disable-prefix)
*   [Тип мессенджера в вебхуке](#typeinstance)
*   [Неограниченное количество клиентов MAX](#unlimeted-clients)
*   [Партнерские методы](#partners-methods)
*   [Прочее](#etc)

## Адресная строка вызова методов[#](#address-line "Permanent link")

Все методы можно вызывать без префикса `v3`. Для вашего удобства методы можно вызывать одинаково для API мессенджеров WhatsApp, Telegram и MAX. Например:

`{{apiUrl}}/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}`  

Для совместимости с прошлыми версиями API мессенджера MAX можно выполнять вызовы всех методов с префиксом `/v3/`

`{{apiUrl}}/v3/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}`  

## Способ авторизации инстанса[#](#authorization "Permanent link")

Процесс авторизации стал проще:

*   Требуется лишь отсканировать QR-код

Внимание!

В настоящее время для авторизации по QR-коду необходимо отключить пароль для входа в мессенджере MAX.

Авторизация инстанса происходит путём сканирования QR-кода:

*   Вы можете вызвать метод [QR](../api/account/QR/) для получения QR-кода авторизации.
*   Можете получить [QR-код в личном кабинете](../before-start/#authorization) вашего инстанса.
*   Либо получить [QR-код в браузере](../api/account/QR/#request-example-qr)

## Отправка сообщений[#](#send-messages "Permanent link")

Для отправки сообщений используется [Идентификатор чата](../api/chat-id/).

*   Если Идентификатор чата известен, то используйте его в методах отправки сообщений [SendMessage](../api/sending/SendMessage/) и др.
*   Если Идентификатор чата неизвестен, то сначала используйте метод [CheckAccount](../api/service/CheckAccount/), получите значение `chatId`, и далее используйте `chatId` в методах отправки сообщений [SendMessage](../api/sending/SendMessage/) и др.

Отправка по номеру телефона

Для поддержки обратной совместимости с предыдущими версиями интерфейса допускается указывать номер телефона клиента в формате `phoneNumber@c.us` в качестве идентификатора чата в методе отправки сообщений [SendMessage](../api/sending/SendMessage/) и др.

Допускается использовать только номера телефонов для **РФ** и **РБ** с кодами стран `7` и `375` соответственно.

Пример идентификатора чата для РФ: `chatId` = `79991234567@c.us`  
Пример идентификатора чата для РБ: `chatId` = `375291234567@c.us`

## Идентификатор чата[#](#chatid "Permanent link")

Идентификатор чата представлен **строкой** для обратной совместимости. Однако, рекомендуется выполнять преобразование из строки в число для более компактного хранения в базе данных.

Число может быть как положительным (для индивидуальных чатов), так и отрицательным (для групповых чатов).  
Максимальная длина значения для групповых чатов составляет 16 символов.

> Длина идентификатора чата может увеличиться со временем.

## Отказ от использования префиксов `@c.us` и `@g.us`[#](#disable-prefix "Permanent link")

Во всех [методах отправки сообщений](../api/sending/), а также [методах работы с журналами](../api/journals/) и в [вебхуках](../api/receiving/notifications-format/) префиксы `@c.us` и `@g.us` в [Идентификаторе чата](../api/chat-id/) больше не используются.

Однако для обратной совместимости допускается указывать префикс `@c.us` при [отправке сообщений по номеру телефона](../api/chat-id/#send-by-phone).

## Тип мессенджера в вебхуке[#](#typeinstance "Permanent link")

Для определения типа мессенджера, от которого пришел вебхук, можно анализировать [свойство вебхука](../api/receiving/notifications-format/incoming-message/Webhook-IncomingMessageReceived/) `instanceData.typeInstance`.

*   Для мессенджера MAX: `"typeInstance": "v3"`
*   Для мессенджера WhatsApp: `"typeInstance": "whatsapp"`
*   Для мессенджера Telegram: `"typeInstance": "telegram"`

Также можно настроить методом [SetSettings](../api/account/SetSettings/) получение вебхуков на разные `webhookUrl` для разделения потоков обработки вебхуков от разных мессенджеров.

## Неограниченное количество клиентов MAX[#](#unlimeted-clients "Permanent link")

Мессенджер MAX поддерживает подключение неограниченного количества веб-клиентов и мобильных приложений к одному номеру телефона.

Благодаря этому можно создать несколько инстансов и подключить несколько клиентов MAX к GREEN-API - по одному к каждому инстансу.

> Например, один клиент может обслуживать чаты менеджеров, а второй клиент может обслуживать чат-бота на сайте и все с одного номера телефона.

## Партнерские методы[#](#partners-methods "Permanent link")

Партнерские методы не изменились и не требуют доработки.  
Полное описание всех партнерских методов можно найти в разделе [Партнерские методы](../partners/).

## Прочее[#](#etc "Permanent link")

Некоторые методы могут возвращать набор параметров, специфичный для мессенджера MAX .  
Полное описание всех методов и параметров можно найти в [Документации API мессенджера MAX](../api/)

[

Назад Тарифы



](../about-tariffs/)[

Вперед Выполнение запросов

](../request-format/)

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

