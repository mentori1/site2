# Перенос в Mentoritech

Дата: 10 октября 2026. По запросу владельца единая локальная папка: `/Users/mentori/Mentoritech`.

Перемещены:

- `/tmp/mentorios-site-20261010` → `site`, включая Git, зависимости и все неопубликованные изменения.
- Прежний `mentori-hero-prototype` из папки визуализаций → `archive/mentori-hero-prototype`.
- Резервная Git-история → `backups/mentorios-service-catalog-20261010.bundle`.
- Пять исходных PNG иллюстраций → `materials/generated-originals`.
- Референс приложения Авито → `materials/avito-reference.jpg`.
- Журнал предпросмотра → `logs/preview.log`.

Материалы общего проекта Авито скопированы в `materials/avito-reference`, без его старого ZIP-архива. Общие оригиналы не удалялись. Новый iPhone сохранён туда же, в `materials/generated-originals`.

Перед перемещением сверены SHA-256 всех 2964 файлов и символических ссылок рабочего каталога, включая Git и зависимости. После перемещения содержимое совпало. Манифест на момент переноса: `../backups/move-verification-20261010.json`. Последующие правки сайта закономерно отличаются от этого исторического манифеста.

Предпросмотр перезапущен из `site`: http://127.0.0.1:4323/services возвращает HTTP 200. `npm run dev` теперь использует этот порт.

## Проверка папки CRM

В `/Users/mentori/mentori-crm` проверены `tests`, `tmp`, `reports`, `output`, `outputs`, `assets` и локальные инструкции. Файлов с привязкой к mentorios.tech / mentori1/site2 не найдено. Корневая папка `tests` относится к рабочей CRM.

`assets/website/main-site` относится к **другому** сайту, `mentori.tech`, что подтверждается `PROJECT_MAP.md` и его ссылками. `client-cabinet-demo.html` и юридические документы этого сайта используются тестами CRM. Поэтому эти файлы не удалены и не перемещены. Рабочая CRM, её код, данные и тесты не изменялись.

Сервер, DNS, сертификаты, GitHub main и публичный сайт переносом не затронуты.
