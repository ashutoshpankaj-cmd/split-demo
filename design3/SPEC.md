# Clay · design3 · Component and interaction spec

Tokens are unchanged from `themes/clay.yaml` (`design2/DESIGN.md` §Tokens): bg `#F5EFE4`,
surface `#FFFDF8`, sunk `#EDE4D5`, line `#E3D8C6`, ink/ink2/ink3, clay `#A94A24`, lapis
`#1E4C8A`, owe `#A33224`, owed `#2E6B3C`, bar `#5B79A3`. Fraunces for display and hero
amounts, Inter for the rest, `tabular-nums` on all money. Everything here goes through
theme colours and string keys; nothing is hard-coded per screen.

The one design rule for this doc: **every element that can be loading, empty, or
filled has the same box in all three states.** That's how we get no layout shift.

## 1. Fixed heights (CSS custom properties)

| Token | px | Used by |
|---|---|---|
| `--h-nav` | 52 | nav bar, search bar |
| `--h-standing` | 56 | tablet standing strip |
| `--h-tabs` | 44 | tablet tabs |
| `--h-month` | 40 | sticky month header |
| `--h-row` | 64 | expense / payment row, skeleton row, error row |
| `--h-loadrow` | 48 | "Loading September…" row, pull-to-refresh slot |
| `--h-end` | 76 | end-of-list stamp |
| `--h-tabbar` | 72 (incl. 16 safe area) | tab bar |
| home tablet row | 72 | Home |
| person row | 60 | Home, Person |

Rows never wrap. Title and subtitle are one line each with ellipsis; amounts never
truncate (current `fit()` logic stays). At 200% text size, `--h-row` scales with `rem`
(64px = 4rem); the list virtualiser reads the computed value once per resize.

## 2. Tablet screen

### 2.1 Routes and state

