# Clay · design2: new flows

Phone-first mocks (412px, Pixel 7 viewport) for six new flows. Each HTML page is a
storyboard: a dark caption strip (`1A`, `1B`, ...) followed by one phone frame per state.
Everything reuses the existing Clay tokens from `E/mock-group.html`; nothing new was added
to the palette except one chart-bar tone (see the chart spec).

| File | Flow |
|---|---|
| `home.html` | 1. Home with account totals, people across tablets, multi-currency |
| `charts.html` | 2. Spending charts (account + per tablet), edge states, table view |
| `add-member.html` | 3. Add a name with username search |
| `leave.html` | 4. Leaving a tablet (settled, unsettled, last member, what others see) |
| `expense-detail.html` | 5. Read-only expense breakdown + "How we got this" |
| `edge-states.html` | 6. Only-me tablet; expense involving someone who left |

## Key decisions

1. **Currencies are never added together.** Totals are per currency. The home card shows one
   currency at a time (currency chips: `₹ INR`, `¥ JPY`; the one with the largest absolute
   net is selected by default), and a dashed footer line names every other currency's net
   ("Also ¥4,200 owed to you in yen. Kept separate, never converted."). A person row lists
   one line per currency. With one currency, the chips are hidden.
2. **Totals are computed from per-person nets, not gross entries.** "You owe" = sum of
   people you net-owe; "Owed to you" = sum of people who net-owe you; big number = the
   difference, coloured and *worded* (`owed to you, net` / `you owe overall` / `all square`).
   Per-person nets use pairwise balances, so they can differ from what Hammurabi's shortcut
   tells you to pay inside a tablet. 1B says "Settling happens inside each tablet" so the
   person screen never pretends to be a payment instruction. **Engineering must confirm the
   pairwise-vs-simplified source; if the app only stores simplified debts, use those.**
3. **Charts show my share, not what I paid; settle-up payments are excluded.** A bar chart
   is the right form (discrete periods, comparison; `charts.csv` row 2). The account chart's
   big readout above the plot is the "tooltip": tapping a bar updates it (aria-live). The
   compact tablet chart is too small for a readout, so it uses a dark bubble anchored inside
   the selected column (edge-aware: flips to left/right anchor for the first/last 3 bars).
4. **Leaving is gated by balance, not by a warning.** Unsettled = blocked sheet that lists
   exactly what you owe and has one primary "Settle up ₹5,800". Settled = a simple confirm.
   Last member = destructive dialog that names what is lost (tablet + N entries) and offers
   "Export ledger" first. Others see an Archive event and a dashed "Left" avatar.
5. **Read before edit.** Tapping an expense opens a read-only breakdown (who paid, each
   share, net effect with `+`/`−` signs that sum to ₹0); Edit is a secondary button. Entries
   involving someone who left are locked, with the reason and the way forward (a new
   correcting entry) right there, not behind a toast.

## Tokens (unchanged from the existing app)

bg `#F5EFE4` · surface `#FFFDF8` · sunk `#EDE4D5` · line `#E3D8C6` · ink `#221C15` ·
ink2 `#62554A` · ink3 `#6F6055` · clay `#A94A24` (primary) · clay-soft `#F4E3D7` ·
lapis `#1E4C8A` (links, secondary, focus) · lapis-soft `#E3EAF4` · owed `#2E6B3C` ·
owe `#A33224` · **new: bar `#5B79A3`** (unselected chart bars, 4.4:1 on surface, passes the
3:1 data contrast rule). Fraunces for display/headings/hero amounts, Inter for everything
else; all money uses `font-variant-numeric: tabular-nums`.

Radii 20 (cards) / 14 (buttons, fields) / 24 (sheets, dialogs). Spacing on a 4/8 grid:
16 page gutter, 12 between cards, 20 between sections, 12/16 row padding.

## Component specs

