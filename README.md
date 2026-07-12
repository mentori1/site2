# Mentra — сайт разработки индивидуальных CRM

Многостраничный сайт **Mentra** — индивидуальная разработка CRM и дополнительные решения для продаж.
Чистый стек без сборки: **HTML + CSS + ванильный JS**, плюс GSAP/Lenis/Vanta с CDN.
Эстетика: warm black (`#0a0a0a`) + оранжевый (`#ff5e1a` / `#ffa940`), шрифты Fraunces + Geist + Geist Mono.

> Дата основания бренда: **10 декабря 2023**. Основатель — Данила Родионов.
> Контакты: Telegram **@Mento_ri**, почта **hello@mentra.tech**.

---

## Как запустить / посмотреть

Сборки нет — это статика. Любой статический сервер из папки проекта:

```bash
cd /Users/mentori/mentra-site
python3 -m http.server 4321
# открыть http://localhost:4321
```

Можно и просто открыть `index.html` в браузере (но Vanta/шрифты с CDN требуют интернет).

---

## Страницы

| Файл | Назначение |
|------|------------|
| `index.html` | Главная: позиционирование → возможности CRM → этапы разработки → контакты |
| `services.html` | Что делаем |
| `about.html` | О компании / основатель |
| `contact.html` | Контакты |

Общие ресурсы: `styles.css` (один файл на все страницы), `main.js` (вся логика), `assets/` (фото и графика сайта).

---

## Тема (светлая / тёмная)

Сайт поддерживает обе темы:

- **По умолчанию** следует системной теме устройства (`prefers-color-scheme`).
- **Ручной тумблер** (☀️/🌙) в шапке на каждой странице — выбор сохраняется в `localStorage` (ключ `mentra-theme`) и побеждает системную тему.
- Реализация: атрибут `data-theme="light|dark"` на `<html>`, ставится inline-скриптом в `<head>` **до отрисовки** (без мигания). Тёмная — база (`:root`), светлая — оверрайды под `[data-theme="light"]` в самом низу `styles.css`.
- Vanta-фон в hero перекрашивается под тему на лету (`main.js` → `window.__skinVanta`).

---

## Дизайн-токены (в `:root` в начале `styles.css`)

```
--bg-base #0a0a0a · --bg-elevated #111110 · --bg-surface #161614
--accent #ff5e1a · --accent-amber #ffa940 · --accent-deep #c7440f
--text-primary #fafaf7 · success #6ade8e · danger #ff8074
шрифты: --font-display Fraunces · --font-sans Geist · --font-mono Geist Mono
```

Утилиты/паттерны: glass-карточки, `data-reveal` (появление по скроллу), `data-magnetic` (магнитные кнопки),
`data-tilt` (наклон 3D), sticky-стек (4 сценария), cinema-pinned сцены, hero-ротатор заголовков.

---

## ⚠️ Версии ассетов (важно при правках)

Подключения в HTML версионированы: `styles.css?v=N` и `main.js?v=N`.
**При каждом изменении `styles.css` или `main.js` поднимай номер версии во всех 8 HTML** —
тогда браузеры подтянут свежие файлы без жёсткой перезагрузки (Cmd+Shift+R). Текущая версия: **v=28**.

Быстрый бамп по всем страницам:
```bash
cd /Users/mentori/mentra-site
OLD=28; NEW=29
sed -i '' "s/styles.css?v=$OLD/styles.css?v=$NEW/; s/main.js?v=$OLD/main.js?v=$NEW/" *.html
```

---

## Бэкапы

История правок хранилась локально в папках `backup-vN/` (проект **не** под git).
Самый свежий полный бэкап перед изменениями — это последняя по номеру папка `backup-vNN/`
(+ `backup-v27-pages/` — снапшот вторичных страниц перед добавлением тумблера темы).

Откат, например:
```bash
cp backup-v26/{index.html,styles.css,main.js} .
cp backup-v27-pages/*.html .
```

---

## Адаптив / QA

Проверено в браузере на desktop (1440) и mobile (375/390), обе темы:
горизонтального overflow нет, touch-таргеты ≥44px, тарифная колода на мобайле = одна карточка
на всю ширину с навигацией стрелками, светлая тема покрывает все внутренние элементы.
Применён baseline-полиш: `text-wrap: balance/pretty`, `tabular-nums`, `100dvh`, `safe-area-inset`.
