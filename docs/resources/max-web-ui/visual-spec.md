# MAX Web UI — visual specification (sampled from real screenshots)

Source of truth: `screenshots/image1.png` (main messenger, desktop web), `snimok_ekrana…png` + `image4.png` (login, web), `image6.png` (conversation with voice messages, web), `image3.jpg` (mobile app — design-language confirmation only).

Everything below was read from those screenshots (approximate hex values sampled visually). Use as the styling contract for PLAN §5 implementation; keep PLAN §5 for scope decisions and this file for the visual tokens.

## Layout (desktop web)

```
┌──┬──────────────┬──────────────────────────────────────────┐
│  │ Чаты         [search]                                  │
│rail  [stories]  │  header: ‹ avatar Name                   │
│  │  [chat rows] │          subtitle          🔍             │
│ic│  …           │                                          │
│on│  …           │        wallpaper + bubbles               │
│s │              │                                          │
│  │              │  ┌ composer pill ─────────────────┐      │
└──┴──────────────┴──────────────────────────────────────────┘
   ~76px         ~420px            flexible
```

1. **Icon rail (far left, ~76px, white)** — vertical nav, each item = icon + tiny caption + blue unread badge: `Все` (chats, active), `Личные`, `Новые`, `Каналы`, `Контакты`, `Звонки`, bottom-pinned `Настройки`. Active item = dark/black icon+label; inactive = gray. Our scope reduces the rail to: `Все`, `Контакты`, `Настройки` (bottom) — keep the structure/labels, drop messengers-only sections.
2. **Chat list pane (~420px, white)**:
   - Header row: `Чаты` (bold ~26-28px, black) + **round solid-blue FAB** (44px, white `+`) pinned right.
   - Stories row (avatar rings with gradient borders + name below) — **out of scope** (not part of the required chat prototype; leaving a clean gap is acceptable).
   - Search: light-gray **pill** (`#F0F1F3`-ish, radius-full), placeholder `Найти`.
   - Service cards row (Сферум/Дневник/Сервисы lavender cards) — **out of scope**.
   - Chat rows (~84-100px): circular avatar (photo, or **initials on saturated gradient circle** — blue/green/orange/violet variety); line 1: bold black name + right-aligned meta: `✓✓`-or-nothing + time (`14:13`, `9 авг.`) + muted pin 📌 if pinned; line 2: preview, gray, up to 2 lines ellipsized, sender prefix for groups (`Анастасия Ц: …`, `Вы: …` for own), small blue channel pill (`Все`/channel-name chip) when preview came from a channel; unread count = **solid blue circle badge** (white number) right side; inline blue action button possible (GigaChat `Открыть` style) — not needed in our scope.
3. **Conversation pane (fills the rest)**:
   - **Wallpaper: light-blue doodle pattern — THE signature MAX trait.** Base gradient `#7FB6F0 → #9CC7F2` (subtle green tints at edges in some states), overlaid with a repeating line-art pattern of space doodles (rockets, planets, moons, stars, satellites, aliens, constellations) in `#5C97D8` at low opacity. Implementation: hand-authored SVG tile, `background-repeat`, NOT a plain gray surface.
   - **Header floats on the wallpaper** (no solid bar): back chevron `‹`, avatar, bold name (~17px, black), gray subtitle (member count / status), search icon far right.
   - **Date divider**: small white pill centered on wallpaper, gray text (`Вчера`).
   - **Incoming bubble**: solid white, radius ~18px, no tail, black text ~16px, time `HH:mm` gray inside bottom-right; sender avatar (small circle) sits left of bubble when needed.
   - **Outgoing bubble: pale translucent mint/sage** (`#DFF3E9`-family, ~70-80% opacity over wallpaper), right-aligned; same radius; **read ticks: blue `✓✓` next to time** bottom-right (blue when read; gray/darker when delivered — exact delivered-gray not visible in screenshots, choose darker gray, document).
   - Media bubbles keep wallpaper behind (no fill), time overlaid on media.
   - **Composer: floating white pill** (radius-full, soft shadow, ~16px margin from edges): paperclip icon left inside, placeholder `Сообщение` gray, emoji + mic icons right inside; **mic swaps to send when text is non-empty** (no persistent send button). Enter sends.

## Login / connect card (maps to our ConnectPage)

Full-viewport wallpaper → centered **white card** (radius ~28-32px, soft shadow, generous padding): globe icon top-left, `?` top-right; MAX logo (gradient violet-blue mark + `мах` wordmark) — we use our own app logo; bold heading; gray subtitle; light-gray rounded input (radius ~16px) with prefix; **primary button: vivid blue, fully rounded (pill), white text**; helper gray text; footer link in blue. Two stacked buttons variant: primary blue pill + secondary light-gray pill (from mobile sheet, same language).

## Color tokens (sampled, approximate)

| Token | Value | Notes |
|---|---|---|
| `accent` (primary) | `#1D7DF2`–`#2D8CF0` | FAB, unread badges, play buttons, links, primary buttons, blue `✓✓` read ticks. **Blue, not purple.** |
| `wallpaper.base` | `#7FB6F0 → #9CC7F2` gradient | light blue |
| `wallpaper.pattern` | `#5C97D8` @ ~18-25% | space doodles line-art |
| `bubble.in` | `#FFFFFF` | solid |
| `bubble.out` | `#DFF3E9` @ ~75% | translucent mint over wallpaper |
| `surface` (panes, rails, composer) | `#FFFFFF` | |
| `surface.muted` (search, inputs, secondary buttons) | `#F0F1F3` | |
| `text.primary` | `#0F0F0F` | |
| `text.secondary` | `#808591` | |
| `badge.count` | accent blue, white text, circle | |
| avatar gradients | blue/green/orange/violet sets | initials fallback |

Font: system stack (`-apple-system, Segoe UI, Roboto, Inter, sans-serif`). Density: airy — generous paddings (16-20px rows), large radii everywhere (pills for controls, 16-20px bubbles/cards). Theme: light only in screenshots; build dark-ready via tokens but ship light (minimal scope).

## Explicitly NOT MAX Web (do not copy)

- WhatsApp-style gray flat background in conversations (MAX has wallpaper).
- Green bubbles / Telegram gradient bubbles (MAX: white / translucent mint).
- Purple `#6641FF` accent (my earlier plan guess — wrong; MAX UI accents are blue; violet exists only in the logo gradient).
- Left icon rail with hamburger/sidebars (MAX: labeled icon rail), top app bars with solid backgrounds (MAX: floating header on wallpaper).