| Component | Size | States / notes |
|---|---|---|
| Button | h 48, r 14, 15/600 Inter, icon 18 | primary (clay), secondary (lapis-soft), quiet (sunk), danger (owe), danger-quiet (text). Pressed: scale .98 + darker fill, 120ms. Disabled: sunk bg, `#9A8B7C` text, `aria-disabled`, reason in visible helper text linked by `aria-describedby`. |
| Icon button | 44×44, r 14, surface + shadow | always has `aria-label`. |
| List row | min-h 56, padding 12/16, 1px line divider | title 15/600, sub 13/400 ink2, value right-aligned with a word label above (`you owe`, `owes you`). Whole row is the link; chevron 18. |
| Totals card | padding 16 | currency chips h 36; hero 34px Fraunces in owe/owed/ink2 with a worded suffix; two 50/50 tiles (owe, owed) with counts; dashed footer for other currencies. |
| Person row | as list row, avatar 36 | tablet chips (12/500, sunk, r 8, wrap, never truncate); one value line per currency. |
| Spending entry card | row with 120×36 mini-bars | last 12 months, current month clay. Whole card links to the chart. |
| Segmented control | h 44 (38 buttons + 3 inset), r 12 | `aria-pressed` on each button. |
| Sheet | top r 24, grabber 40×5, padding 8/20 | close button 44 (sunk circle); scrim `rgba(34,28,21,.5)`; `role=dialog`, `aria-modal`. Swipe-down and the X both dismiss. |
| Dialog | inset 20, r 24, padding 22/20/16 | 48px icon badge (ok green / warn red), 24px Fraunces title, stacked full-width buttons, primary/destructive first, escape last. `role=alertdialog`. |
| Search field | h 52, r 14, 1.5px line border; focus = lapis border + 3px lapis ring | label above (not placeholder-only), helper below, clear (×) 44px appears once there is text. |
| Search result | min-h 60 | avatar 36, name 16/500, `@user · context` 13; trailing "Add" (h 36 inside a 60px row target) / "Added" ✓ pill / "Already on this tablet" pill (row `aria-disabled`, avatar 60% opacity). Match highlighted bold + clay underline (not colour alone). |
| Breakdown table | 4-col grid: avatar · name+share · Paid · Effect | effect is signed (`+₹9,000` / `−₹3,000`) and coloured; a note explains the signs and that they sum to ₹0. |
| Equation card | dashed-rule lines with `+`/`−` operator column, 2px ink rule before total | total line coloured and worded (`−₹5,800 · you owe`). |
| Locked chip | pill with lock icon, 12/600 | used on expenses with a departed member. |
| Former member avatar | white fill, 1.5px dashed ink3 border | always paired with a "Left" pill. |
| Toast | ink bg, r 14, above tab bar | `role=status`, Undo action 44px tall, 5s, doesn't take focus. |

## Chart spec

