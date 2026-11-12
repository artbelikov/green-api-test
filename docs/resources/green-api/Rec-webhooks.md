# GREEN-API: Rec-webhooks

> Source: https://green-api.com/docs/api/recommendations/working-with-incomming-webhooks/
> Saved: 2026-11-12

Редактировать страницу")

# Работа с вебхуками и уведомлениями[#](#_1 "Permanent link")

Получение входящих данных в GREEN-API реализовано через входящие уведомления. Есть 2 способа получать уведомления [HTTP API](../../receiving/technology-http-api/) и [Webhook Endpoint](../../receiving/technology-webhook-endpoint/).

Ниже приведены рекомендации по работе с вебхуками и уведомлениями:

1.  [Получение входящих уведомлений](#001)
2.  [Обработка входящих уведомлений](#002)
3.  [Безопасность при получении уведомлений](#003)
4.  [Логирование и обработка ошибок](#004)
5.  [Масштабирование и распределение нагрузки](#005)

## 1\. Получение входящих уведомлений[#](#001 "Permanent link")

### Работа через HTTP API[#](#http-api "Permanent link")

При работе через методы HTTP API требуется вызывать последовательно 2 метода API:

1.  Вызываем метод [receiveNotification](../../receiving/technology-http-api/ReceiveNotification/) в зависимости от наличия сообщений, настроек метода и настроек инстанса в ответе Вы получите объект с номером и объектом уведомления.
    
    > Если уведомлений в очереди нет, в ответе придет null.
    
2.  После получения уведомления необходимо обработать входящее уведомление обработчиком и удалить уведомление методом deleteNotification передав номер этого уведомления.
    
    > Если метод завершился статус кодом 500 и более требуется повторить запрос метода.
    

### Работа через Webhook Endpoint[#](#webhook-endpoint "Permanent link")

При работе через методы Webhook Endpoint требуется настроить веб-сервер, способный принимать HTTP запросы.

Веб-сервер должен:

1.  Принять входящий [POST запрос](../../receiving/technology-webhook-endpoint/#debug-incoming-webhooks) (вебхук)
    
2.  Обработать принятое уведомление
    
3.  Вернуть ответ с кодом состояния 200 (после получения от сервера статус кода 200 уведомление будет удалено из очереди).
    
    > Время ожидания ответа от Вашего веб-сервера составляет 180 секунд, если сервер не отдаст статус код 200, сервер GREEN-API сделает паузу в 60 секунд и повторит отправку текущего уведомления.
    

## 2\. Обработка входящих уведомлений[#](#002 "Permanent link")

Все типы и форматы уведомлений указаны в [документации](../../receiving/notifications-format/).

Рекомендуется сделать обработку входящих уведомлений согласно инструкции ниже:

1.  После получения уведомления сервисом обработчика, желательно проверить схему уведомления (JSONSchema).
    
    > Не рекомендуется делать проверку схемы на дополнительные поля, так как API может расширятся добавляя новые функции и информацию.  
    > Если Вы получили уведомление в котором отсутствует поле или его формат не верный, требуется зафиксировать такое уведомление в системе логирования и проинформировать оператора указав данное уведомление, это поможет зафиксировать и разобраться в ошибке в будущем.
    
2.  Сервис обработчика должен найти обязательное поле `typeWebhook` и в зависимости от его типа обработать или сбросить уведомление.
    
3.  После обработки уведомления обработчик должен отдать статус код 200.
    
    > Так все не обрабатываемые вам уведомления будут удаляться из очереди и последующие уведомления будут приходить корректно.  
    > Если Вы не используете некоторые типы уведомлений, то рекомендуем делать сброс не нужных уведомлений, отдавая статус код 200, так Вы исключите ошибки обработчика и при выходе нового функционала у Вас не возникнет проблем в работе интеграции.
    

Пример простого веб-сервера от GREEN-API:

*   [Python](https://github.com/green-api/whatsapp-api-webhook-server-python/blob/master/examples/echo.py) с инструкцией по [установке](../../../sdk/python/pythonWebhookServer/).
    
*   [Golang](https://github.com/green-api/whatsapp-api-webhook-server-golang/blob/master/examples/main.go) с инструкцией по [установке](../../../sdk/golang/server/launch/).
    
*   [NodeJS](https://github.com/green-api/whatsapp-api-client-js/blob/master/examples/ReceiveWebhook.js) с инструкцией по [установке](../../../sdk/nodejs/client/receiveNotificationserver/).
    

## 3\. Безопасность при получении уведомлений[#](#003 "Permanent link")

При проектировании сервиса необходимо уделить внимание безопасности.

При работе с технологией [HTTP API](../../receiving/technology-http-api/) Ваш IP адрес закрыт и не доступен другим пользователем интернета, данная технология хороша работает в небольших системах с малым объемом данных.

При работе с технологией [Webhook Endpoint](../../receiving/technology-webhook-endpoint/) Ваш IP адрес доступен другим пользователем, требуется исключить вредоносные воздействия на Вашу систему извне.

Рекомендации по безопасности при использовании технологии Webhook Endpoint:

1.  Настройте сетевой экран (Firewall), разрешите доступ к серверу только с требуемых Вам IP адресов.
    
2.  Ограничение доступа только с определённых IP адресов. Вы можете настроить Ваш веб-сервер таким образом, чтобы он принимал входящие запросы только с [IP адресов GREEN-API](../../receiving/technology-webhook-endpoint/#ip-_1).
    
3.  Использовать токен авторизации при отправке уведомлений. Укажите токен авторизации в поле `webhookUrlToken` через [личный кабинет](https://console.green-api.com/instanceList) или методом установки настроек [setSettings](../../account/SetSettings/).
    

Пример кода фильтрации IP адресов на python

`from flask import Flask, request  from datetime import datetime import json  app = Flask(**name**)  # Список IP-адресов GREEN-API  ALLOWED_IPS = [    "51.250.84.44",    "51.250.94.65",    "51.250.89.177",    "64.226.125.75",    "158.160.49.84",    "46.101.109.139",    "51.250.95.149",    "51.250.12.167",    "209.38.202.24"]  # Функция для проверки разрешенных IP-адресов  def check_ip(): client_ip = request.remote_addr if client_ip not in ALLOWED_IPS: return False return True  @app.before_request def before_request(): if not check_ip(): return "Access Denied", 403  # Остальной код вашего приложения...  if **name** == "**main**": app.run()`

## 4\. Логирование и обработка ошибок[#](#004 "Permanent link")

Рекомендуется настроить систему логирования:

1.  Используете многоуровневую настраиваемую систему логирования. Логируйте проблемы схемы на уровне ERROR, новые типы уведомлений на уровне WARN, необрабатываемые типы сообщений на уровне DEBUG и работу системы на уровне INFO. Включая нужный уровень логирования, Вы сможете отлаживать работу системы и определять все проблемы, связанные с интеграцией.
    
2.  Рекомендуется сообщать оператору о неизвестных типах уведомлений и об ошибках уведомлений, это позволит максимально быстро локализовать проблему и даст больше информации оператору, не пропустив еще неподдерживаемые типы уведомлений интеграцией.
    

> Обязательно логируйте данные по уведомлениям, в записи должна содержаться информация включая дату и время получения - `timestamp`, тип уведомления - `typeWebhook` и остальные данные уведомления. Это позволит вам проводить анализ работы, при неожиданных сценариях работы системы.

## 5\. Масштабирование и распределение нагрузки[#](#005 "Permanent link")

При увеличении размера системы Вы можете столкнуться с проблемой масштабирования. Рекомендуется масштабировать систему, распределяя нагрузку на несколько микросервисов обработчиков. Для этого можно использовать балансировщик нагрузки.

В качестве примера балансировщика приведем веб-сервер nginx, Вы можете использовать несколько экземпляров вашего сервера и распределять нагрузку между ними, используя nginx.

[Nginx](https://www.nginx.com/) - это высокопроизводительный веб-сервер, который также может использоваться в качестве балансировщика нагрузки (процесс равномерного распределения веб-трафика между несколькими серверами), предотвращая перегрузку одного сервера. Nginx применяет различные алгоритмы для оптимального распределения трафика и может быть настроен для обеспечения надежности системы при выходе из строя одного или нескольких серверов.

Воспользуйтесь одним из приведённых способов, чтобы развернуть несколько экземпляров сервера:

#### Ручное развертывание на разных серверах или виртуальных машинах:[#](#_2 "Permanent link")

*   Создайте или арендуйте несколько физических серверов, виртуальных машин или контейнеров.
*   Настройте каждый сервер так, чтобы он содержал копию вашего приложения.

#### Использование контейнеризации с Docker:[#](#docker "Permanent link")

*   Создайте Docker-образ вашего приложения.
*   Запустите несколько контейнеров с этим образом на одном или нескольких хост-машинах.

#### Использование облачных провайдеров:[#](#_3 "Permanent link")

*   Разверните несколько экземпляров вашего сервера на платформе облачных провайдеров, таких как Amazon Web Services (AWS), Google Cloud Platform (GCP) или Microsoft Azure.
*   Используйте инструменты управления облачной инфраструктурой для автоматизации развертывания и масштабирования серверов.

Пример файла конфигурации nginx для балансировщика нагрузки

`http {    upstream app{       server 10.2.0.100;       server 10.2.0.101;       server 10.2.0.102;    }     // Этот сервер принимает весь трафик на порт 80 и передает его вышестоящему потоку.    // Обратите внимание, что имя вышестоящего потока и proxy_pass должны совпадать.     server {       listen 80;        server_name mydomain.com;        location / {          include proxy_params;           proxy_pass http://app;           proxy_redirect off;          proxy_http_version 1.1;          proxy_set_header Upgrade $http_upgrade;          proxy_set_header Connection "upgrade";       }    } }`

[

Назад Использование хостов GREEN-API



](../using-green-api-hosts/)[

Вперед Отслеживание состояние инстанса

](../instance-status-tracking/)

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

