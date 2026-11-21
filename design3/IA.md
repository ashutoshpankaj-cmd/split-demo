# Clay · design3 · Information architecture

Ruled by `JOURNEYS.md`. The frequent jobs (add, glance, check a tablet, see who paid)
get the screen. Occasional ones (settle, search, spending) are one tap away. Rare ones
(members, rename, export, leave, theme) go behind a menu.

Clay vocabulary is unchanged: tablet = group, inscription = expense, name = member,
Archive = activity, Your seal = account. Every string below is a theme key (`SPEC.md §9`),
so the `classic` theme reads "Groups / Expenses / Add expense".

## 1. Map

```
Tab bar (3, unchanged):  Tablets  ·  Archive  ·  Your seal
                         ───────     ───────     ─────────
Tablets (Home)           Archive               Your seal
 ├ hero: net + owe/owed  (all activity,        ├ Your spending (moved here from Home)
 ├ Your tablets          paginated, same       ├ Theme, account, sign out
 ├ People (not square)   cursor contract)      └ Install app
 ├ [Search all]
 └ [Inscribe] ──────────────────────────────▶ Add expense (full-screen sheet)
      │
Tablet  /g/:id  (header + 3 tabs; tab is in the URL)
 ├ Inscriptions  /g/:id          ← default
 ├ Balances      /g/:id/balances
 ├ Spending      /g/:id/spending
 ├ [Search]      /g/:id/search?q=
 ├ [⋯] Members · Add a name · Invite link · Rename · Export CSV · Leave
 ├ [Settle up]   sheet  /g/:id/settle
 ├ [Inscribe]    sheet  /g/:id/add
 └ row ▶ Expense detail sheet /g/:id/e/:eid  (read first, Edit secondary; design2)

Person  /p/:uid   (from Home → People)
 ├ net across tablets, per currency
 ├ By tablet: balance + Settle each
 └ Recent with <name> (cursor list, all shared tablets)

Join  /join/:token   (no auth) → sign up → /g/:id with the welcome card
```

The tab bar stays at 3. A separate People tab was considered and rejected: friends-and-
family users have 3-10 people and 2-6 tablets, which fit on one Home screen, and a 4th tab
would only split the glance job across two places.

## 2. Home (`home.html`)

Top to bottom, in priority order:

1. **Title row**: `Tablets` + a search icon (global search across tablets, same result
   rows with the tablet name in the subtitle).
2. **Hero** (fixed 150px): net across all tablets in the selected currency, worded
   (`owed to you, net` / `you owe overall` / `all square`), and two tiles
   `You owe · 2 people` / `Owed to you · 2 people`. Multi-currency chips from design2 stay.
   Amounts drop `.00` when the minor part is zero (`₹13,425`, not `₹13,425.00`).
3. **Your tablets**: sorted by **latest activity**, not name. Each 72px row shows the
   last inscription (`Meera · Dinner at Thalassa ₹12,000 · 2h`), which answers "did they
   add it?" without opening the tablet. Your standing is on the right. Archived or
   all-square tablets older than 60 days fold into `+ 3 quiet tablets`.
4. **People**: only people you're not square with, largest first. The rest fold into
   `+ N people all square`. Tap opens the Person view.
5. **Inscribe** FAB: global add. It preselects the right tablet (`SPEC.md §4`).

**Moved off Home:** the "Your spending" card goes to Your seal. Monthly review is
occasional, and it pushed People below the fold.

## 3. Tablet screen: header + tabs

### Why tabs, and why these three

The tablet screen answered four different questions in one scroll (standing, reckoning,
chart, list), so the most frequent one (the list) came last. Tabs let each question own
the full height:

| Tab | Question | Frequency | Why it's a tab and not a section |
|---|---|---|---|
| **Inscriptions** (default) | What was added, who paid | most visits | It's what people open a tablet for. It's an unbounded list, so it must own the scroll |
| **Balances** | Who pays whom, everyone's net | settle time | The reckoning and simplify toggle are only needed when settling. Your own standing stays in the header, so the glance needs no tab switch |
| **Spending** | How much, when, by whom | monthly | Charts are occasional and heavy. They load only when the tab opens |

I considered **two tabs** (Inscriptions | Summary). That makes Balances + Spending one
long scroll again, which brings back complaint #1 for settle-time visits. **Swipeable
tabs** were rejected: a horizontal swipe on a list of tappable rows fights the browser's
back-swipe on Android/iOS PWAs. Tabs change by tap only.

### Header (shared by all tabs, `group-*.html`)

- Nav: back · (space) · search · `⋯`.
- Eyebrow `Tablet · 4 names`, title, faces (tap → Members, same as `⋯ → Members`).
- **Standing strip** (fixed 56px): `Your standing ₹5,800 you owe` + `Settle up`. It's
  the one number you need on every visit, and it was a 220px card before.
- Tabs (44px), underlined, with a count on Inscriptions.

On scroll, the title block and standing strip scroll away. The nav gets a small title,
and the tabs **stick** under it (`SPEC.md §2.3`). The list gets the whole screen.

**Moved behind `⋯`:** Add a name (was a big button on every visit), Members, Invite link,
Rename/icon, Export ledger (CSV), Leave tablet (last, red, separated). **"How we got
this"** moves into the Balances tab header, next to the numbers it explains.

### Inscriptions tab (`group-expenses.html`)

- Expenses **and payments** in one chronological list (payments used to be a separate
  section at the bottom). A payment row has the lapis settle icon and the label `payment`.