- **Form:** vertical bars, 12 periods, oldest left. Toggle `Week | Month` (week = Monday
  start; month = calendar). Account chart: my share across all tablets, one currency at a
  time (same chips as home). Tablet chart: whole-tablet spending (everyone's shares) in the
  tablet's currency.
- **Geometry:** account plot h 150, compact h 96; 12 equal columns filling the card width
  minus a 34px right gutter for y labels; bar width 62% of the column, max 20px, top radius 4.
  Each column is the tap target (full plot height × ~26px) plus `‹ ›` 44px steppers to move
  the selection, so precision is never needed.
- **Scale:** linear from 0, top = next "nice" value above the max (₹1k, 2k, 5k, 10k, 15k...).
  Gridlines: baseline solid `#CDBEA8`; 50% and 100% dashed `#E3D8C6`, labelled `₹7.5k`,
  `₹15k`, `₹1.5L` (Indian lakh notation). Compact chart labels only the top line.
- **Zero periods:** no bar; a 2px dotted ink3 line on the baseline. Legend says
  "Nothing spent", so zero reads as zero, not missing data.
- **One huge bar:** keep the linear scale (no broken axis, no log). Every non-zero bar gets
  a minimum visible height (2% of plot, ~3px) so small months don't vanish. The max bar
  gets a direct value label; the summary sentence names the outlier ("Sep: ₹1,20,000").
- **All zero / no data:** replace the plot with an empty state ("Nothing inscribed yet")
  and an "Inscribe expense" button, never an empty axis.
- **Selection (tap):** selected bar is clay, column gets a 6% clay wash, its x label goes
  clay + bold + underlined (so not colour-only), and the value is shown (account: big
  readout above the plot, `aria-live="polite"`; compact: dark bubble above the bar).
  Default selection = current period.
- **X axis:** months as `Jan…Dec` with the 2-digit year under the first label and at year
  change; weeks as the start day with the month under the first week of each month. 11px.
- **Accessibility:** each column is a `<button aria-pressed>` with label
  "Nov: ₹6,150" / "Jan: nothing spent"; chart group has an `aria-label`; a one-line summary
  under the chart (average, highest, count of empty periods); "See as table" opens the same
  data as a `<table>` (2D). Arrow keys move the selection. Entrance animation (bars grow
  200ms, stagger 30ms) is off under `prefers-reduced-motion`.

## Behaviour notes

- **Add a name keyboard:** the sheet opens to near full height with the field focused and
  the keyboard up; the sheet's bottom sits on the keyboard so results scroll between field
  and keyboard. `type=search`, `inputmode=search`, `enterkeyhint=search`,
  `autocapitalize=none`, `autocorrect/spellcheck off`. Results update on input with a 150ms
  debounce; under 2 characters only shared-tablet people show. Enter adds the highlighted
  result if exactly one is addable. Scrolling the list or tapping Add dismisses the keyboard
  (so the "Added" confirmation and Undo toast are visible). Search matches name and
  username, prefix first, then substring.
- **Leave:** entry point is the tablet's `⋯` menu, last item, separated and red. Balance
  check runs on the server at confirm time too, in case something changed while the dialog
  was open.
- **Only me:** Settle up is disabled (not hidden) with the reason visible under it; "Add a
  name" is promoted to primary.
- **Departed member:** their entries stay in the ledger and the breakdown; edit/delete are
  disabled with `aria-disabled` plus the explanation note and helper text.

## Copy

Clay voice for headings and labels; money sentences are always plain. "Plain" is the
fallback for a plain theme or if testing shows the metaphor confuses.

| Where | Clay voice | Plain |
|---|---|---|
| Home totals label | Across all your tablets, in rupees | Across all your groups, in rupees |
| Home net, positive | ₹750 owed to you, net | ₹750 owed to you, net |
| Home net, negative | ₹3,250 you owe overall | ₹3,250 you owe overall |
| Home net, zero | ₹0 all square | ₹0 settled up |
| Zero helper | Nobody owes anybody. The clay is dry. | Nobody owes anybody. |
| Tiles | You owe · to 2 people / Owed to you · from 2 people | same |
| Other currency | Also ¥4,200 owed to you in yen. Kept separate, never converted. | same |
| Spending entry | Your spending · Nov: ₹6,150 your share · Oct was ₹9,900 | same |
| People section | People · All 6 | same |
| Person row values | you owe ₹4,400 / owes you ₹2,600 / all square ₹0 | same |
| Person screen eyebrow | Shared ledger | Balances with |
| Person sub | @kabir · on 2 of your tablets | @kabir · in 2 of your groups |
| Person helper | Each currency is settled on its own. / Settling happens inside each tablet. | ...inside each group. |
| No people | No names yet · People appear here once you share a tablet with them. · Start a tablet | No people yet · ...once you share a group... · Create a group |
| Chart title | Your spending | Your spending |
| Chart sub | Your share across all tablets. Payments to settle up are not spending. | ...all groups... |
| Chart summary | 12-month average ₹4,980. Highest: May, ₹12,500. Two months with nothing spent. | same |
| Chart legend | Selected · Nothing spent | same |
| Tablet chart | Tablet spending · Whole tablet, all members. | Group spending · Whole group, all members. |
| Chart empty | Nothing inscribed yet · Your spending shows here after the first expense. Settle-up payments don't count. · Inscribe expense | No expenses yet · ... · Add expense |
| Table view | By month · Same data as the chart, readable by screen readers. · See as table | same |
| Add sheet title | Add a name | Add a member |
| Field label / placeholder | Search people on Clay / Name or @username | same |
| Helper | People you share tablets with show first. | People you share groups with show first. |
| Section headers | From your tablets / Others on Clay | From your groups / Others on Clay |
| Result context | in Flat 4B · no shared tablets · already here | in Flat 4B · no shared groups · already here |
| Member pill | Already on this tablet | Already in this group |
| Under 2 chars | Not here? Type at least 2 letters to search everyone. | same |
| No match | No one called "zubin" · Check the spelling, or ask them for their @username. Only people with a Clay account can be added. · Copy invite link | same |
| Added | Added · Arnav added to Goa Trip · Undo | same |
| Leave, settled | Leave Goa Trip? · You're all square here, so nothing is left hanging. The tablet and its history stay with Arjun, Meera and Kabir. You won't see it any more. · Leave tablet / Stay | ...The group and its history... · Leave group / Stay |
| Leave, blocked | Settle up before you leave · You still owe money on this tablet. Leaving now would leave the others short, so it's blocked until your balance is ₹0. · Settle up ₹5,800 / Not now | ...on this group... |
| Blocked, owed to you | If someone owes you, they settle with you first, or you can record that you forgave it. | same |
| Leave, last member | You're the last name here · If you leave, Old flat and all 12 entries are gone for good. No one else can see it, and it can't be brought back. · Want a record? Export the ledger first. · Export ledger (CSV) / Leave and erase tablet / Keep it | You're the last member · ... · Leave and delete group / Keep it |
| Archive event | Meera left Goa Trip · She was settled up. Her past entries stay. | same |
| Member tag | Left · Still shown on entries she was part of | same |
| Expense eyebrow | Inscription · 14 Nov 2026 | Expense · 14 Nov 2026 |
| Expense meta | Paid by Meera · split equally, 4 ways · added by Meera | same |
| Columns | Person · Paid · Effect | same |
| Sign note | + means the group owes them, − means they owe the group. Effects always add up to ₹0. | same |
| Your part | You owe Meera ₹3,000 for this | same |
| Breakdown | How we got this · Every entry you're part of, added up. | How this adds up |
| Equation lines | You paid · Your shares · Payments you sent · Payments you received · Your standing | same |
| Breakdown footer | Who you pay comes from Hammurabi's shortcut (simplify debts); the total stays ₹5,800. | Who you pay comes from Simplify debts; the total stays ₹5,800. |
| Solo balance | ₹0 just you here | same |
| Solo hint | Settling needs someone to settle with. Add a name first. | ...Add a member first. |
| Solo entries | Entries here are only yours until you add people. Splits start from the next one. | same |
| Locked chip | Locked | Locked |
| Locked note | Riya left Goa Trip on 18 Nov, settled up. Entries she's on can't be edited or deleted, because changing them would reopen a balance she can no longer settle. | same |
| Locked helper | Need a fix? Inscribe a new correcting entry between the people still here. | Need a fix? Add a new correcting expense... |

## Skill rules applied (ui-ux-pro-max)

- **Accessibility:** `color-contrast` (ink3 darkened to `#6F6055`, bar tone 4.4:1),
  `color-not-only` / `color-not-decorative-only` (every coloured amount has a word: "you owe",
  "owes you", signs `+`/`−`, "Left" pill, bold+underline for chart selection and search
  match), `aria-labels` + `icon-context` (icon buttons labelled, decorative icons
  `aria-hidden`), `focus-states` (3px lapis ring), `heading-hierarchy`.
- **Touch:** `touch-target-size` (44px minimum everywhere: icon buttons, steppers, clear,
  close, toast Undo), `touch-spacing`, `press-feedback` (scale .98 / darker fill),
  `no-precision-required` (bar columns full-height + steppers), `gesture-alternative`.
- **Forms:** `input-labels` (visible label, not placeholder-only), `input-helper-text`,
  `input-type-keyboard` (`inputmode=search`, `enterkeyhint`), `empty-states` +
  ux-guidelines #90 "No Results" (suggest next step + invite link), #89 Autocomplete
  (results while typing, debounced), `disabled-states` + `read-only-distinction` (locked vs
  disabled with reason), `confirmation-dialogs` / `destructive-emphasis` (leave = red, last
  member names the loss), `error-recovery` (blocked leave gives the settle path),
  `undo-support` + `toast-accessibility` (Undo toast, `role=status`).
- **Navigation:** `bottom-nav-limit` (3 tabs kept), `modal-escape` (X + swipe), `back-behavior`,
  `primary-action` (one primary per screen; on solo tablets Add a name takes over).
- **Charts:** `chart-type` (bar for period comparison, charts.csv row 2), `data-table`
  (2D), `tooltip-on-interact` + `tooltip-keyboard`, `touch-target-chart`, `empty-data-state`,
  `axis-labels` + `time-scale-clarity` (Week/Month toggle, labelled periods),
  `number-formatting` (Indian grouping, lakh abbreviations), `gridline-subtle`,
  `direct-labeling` (max and selected bars), `screen-reader-summary`, `contrast-data`,
  `animation-optional` (reduced motion).
- **Typography/colour:** `number-tabular` on all amounts, `color-semantic` (CSS tokens only),
  `truncation-strategy` (chips wrap instead of truncate).

## Pre-delivery checklist (pro-rules.md)

Done: no emoji icons (one SVG stroke family, 2px, 18/20/22 sizes); consistent tokens;
touch targets ≥44; pressed states don't shift layout; disabled states non-interactive with
reasons; labels on all icon controls; colour never the only signal; sticky tab bar has
150px bottom padding so content isn't hidden; reduced motion respected.

Not done in these mocks (flag for build): dark mode (no dark tokens exist yet in Clay;
must be designed separately, not inferred), landscape and tablet widths, 200% text size,
real focus trapping in sheets/dialogs (markup has the roles, not the JS).
