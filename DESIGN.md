# Design

## Direction

**Briefing** — a compact, editorial operations dashboard. The interface reads like a daily briefing: a strong date and headline, a horizontal pulse of business numbers, then two asymmetric columns that separate "what needs attention today" from "how the business is doing". It is a tool, not a marketing dashboard.

The visual identity is **Precision UI**: cool gray surfaces, amber as the single action/attention accent, IBM Plex Sans for language and IBM Plex Mono for numbers, 1px rules instead of shadows, and a 4px spacing base.

## Principles

1. **Density with air.** 40px rows and 32px section gaps keep a lot on screen without turning into a spreadsheet.
2. **Rules, not boxes.** Sections are separated by 1px rules and whitespace. Cards are reserved for things that behave like objects (kanban deals, form surfaces), not every content block.
3. **Numbers are typographic.** Large monetary values and counts use IBM Plex Mono with tabular figures; labels stay small and quiet.
4. **Color has a job.** Amber means action or attention. Green means won/healthy. Red means lost/risk. Slate is neutral. No decorative color.
5. **Keyboard first.** `Ctrl/Cmd+K` opens the command palette; focus is always visible; actions have predictable names.

## Tokens

| Token | Value |
|---|---|
| Font sans | IBM Plex Sans |
| Font mono | IBM Plex Mono |
| Spacing base | 4px |
| Spacing scale | 4, 8, 12, 16, 24, 32, 48 |
| Section gap | 32px |
| Card padding | 16px |
| Table row | 40px |
| Control height | 32px |
| Radius | 4px |
| Border | 1px solid |
| Shadow | none |
| Content max width | 1440px |
| Grid | 12 columns, 24px gutter desktop / 16px tablet |
| Rail | 56px |
| Body | 14/20 |
| Table | 13/16 |
| Label | 12/16 |
| H1 | 32/40 |
| H2 | 24/32 |
| Display number | 38–44px mono |

### Color

Light:

- Background `#F4F6F8`
- Surface `#FFFFFF`
- Surface 2 `#EEF1F5`
- Line `#D9DEE6`
- Ink `#171B22`
- Ink 2 `#3D4653`
- Muted `#66707E`
- Faint `#8A94A3`
- Accent `#C88A14`
- Accent strong `#A66D05`
- Accent soft `#F6E7C2`
- Success `#1D7A4F`
- Danger `#B42318`
- Info `#2F5D8A`

Dark:

- Background `#0E1116`
- Surface `#141920`
- Line `#28313C`
- Ink `#E9EDF2`
- Muted `#9AA4B2`
- Accent `#E0A526`
- Success `#4EC58D`
- Danger `#F97066`
- Info `#7DB4E8`

## Layout

```
┌────┬──────────────────────────────────────────────────────────────┐
│rail│ date · headline · actions                                    │
│    │ ───────────────────────────────────────────────────────────  │
│    │ pulse: pipeline | won | lost | win rate                      │
│    │ ───────────────────────────────────────────────────────────  │
│    │ today / activity                  │ cash / pipeline / health │
│    │                                   │                          │
│    │ won vs lost (full width)                                     │
│    │ top open deals (full width)                                  │
└────┴──────────────────────────────────────────────────────────────┘
```

- Rail is persistent, 56px, icon-only with tooltips.
- `Ctrl/Cmd+K` is always available.
- The dashboard uses a 7/5 asymmetric split at ≥1100px; it stacks below that.
- Section heading is 16/22, sentence case, with a 10px metadata count on the right.

## Components

- **Button**: primary amber with dark ink; secondary surface with 1px border; ghost text; icon button 32×32.
- **Input/Select**: 32px height, 1px border, 4px radius; label above; error text below and red border.
- **Badge**: 20px height, 3px radius, subtle surface; no all-caps.
- **Section**: top rule, heading row, content. No outer card.
- **Metric strip**: horizontal 4-column band with vertical rules, not four cards.
- **Data table**: 40px rows, 1px row rules, sentence-case headers, right-aligned numeric columns.
- **Drawer**: side panel for quick detail/edit; full page for the primary entity.
- **Command palette**: overlay with search, grouped actions, keyboard navigation, `Esc` to close.
- **Empty state**: direct sentence + one action; no illustration.
- **Skeleton**: quiet pulse block; respects reduced motion.

## Motion

- 120–180ms ease-out for hover/focus.
- No page-load choreography.
- Drawer and palette enter with a short opacity/translate transition.
- `prefers-reduced-motion` removes non-essential motion.

## Content voice

- Portuguese, direct, sentence case.
- Actions say what happens: "Salvar alterações", "Criar negócio", "Marcar como concluída".
- Empty states explain the next step.
- Errors say what happened and how to fix it; they do not apologize.
- Currency `R$`, dates `dd/mm`, time `HH:mm`.

## Accessibility

- WCAG AA contrast.
- Visible focus ring using the amber focus token.
- All icon-only buttons have `aria-label` and a tooltip.
- Keyboard order follows visual order.
- Tables have headers; charts have text summaries or accessible labels.
- Minimum 32px control target on desktop; 44px on touch.