- **Sticky month header** (40px): `November 2026 · ₹57,000 · 23 ▾`. Tap → Jump to a month.
- Rows are 64px. The date column shows only on the first row of each day, so repeated
  dates don't add noise. The subtitle carries who paid and the split exception (`· 3 of 4`).
- Paginated, 50 per page (`SPEC.md §6`).

### Balances tab (`group-balances.html`)

- **Who pays whom**: Hammurabi's shortcut toggle (remembered per tablet), your rows first
  with inline **Settle**, then others' rows. `How we got this` sits in the section header.
- **Everyone**: every member's net on this tablet (doubles as the member list; former
  members show with the dashed avatar and `Left`).

### Spending tab (`group-spending.html`)

- Headline: tablet total · your share.
- Chart with `Day | Week | Month`. The default comes from the tablet's span: under 21
  days → Day, under 6 months → Week, else Month. The axis starts at the first
  inscription (no empty pre-history), max 12 buckets, scrolls back in time by period.
- **Who paid** in the selected period: horizontal bars per member.
- `See as table` (a11y, from design2).

## 4. Add expense (`add-expense.html`, `add-expense-repeat.html`)

Full-screen sheet, **amount first**:

```
[×]        [G Goa Trip ▾]
          ₹ 2,400|              ← custom keypad owns the bottom half
[ What for?                ]
[Dinner] [Scooter fuel] [Breakfast] [Cab]      ← this tablet's frequent notes
[Paid by You ▾] [Split Equally · 4 ▾] [Today ▾]
       ₹600 each · you lend ₹1,800             ← live preview, fixed 36px line
┌ 1 2 3 / 4 5 6 / 7 8 9 / . 0 ⌫ ┐
└ [✓ Save ₹2,400] ┘
```

Decisions:

- **Amount first, on a custom keypad.** The amount is the one field every expense
  needs. A custom keypad gives a fixed layout: the OS keyboard resizing the viewport is
  the jank we're removing. Typing the note brings up the OS keyboard instead, and the Save
  bar rides on top of it (`SPEC.md §3`).
- **Default split = equally among everyone in the tablet.** It's right most of the time,
  and wrong-by-memory is worse than one extra tap. The "same people as last time" chip
  covers trips (P2), and the 2-person presets cover couples (P3).
- **Default payer = you.** Whoever adds an expense usually paid for it. We don't
  silently remember the last payer, because a wrong payer flips who owes whom. The payer
  does change automatically when the note matches a past entry (Rent → Kabir), and that is
  always announced in the blue strip with Undo.
- **Note required**, but one tap via chips. The Save button explains why it's disabled
  ("Add what it was for") instead of just greying out.
- **Date = today**, with chips `Today / Yesterday / Pick`. Never copied from a matched entry.
- The **tablet chip** is always visible. It's preselected (§4 Memory), and changing the
  tablet re-validates payer and split.

## 5. Settle (`settle.html`)

Bottom sheet. Opens from: the header `Settle up`, a Balances row `Settle`, or the Person
view's per-tablet `Settle`.

- Your outstanding transfers in this tablet as **radio cards**. The one you came from is
  preselected, else the largest. Others' transfers aren't shown (anyone can still record
  them from Balances → their row → `Record a payment for them`).
- Big amount, prefilled with the full balance. `Paying part of it? Change amount` opens
  the keypad.
- One primary: `Record ₹4,400 to Arjun`. Honest footnote: Clay only records it.
- After: toast with Undo (5 s), standing animates, the payment row appears in Inscriptions.

## 6. Person (`person.html`)

From Home → People. Net across tablets (per currency), `By tablet` with Settle on each
(each tablet settles separately, as in design2), then `Recent with Arjun`: a cursor list
of inscriptions you both appear on, across tablets, with the tablet name in the subtitle.

## 7. Search (`search.html`)

- Entry: the search icon in a tablet's nav (scope = that tablet) or on Home (scope = all).
- Search replaces the nav, so the field is focused with the keyboard up. A scope line
  (`Searching Flat 4B · 1,240 inscriptions`), filter chips (`Paid by me`, `I'm in it`,
  `Payments`, `Any time ▾`), then a fixed **count + total** line (`27 matches · ₹78,410
  in total`).
- Results use the same row component with the match underlined. They're grouped by
  **year** (matches are sparse, so month headers would be one row each), and paginated
  with the same cursor contract.
- Back/Cancel restores the list and its scroll position.

## 8. Members (rare)

`⋯ → Members` sheet: the list, `Add a name`, `Copy invite link`, `Leave` (design2 rules).
Add a name is the **top-anchored, full-height** sheet from `member-search.html`. Its
geometry never changes while you type.

## 9. What moved, summary

| Thing | Was | Now | Why |
|---|---|---|---|
| Expense list | 4th section, y≈1005 | Default tab, y≈300 | Most frequent job |
| Your standing | 220px card with 2 buttons | 56px strip + Settle | Glance stays, space returns to the list |
| Reckoning + simplify | Always on screen | Balances tab | Only needed at settle time |
| Tablet chart | Always rendered | Spending tab, lazy | Occasional |
| Payments | Separate section at the end | Inline, chronological | One history |
| Add a name | Primary-size button every visit | `⋯` menu | Rare |
| Your spending card | Home | Your seal | Occasional; pushed People down |
| Add expense | Description first, native date input | Amount first, keypad, chips | Fewer taps, no layout jumps |
| Group invite | Didn't exist | Link in Add a name / Members | First-run journey |
| Search | Didn't exist | Tablet + global | Old expenses at 1,000+ rows |
