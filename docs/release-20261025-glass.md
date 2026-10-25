# Прозрачные устройства и лёгкое стекло, 25 октября 2026

Владелец явно попросил сразу публиковать изменения после проверки, без отдельного локального согласования.

## Изменения

- Редактирование существующего изображения через встроенный ImageGen: удалена серая подложка, восстановлена правая сторона ноутбука. Оба устройства видны полностью. Это статичная иллюстрация, а не WebGL или встроенная реальная CRM.
- Исходный готовый PNG: `../materials/mentori-devices-cutout-full-20261025.png`. Публичный оптимизированный WebP: `assets/services/mentori-devices-cutout-v3.webp`, 1536×1024, RGBA, 157 548 байт. Проверены настоящая прозрачность и отсутствие непрозрачных пикселей на границе файла.
- Изображение используется на главной, в каталоге, на странице автоматизации и её связанных обложках. Заголовок первого экрана про Excel сохранён; неутверждённый прототип не опубликован.
- Общий слой скругления и стеклянных поверхностей в `site-polish.css`; отдельный лёгкий контроллер появления в `site-polish.js`. Анимируются только transform и opacity, один раз при появлении. Заголовки и содержимое первого экрана не скрываются ради анимации. Нет нового постоянного обработчика прокрутки, WebGL и анимации фильтров.
- Меню и шапка сохранены. Для небольших закреплённых элементов используется умеренное размытие; для мобильных боковых панелей отключено. Большие накладывающиеся карточки не становятся прозрачными: прежняя проблема наложения текста не возвращается.

## Проверки

`npm run check` включает SEO, общие страницы, контакты, стек карточек, футер и отдельные проверки эффектов. CSS/JS нового слоя менее 6 КБ до сжатия. При reduced motion и без IntersectionObserver скрытых элементов нет. Повторная сборка стабильна.

Локальный стенд `tools/responsive-lab.html` содержит четыре живых страницы в iframe с реальными CSS-размерами мобильных экранов. Он не имитирует движок iOS и не является проверкой физического iPhone. Локальные миллисекунды на стенде не называются оценкой скорости публичного сайта или Lighthouse.

Итог прогона: 30 страниц × 4 мобильных размера = 120 проверок, без горизонтального переполнения и неоткрывшихся изображений. Дополнительно на публичном сервере проверены 7 ключевых страниц на 320×740, 768×1024 и 1440×900: 21 проверка, без замечаний. Вживую проверены открытие/закрытие меню, раскрытие FAQ и переключение галереи на корзину. В видимой области после прокрутки нет оставшихся скрытыми элементов `polish-pending`.

После публикации `tools/check-live-seo.mjs`: все 30 страниц HTTP 200 и совпадают с локальной сборкой, 45 ресурсов доступны, 31 редирект корректен. Ошибок нет. CSV семантики, протоколы и снимки экранов остаются в `../reports/seo-implementation-20261025/`. Основная аналитика, SEO-метаданные и адреса страниц не менялись из-за оформления.

Резервная копия перед новым оформлением: `/root/backups/mentorios-site-before-glass-20261025-1.tar.gz`. Ресурсы публикуются перед HTML. Стенд, приватные протоколы, исходные PNG и отвергнутые изображения не выгружаются. DNS, TLS, Nginx и Google Search Console не меняются.

## Финальный промпт изображения

Режим: встроенный ImageGen, редактирование, прозрачный фон. Целевой файл: первый результат удаления фона, затем точечное исправление края.

> Use case: background-extraction plus precise-object-edit/outpainting. Edit the supplied MacBook and iPhone image for website compositing. TWO REQUIRED corrections: (1) the MacBook's RIGHT CORNER/base is cut off by the image's right boundary. Extend/reconstruct the missing natural right-hand silver metal corner and right edge of the base so the ENTIRE laptop is visible, then frame BOTH devices with at least 4% empty transparent padding on EVERY side. Show the complete laptop and complete phone, nothing touching or extending beyond the canvas edges. (2) Remove ALL remaining gray/black studio backdrop and floor: the pixels around and between the devices must be FULLY TRANSPARENT, not gray haze, not opaque black, not a gradient, not checkerboard. Transparent background is the central requirement. No smoke/shadow cloud. Only a very tight tiny contact shadow directly under the device edges if necessary. Preserve the existing black/orange Mentori Russian CRM screens, keyboard, metal material, relative phone/laptop positions, proportions and camera angle. Do not redesign the software, no new lettering, no watermark, no surrounding panel. This should be a clean isolated product PNG cutout of the entire laptop and phone, suitable for laying on any website color.