`/g/:id` (Inscriptions), `/g/:id/balances`, `/g/:id/spending`. Switching tabs is a
`router.replace` (it doesn't stack history; Back leaves the tablet). Each tab keeps its
own scroll position and loaded pages in memory while the tablet is open, and for 5 minutes
after leaving (LRU of 3 tablets).

### 2.2 First paint

The tablet name, icon, member faces and `my_net` are already in the Home `/groups`
response, so the header renders **real** on the first frame. Only the list rows are
skeletons, plus the standing amount if the cache is older than 60 s
(`first-load.html`). Skeletons are 7 rows of `--h-row` with the same internal boxes
(date 20×16 + 26×8, title 62%×14, sub 40%×11, amount 64×14). The shimmer is a single
1.2 s linear background-position loop, turned off under `prefers-reduced-motion`.

### 2.3 Collapse on scroll

Scroll container = the tab panel. As the list scrolls, the title block and standing
strip move up normally (no height animation). When the title's baseline passes under the
nav, the nav shows the title at 17px Fraunces with a 150 ms opacity fade. The tabs
(`position: sticky; top: var(--h-nav)`) and the month header (`top: nav + tabs`) stick.
The stuck month header gets a shadow (`.stuck`) via an IntersectionObserver sentinel, not
a scroll listener.

### 2.4 Expense row (64px)

`[date 36] [title / subtitle] [label / amount]`.
- Date shows only on the first row of each day (`visibility:hidden` on the rest, so
  columns stay aligned).
- Subtitle: `{payer} paid {amount}` and, if the split isn't everyone, ` · {n} of {m}`.
- Right: worded label (`you owe` / `you lent` / `not involved` / `payment`) above the
  coloured amount. Colour is never the only signal.
- Payment row: lapis settle icon in place of the date, title `You paid Meera`.
- Press: background `sunk` at 120 ms, no scale (rows must not move).
- Tap → expense detail sheet (design2 `expense-detail.html`).

## 3. Add expense (`add-expense*.html`)

### 3.1 Layout (fixed, 839px viewport)

Close + tablet chip 56 · amount 96 · note field 52 · chips row 46 · defaults row 52 ·
preview line 36 · keypad 4×52 + gaps + Save 52 (≈ 300). Nothing in this stack changes
height between states. The preview line exists even when empty (it shows `₹0 each`).

### 3.2 Input model

- Opens with the **keypad active** and a blinking caret after the amount. Digits append;
  `.` allowed once, max minor-unit digits from the currency (0 for JPY, 2 for INR). Hold
  ⌫ to clear. Indian grouping as you type (`45,000`, `1,20,000`).
- Tapping the note field focuses a real `<input enterkeyhint="done" autocapitalize="sentences">`.
  The OS keyboard covers the keypad (the keypad is hidden, not removed, so its box stays),
  and the Save bar is positioned on `visualViewport` so it sits on the keyboard. Tapping
  the amount returns to the keypad.
- Suggestion chips: up to 4 notes from this tablet, ranked by count in the last 90 days
  × recency. Tapping a chip sets the note and applies §4 matching.
- Defaults row chips: `Paid by` opens a member picker (one tap selects and closes);
  `Split` opens the split sheet (avatars as toggles, plus `Exact amounts` / `Shares`
  tabs; 2-person tablets get the `Equally / {name} owes all / I owe all` presets);
  `Today` cycles `Today → Yesterday → Pick…`.
- Save: enabled when amount > 0, a note is present, and the split is valid. When
  disabled, the bar says why (`Add what it was for`, `Enter an amount`,
  `Shares add up to ₹2,300, not ₹2,400`).

### 3.3 Save = optimistic

1. Close the sheet at once (sheet slide-down 200 ms).
2. Insert the row at the top of the loaded list with a `clay-soft` wash and `saving…` in
   the subtitle. Recompute the header standing locally from the split (it's exact
   integer maths; the server result replaces it).
3. Show a toast `Inscribed · {note} {amount}` with **Undo** for 5 s (`role=status`, no
   focus steal).
4. `POST /groups/:id/expenses` with header `Idempotency-Key: <uuid v4>` (new; the server
   keeps keys 24 h per user and returns the original 201 on replay). It goes through an
   **outbox** in IndexedDB, so offline adds survive reload and retry with backoff
   (2, 4, 8 … 60 s, and on `online`).
5. On 201: replace the temp row with the server row (same position, no flash); clear `saving…`.
6. Undo before the request is sent → drop from outbox. Undo after 201 → `DELETE`
   (also idempotent), row fades out 150 ms, rows below move up 200 ms (FLIP, transform only).
7. Final failure (4xx, or 5 failed retries) → the row turns `owe`-tinted:
   `Didn't save · Retry · Edit`. It never disappears on its own.

Settle uses the same pipeline (`POST /payments`).

## 4. Memory: what Clay remembers (all client-side, per user, per tablet)

| What | Rule | Where it shows | Never |
|---|---|---|---|
| Tablet for global `Inscribe` | The tablet you're inside; else the one you **last added to** within 12 h; else the only tablet with activity in 30 days; else the most recently active | Tablet chip, preselected | Never hidden; always one tap to change |
| Frequent notes | Top 4 by (count in 90 days) × recency, per tablet | Chips under the note field | — |
| Note match refill | Typing ≥ 3 chars that prefix-match a past note in this tablet (case-insensitive, trailing month/number ignored: `Rent, October` ≈ `Rent`) fills **payer and split** from the latest match. **Amount** is filled only if the last 3 matches had the same amount **and** the amount is still 0 | Blue strip `Filled in from Rent, October. Kabir paid, split 3 ways.` + Undo | Never overwrites a typed amount. Never copies the date. Strip stays until Save, so the change is never silent |
| Same people as last time | If your last add in this tablet was < 3 h ago with a non-everyone split | Chip `Same 3 as Parasailing` beside the split chip | Never applied by default |
| Simplify toggle | Per tablet (existing `clay.simplify.<gid>`) | Balances | — |
| Last tab | Not remembered. A tablet always opens on Inscriptions | — | Opening on Spending because you once looked at it |
| Chart period | Per tablet, per session | Spending | — |

Source data: the first page of `/entries` plus `GET /groups/:id/notes` (§6.4), so
matching works on 1,000-row tablets without loading them.

## 5. Interaction specs that kill jank

### 5.1 Member search (`member-search.html`): no layout shift

The current sheet is **bottom-anchored and sized to content**. Results arrive and the
sheet's top edge jumps up; clearing the field drops it down again. New rules:

- The sheet is **top-anchored at full height** (`top: 44px; bottom: 0`) from its first
  frame, so typing can't change its size.
- Below the field there's a **status slot** of fixed 26px: `People you share tablets
  with` → `Searching everyone on Clay…` → `2 people` / `No one called "zubin"`. Text
  changes, height doesn't.
- The results area starts at a fixed y. On open it already shows **From your tablets**
  (people from the `/groups` cache, 0 ms, no network).
- Typing filters that local list **synchronously** on every keystroke. Server results
  (`/users/search`, 150 ms debounce) go under `Others on Clay`. While the request is in
  flight, that section shows **one skeleton row per expected result** (min 1, max the
  previous count). The response swaps skeletons in place. If there are fewer results, the
  extra rows fade out (opacity, 120 ms) and the list doesn't move up mid-read.
- Stale responses (older query) are dropped (the existing behaviour).
- `Copy invite link` is a fixed last row, always present, so "not found" doesn't add UI.

### 5.2 Chart period switch (`chart-states.html`): no popup, bars morph

Cause of the current flash: `by` is part of the resource key, so switching
unmounts the chart (loading state) and remounts it with a selected-bar **bubble** that
animates in. Fix:

- **No floating bubble at all.** The selected period's value lives in a fixed-height
  readout line above the plot (`aria-live=polite`), as on the account chart.
- The chart owns **12 bar slots** (or N ≤ 12 for short tablets) that persist across
  periods. Switching sets new target heights; bars animate `transform: scaleY()` from
  the baseline (`transform-origin: bottom`), 240 ms `cubic-bezier(.2,.8,.2,1)`, no
  stagger. X labels and gridline labels cross-fade 120 ms out / 120 ms in. The y-scale
  max animates with the bars (heights are recomputed against the new max, so it's one
  motion, not two).
- Selection maps by **date**: the period containing the previously selected date stays
  selected (the current month → the current week).
- **Data:** both granularities come in one request when the tab opens
  (`GET /groups/:id/spending?by=day,week,month`), so the switch is synchronous. If the
  requested granularity is missing (cold), keep the old bars, set the segment at once,
  run a 2px lapis hairline along the plot top, then morph when the data lands. Never
  unmount, never show a spinner over the plot.
- `prefers-reduced-motion`: swap instantly, no hairline animation (static 2px line).

### 5.3 Infinite list

- Page size **50** (≈ 5 screens of 64px rows; one request covers a fast fling).
- Prefetch: an IntersectionObserver sentinel **15 rows before the end** of loaded data
  triggers the next page. One request in flight per list; the cursor is the lock.
- Loading row: 48px, spinner + `Loading {Month}…` (month of the next expected item,
  from the cursor). If the user outruns the network, the loading row sits at the end,
  followed by 3 skeleton rows.
- End of list: `has_more=false` → the stamp `The first inscription · Flat 4B began 3 Jun
  2024 · 1,240 inscriptions` (76px). This replaces any spinner.
- Error: an inline row (`--h-row`) `Couldn't load September. You're offline or the server
  is slow. [Retry]`. Rows already loaded stay. No toast.
- **Windowing:** once more than 300 rows are loaded, render only the visible rows ± 1
  screen. Fixed row and header heights make the offsets arithmetic (no measuring). Below
  300 rows the plain DOM is fine and simpler.
- **Sticky month headers** come from the data: insert a header whenever `month(spent_on)`
  changes. The header's total and count come from `/months` (§6.3), not from loaded rows,
  so they're right before the month is fully loaded.
- **Jump to a month** (`month-jump.html`): the sheet lists months from `/months` (count
  per cell; empty months disabled, dashed). Picking one resets the list to
  `?from=YYYY-MM-last-day` and scrolls to top. Scrolling **up** from there loads newer
  pages with `before` cursors (bi-directional list). A `Back to latest` chip appears at
  the top while you're away from the head.

### 5.4 Pull to refresh

Only on the list scroll container when `scrollTop === 0`. The slot opens to 48px with
resistance (`translateY = pull × 0.5`), threshold 64px pull, spinner + `Checking for new
inscriptions`. It refreshes the header (`GET /groups/:id`) and the first page of entries,
then merges by id (§6.5). The slot collapses 200 ms after done. CSS `overscroll-behavior-y:
contain` stops Chrome's native refresh from reloading the whole PWA.

### 5.5 Other no-jump rules

- Toasts float over content (`position:absolute`); they never push the FAB or rows.
- Images/avatars have fixed boxes. Fonts: `font-display: swap` plus matched fallback
  metrics (`size-adjust` on the Georgia/system fallback) so the Fraunces swap doesn't
  reflow titles.
- Sheets animate `transform` only; the content behind never resizes.
- Amount changes (standing after settle) animate the number (count-up 400 ms) inside a
  fixed-width tabular box.

## 6. Backend: pagination contract (proposal)

Today `GET /groups/{gid}` returns every expense and payment (the comment in
`internal/server/groups.go` already flags it: "add paging when a group passes ~1,000
entries"). Proposed split: the **header** stays small and always fresh, and the **list**
is paginated.

### 6.1 `GET /groups/{gid}`: header only

```json
{
  "group": {"id": 7, "name": "Goa Trip", "icon": "", "currency": "INR", "minor_unit": 2, "created_at": "…"},
  "me": 16,
  "version": 142,
  "members": [{"id": 16, "username": "ux2_ash", "net": -580000}],
  "others":  [{"id": 21, "username": "riya", "net": 0}],
  "balances": {"simplified": [{"from":16,"to":17,"amount":440000}], "pairwise": […]},
  "total_spent": 5700000,
  "counts": {"expenses": 84, "payments": 2},
  "first_entry_on": "2026-11-17",
  "last_entry_at": "2026-11-21T15:02:11Z"
}
```

- Drop `expenses` and `payments` arrays (keep them behind `?include=entries` for one
  release while the client migrates; remove after).
- Nets and pairwise are computed with SQL aggregates instead of loading every row:
  `SUM(amount) GROUP BY paid_by` minus `SUM(share) GROUP BY user_id`, plus payments, and
  pairwise from `GROUP BY (paid_by, user_id)` on shares. Simplify runs on the nets as today.
- **`version`**: a per-group counter bumped in the same transaction as any expense or
  payment insert/update/delete and any member change. The client uses it to know whether
  its loaded pages are stale (§6.5).

### 6.2 `GET /groups/{gid}/entries`: the list

Query:

| Param | Meaning |
|---|---|
| `limit` | 1-100, default **50** |
| `cursor` | opaque, from `next_cursor` / `prev_cursor` |
| `dir` | `older` (default) or `newer` (for scrolling up after a month jump) |
| `from` | `YYYY-MM-DD`: start at entries on or before this date (jump to month). Ignored with `cursor` |
| `q` | search text, ≥ 2 chars, matched case-insensitively against description (and payer/participant usernames) |
| `kind` | `expense`, `payment`, or omitted for both |
| `paid_by` | user id (`me` allowed) |
| `involving` | user id (`me` allowed): payer or has a share |
| `month` | `YYYY-MM` filter for search |

Order: **`spent_on DESC, created_at DESC, kind DESC, id DESC`**. This is a total order
(id breaks ties) and matches today's `ORDER BY spent_on DESC, id DESC`; `created_at`
keeps same-day adds in entry order.

Cursor: base64url of `{"v":1,"d":"2026-11-14","t":"2026-11-14T08:01:22.120Z","k":"e","id":1234}`,
the sort key of the last row returned. Opaque to clients; the server validates and returns
`400 invalid_cursor` on tampering. Keyset predicate (older):

```sql
WHERE group_id = $1 AND (spent_on, created_at, kind, id) < ($d, $t, $k, $id)
ORDER BY spent_on DESC, created_at DESC, kind DESC, id DESC LIMIT $limit + 1
```

over `entries := (SELECT 'e' kind, … FROM expenses UNION ALL SELECT 'p' kind, … FROM payments)`.
Fetch `limit+1` to set `has_more` without a count query.

Response:

```json
{
  "items": [
    {"kind":"expense","id":1234,"description":"Dinner at Thalassa","amount":1200000,"paid_by":17,
     "date":"2026-11-21","split_mode":"equal","shares":[{"user_id":16,"amount":300000},…],
     "my_effect":-300000,"version":1,"created_by":17,"created_at":"…","updated_at":"…"},
    {"kind":"payment","id":88,"from":16,"to":17,"amount":140000,"date":"2026-11-20","my_effect":140000,…}
  ],
  "next_cursor": "eyJ2IjoxLC…",
  "prev_cursor": "eyJ2IjoxLC…",
  "has_more": true,
  "version": 142,
  "total": {"count": 27, "amount": 7841000}
}
```

- `my_effect` (signed minor units for the caller) lets the row render without the client
  recomputing from shares. Shares stay in the payload for the detail sheet (they're small).
- `total` only when `q`/filters are present (search's `27 matches · ₹78,410`); it's a
  separate aggregate over the same WHERE, computed only on the first page (no cursor).
- Indexes: `expenses (group_id, spent_on DESC, created_at DESC, id DESC)`,
  `payments (group_id, spent_on DESC, created_at DESC, id DESC)`; for search,
  `CREATE EXTENSION pg_trgm` + `GIN (lower(description) gin_trgm_ops)` on expenses.
- Same contract for `GET /activity` (cursor over activity rows) and
  `GET /entries?with={uid}` (Person view, across shared tablets; `group` object inlined
  per item) and `GET /entries?q=` (global search, scope = all my tablets).

### 6.3 `GET /groups/{gid}/months`

```json
{"months":[{"month":"2026-11","count":23,"amount":5700000},{"month":"2026-10","count":51,"amount":…}]}
```

Expenses only in `amount` (payments aren't spending), payments counted in `count`.
One `GROUP BY date_trunc('month', spent_on)` query. Used by sticky headers, Jump to a
month and the end stamp. Bumped with `version`; cached by the client per version.

### 6.4 `GET /groups/{gid}/notes`

Top 50 descriptions in the last 365 days with `count`, `last_on`, `last_amount`,
`last_paid_by`, `last_split` (mode + participants), and `stable_amount` (true if the last
3 amounts are equal). Feeds §4. Cheap (`GROUP BY lower(description)` with
`DISTINCT ON`). Cached per `version`.

### 6.5 Freshness and consistency

- Keyset cursors are stable under inserts: new entries appear at the head, never
  duplicated into older pages.
- Pull-to-refresh / app resume: fetch header. If `version` is unchanged, done. If
  changed: fetch the first page and merge by `(kind,id)` (replace, insert, and drop ids
  that disappeared within the first page's key range). If the first page doesn't overlap
  the loaded head (more than 50 new entries), reset the list to the new first page and
  keep the scroll at top.
- Edits that change an entry's date can move it across pages. The client dedupes by
  `(kind,id)` and moves the row; a stale copy deeper down is dropped when its page is
  re-fetched. Good enough for friends-and-family scale, with no tombstones table.
- `POST`/`PUT`/`DELETE` responses include the new `version` and the new header balances,
  so optimistic UI reconciles without a second request.

### 6.6 `POST /groups/{gid}/invites` (new, for P4)

Returns `{token, url, expires_at}`. `GET /invites/{token}` (no auth) returns
`{group_name, inviter, member_count, entry_count}` for the landing. `POST /register`
accepts `invite` and joins the tablet in the same transaction. `DELETE
/groups/{gid}/invites/{token}` revokes. Rate-limited like `/users/search`.

## 7. Empty, loading, error states (per surface)

| Surface | Loading | Empty | Error |
|---|---|---|---|
| Home tablets | 3 skeleton rows @72 (cached data shows instantly after first run) | Illustration + `Start a tablet` (existing copy) | Card-level `Couldn't load · Retry`, cached data stays visible with `offline` chip |
| Tablet header | Real from cache, amount skeleton | n/a | Banner under nav `Showing saved data · Retry` |
| Inscriptions | 7 skeleton rows | `Nothing inscribed yet` + `Inscribe the first expense` (primary) | Inline error row, §5.3 |
| Balances | 3 skeleton transfer rows @56 | `All square` box (existing) | inline row |
| Spending | Chart frame with baseline + 12 skeleton bars at 30% height | `Nothing inscribed yet` (design2) | inline row in card |
| Search | Count slot `Searching…`, rows skeleton | `No inscriptions match "plumbr"` + `Search all tablets` | inline row |
| Member search | §5.1 | `No one called "zubin"` + invite row | slot text `Couldn't search everyone. Your tablets are shown.` |

## 8. Motion tokens

| Token | ms | Easing | Use |
|---|---|---|---|
| `--m-press` | 120 | ease-out | press feedback (colour only on rows) |
| `--m-fade` | 150 | ease | label/title fades, row removal |
| `--m-sheet` | 240 / 200 | `cubic-bezier(.2,.8,.2,1)` / ease-in | sheet in / out |
| `--m-morph` | 240 | `cubic-bezier(.2,.8,.2,1)` | chart bars, list FLIP |
| `--m-count` | 400 | ease-out | number count-up |

All non-essential motion is off under `prefers-reduced-motion` (state changes still happen
instantly).

## 9. New theme string keys (both `clay` and `classic`)

`group.tab_expenses` (Inscriptions / Expenses), `group.tab_balances` (Balances),
`group.tab_spending` (Spending), `list.loading_month` ("Loading {month}…"),
`list.end_title` (The first inscription / First expense), `list.end_body` ("{name} began
{date} · {count} inscriptions"), `list.error_page` ("Couldn't load {month}. You're offline
or the server is slow."), `list.retry`, `list.refreshing` ("Checking for new
inscriptions"), `list.back_to_latest`, `jump.title` (Jump to a month), `jump.hint`,
`search.placeholder`, `search.scope` ("Searching {name} · {count} inscriptions"),
`search.count_one/_other` ("{count} match · {amount} in total"), `search.none`,
`search.filter_mine`, `search.filter_involving`, `search.filter_payments`,
`search.filter_time`, `add.what_for`, `add.paid_by`, `add.split_equal` ("Equally · {count}"),
`add.preview_lend` ("{each} each · you lend {amount}"), `add.preview_owe`,
`add.refill` ("Filled in from {note}. {payer} paid, split {count} ways."),
`add.same_people` ("Same {count} as {note}"), `add.disabled_note`,
`add.disabled_amount`, `add.preset_they_owe_all`, `add.preset_i_owe_all`,
`toast.inscribed` ("Inscribed · {note} {amount}"), `row.saving`, `row.failed`,
`settle.record_to` ("Record {amount} to {name}"), `settle.partial`, `settle.footnote`,
`spending.trip_total`, `spending.your_share`, `chart.day`, `invite.copy`,
`invite.landing_title` ("{inviter} invited you to {group}"), `welcome.title`,
`welcome.body`, `welcome.how`. The validator's placeholder rule applies to each.

## 10. Accessibility notes (delta from design2)

- Tabs: `role=tablist` / `tab` / `tabpanel`, `aria-selected`, arrow keys move between
  tabs. Each panel keeps focus order header → tabs → list.
- Infinite list: `role=list`, `aria-busy` while a page loads, and a visually hidden live
  region announces `50 more inscriptions loaded` / `End of inscriptions`. Load-more is
  also reachable as a real button for keyboard and switch users (the sentinel row is a
  focusable `Load older` button when focused).
- Custom keypad: `role=group` with `aria-label`; keys are buttons; the amount is an
  `<output aria-live=polite>`. A hardware keyboard types digits directly.
- Refill strip and toasts: `role=status`.
- Touch targets ≥ 44px everywhere (filter chips 36px tall sit inside 44px hit areas
  via padding).

## 11. Not covered here

Dark mode tokens (Clay has none yet, as design2 flagged). Landscape and tablet widths.
Receipt photos. Recurring entries that post themselves (deliberately not proposed: §4
refill gets most of the value without automation surprises). UPI deep links on settle
(needs VPAs on profiles).
