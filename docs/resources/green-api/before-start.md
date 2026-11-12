# GREEN-API: before-start

> Source: https://green-api.com/docs/before-start/
> Saved: 2026-11-12

Редактировать страницу")

# Перед началом работы[#](#_1 "Permanent link")

Перед началом работы с GREEN-API требуется выполнить следующие шаги:

1.  [Установить мобильное приложение WhatsApp](#mobile)
2.  [Регистрация в Личном кабинете](#cabinet)
3.  [Создание и авторизация инстанса](#instance)
4.  [Получение параметров доступа к инстансу](#parameters)
5.  [Настройка получения входящих данных](#receiving)

Регистрация нового номера в WhatsApp\*

Если Вы используете новый номер, на котором ранее не использовался WhatsApp, то рекомендуем ознакомиться со статьей [Как защитить номер от бана?](../faq/how-to-protect-number-from-ban/)

## Видеоинструкция[#](#_2 "Permanent link")

YouTubeRuTube

* * *

## 1\. Установить мобильное приложение WhatsApp[#](#mobile "Permanent link")

Отправка и получение сообщений WhatsApp выполняется с вашего мобильного телефона. На телефоне должно быть установлено официальное мобильное приложение [WhatsApp](https://www.whatsapp.com/) или [WhatsApp Business](https://www.whatsapp.com/business/).

Выбор приложения

Выбор приложения [WhatsApp](https://www.whatsapp.com/) или [WhatsApp Business](https://www.whatsapp.com/business/) не влияет на вероятность блокировки аккаунта.

> Рекомендуется заказать услугу **Хостинг трубки**. В этом случае наличие личного мобильного телефона не требуется. Отправка и получение сообщений WhatsApp будет выполняться с мобильного телефона, расположенного в дата-центре GREEN-API.

## 2\. Регистрация в Личном кабинете[#](#cabinet "Permanent link")

Для использования нашего сервиса перейдите в [Личный кабинет](https://console.green-api.com/registration) и зарегистрируйтесь. Порядок регистрации:

1.  Введите электронную почту.
    
    > Рекомендуем использовать корпоративную почту, для предотвращения потери доступа к учетной записи, при увольнении сотрудника.
    
2.  Выберите страну.
    
3.  Приняв пользовательское соглашение, нажмите на кнопку `Зарегистрироваться`.
4.  На Ваш адрес электронной почты будет направлено письмо. Введите код, указанный в письме, для подтверждения вашей учетной записи.
    
    > Рекомендуем проверять помимо общих входящих сообщений папку `Спам`, так как письмо может оказаться там.
    

![register](../assets/before-start/register.png)

![code](../assets/before-start/code.png)

## 3\. Создание и авторизация инстанса[#](#instance "Permanent link")

### Создание инстанса[#](#_3 "Permanent link")

**Инстанс** - это уникальный номер шлюза для отправки и получения сообщении через WhatsApp.

Инстанс создается в [личном кабинете](https://console.green-api.com/instanceList) и используется для организации HTTP API WhatsApp.

> Один инстанс может одновременно обслуживать только один номер телефона (один аккаунт WhatsApp). В одной учетной записи можно создать несколько инстансов.

Порядок создания инстанса:

1.  В [личном кабинете](https://console.green-api.com/instanceList) нажмите на кнопку `Создать инстанс`.
2.  Выберите тарифный план
3.  Если требуется, выберите способ оплаты и проведите оплату.
4.  Перейдите в список инстансов, нажав на кнопку `Инстансы` в боковом меню. В списке можете увидеть созданный вами инстанс.
    
    > Переход инстанса в рабочее состояние после создания может занимать до 2-х минут. Формирование QR кода возможно через 2 минуты после создания инстанса.
    

![create](../assets/before-start/create-instance.png)

* * *

### Авторизация инстанса[#](#qr "Permanent link")

Для работы с GREEN-API требуется авторизовать инстанс. Авторизация инстанса выполняется в [Личном кабинете](https://console.green-api.com) путем считывания QR-кода из мобильного приложения [WhatsApp Business](https://www.whatsapp.com/business/) или [WhatsApp](https://www.whatsapp.com/).

Порядок авторизации инстанса:

1.  Откройте на своем мобильном телефоне приложение [WhatsApp Business](https://www.whatsapp.com/business/) или [WhatsApp](https://www.whatsapp.com/). На устройстве перейдите в раздел `Привязка устройства`, для этого:
    
    *   На Android нажмите на `3 точки` -> `Связанные устройства` -> `Привязка устройства`
    *   На iPhone перейдите в `Настройки` -> `Связанные устройства` -> `Привязка устройства`
2.  Перейдите в [личный кабинет](https://console.green-api.com/instanceList). Выберите нужный вам инстанс.
    
3.  Нажмите на кнопку `Получить QR`. Отсканируйте QR код.

![get-gr-button](../assets/before-start/get-gr-button.png)

Подробнее читайте в нашей статье ["Как выполнить привязку устройства?"](../faq/how-to-set-up-device-pairing/).  
Также рекомендуем ознакомится со статьей ["Почему не получается связать устройство с API?"](../faq/why-cant-I-connect-the-device-to-the-API/).

> Отправка и получение сообщений выполняется с вашего мобильного телефона. Поэтому телефон должен быть всегда заряжен и подключен к сети Интернет.

## 4\. Получить параметры доступа к инстансу[#](#parameters "Permanent link")

Для выполнения запросов HTTP API WhatsApp требуется использовать параметры доступа к инстансу. Параметры доступа публикуются в [личном кабинете](https://console.green-api.com):

*   `apiUrl` - ссылка на хост API
*   `mediaUrl` - ссылка на хост API для отправки файлов
*   `idInstance` - уникальный номер инстанса
*   `apiTokenInstance` - ключ доступа инстанса

![parameters](../assets/before-start/parameters.png)

Ключ доступа инстанса можно сменить при необходимости, например, в случае его компрометации. Сменить токен можно в [личном кабинете](https://console.green-api.com) самостоятельно или обратившись в [техподдержку](https://wa.me/77780739095).

## 5\. Настроить получение входящих данных[#](#receiving "Permanent link")

Если требуется получать входящие данные (входящие сообщения, статусы ранее отправленных сообщений и др.), то предварительно необходимо выполнить [настройку инстанса](../api/receiving/).

Получать входящие уведомления можно:

*   [через HTTP API](../api/receiving/technology-http-api/)
*   [через Webhook Endpoint](../api/receiving/technology-webhook-endpoint/).

## Готово![#](#_4 "Permanent link")

Всё готово для начала отправки и получения сообщений WhatsApp!

Для отладки запросов к GREEN-API рекомендуется использовать [раздел API в личном кабинете](https://console.green-api.com/app/api/) или [Коллекцию Postman](../postman-collection/). Для упрощения написания интеграции Вы можете воспользоваться готовыми библиотеками в [разделе SDK](../sdk/).

[

Назад Оглавление



](..)[

Вперед Тарифы

](../about-tariffs/)

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

