# Clay · design3 · Information architecture

Ruled by `JOURNEYS.md`. The frequent jobs (add, glance, check a group, see who paid) get
the screen. Occasional ones (settle, search, spending) are one tap away. Rare ones
(members, invite, name/icon, currency, export, leave, theme) go behind a menu.

**Words.** The default Clay theme uses plain words: **Groups, Add expense, Expenses,
Balances, Spending, Activity, Profile, Simplify debts, Settle up, members**. The Clay
look stays in the visuals: Fraunces headings, the palette, the clay-tablet illustration in
empty states and on the "First expense" end stamp, and the small cuneiform texture
behind headers. Every string is still a theme key (`SPEC.md §9`), so another theme can
re-skin the words.

## 1. Map

```
Tab bar (4):  Groups  ·  Friends  ·  Activity  ·  Profile
              ──────     ───────     ────────     ───────
Groups (Home)       Friends               Activity          Profile
 ├ hero: net        ├ totals: net +       (all activity,    ├ name, username, avatar
 ├ Your groups      │ owe / owed tiles    cursor-paginated) ├ Your spending (stacked
 ├ + New group      ├ Not settled up                        │ chart, per currency)
 ├ [Search all]     ├ Settled up                            └ Theme, install, sign out
 └ [Add expense]    └ [Add expense]
        └──────────────┴──────────────────────────────────▶ Add expense (full-screen sheet)

Group  /g/:id  (header + 3 tabs; the tab is in the URL)
 ├ Expenses   /g/:id            ← default
 ├ Balances   /g/:id/balances
 ├ Spending   /g/:id/spending   (tap a bar → Expenses filtered to that period)
 ├ [Search]   /g/:id/search?q=
 ├ [⋯] Members and invite link · Name and icon · Currency · Simplify debts ·
 │     Leave group
 ├ [Settle up] sheet   /g/:id/settle
 ├ [Add expense] sheet /g/:id/add
 └ row ▶ Expense sheet /g/:id/e/:eid  (read first; Edit, or for locked rows
                                        "Add a correction")

Friend  /p/:uid   (from the Friends tab, or any avatar)
 ├ net with them across groups (direct balances), per currency
 ├ [Settle ₹X] → settle-all sheet (one record per group, behind the scenes)
 ├ [Add expense] → add sheet preselecting your shared group (or your 1:1 group)
 ├ By group: balance per group (tap → group)
 └ Shared expenses (cursor list across shared groups)

Join  /join/:token   (no auth) → one form (name, username, password) → /g/:id + welcome card
```

The tab bar has 4 tabs (owner decision): **Groups | Friends | Activity | Profile**.
Friends gets its own tab because settling is person-centred (settle all with a friend),
and keeping it apart leaves the Groups screen for the group list. Both screens show the
net, so the cold-start glance works from either one; the default tab is Groups.

## 2. Groups (Home) · `home.html`

1. **Title** `Groups` + search (across all groups).
2. **Hero** (compact): net across all groups in the selected currency, worded
   (`owed to you, net` / `you owe overall` / `settled up`), and one line `You owe in 1
   group · owed in 2`. Amounts drop `.00` when there are no paise.
3. **Your groups**, sorted by **latest activity**. Each 72px row carries the last
   expense (`Meera · Dinner at Thalassa ₹12,000 · 2h`) and your balance. Settled groups
   say `settled up ₹0`. A group you were just added to shows `Arjun added you · 1m` and a
   2 s highlight. `+ New group` ends the list.
4. **Add expense** button, collapsing on scroll (`SPEC.md §14`).

## 2b. Friends tab · `friends.html`

1. **Totals card**: net with all friends, plus tiles `You owe · 2 people ₹4,250` and
   `Owed to you · 2 people ₹5,220`. Per currency, with the same chips as elsewhere.
2. One line: `Direct balances: a friend's number only changes when an expense involves
   you both.`
3. **Not settled up**, largest first: avatar (display-name initials), name, shared
   groups, and the direct balance worded (`you owe ₹1,450` / `owes you ₹4,800`).
4. **Settled up**, folded below.
5. Tap a friend → **Friend page** (§6). Add expense is here too.

Per-friend numbers are always **direct (pairwise)** balances, even in groups that
simplify debts (`SPEC.md §11`).

**Moved:** the Friends list moved off Groups to this tab. The "Your spending" card lives
on Profile.

## 3. Group screen

### Why tabs, and why these three

| Tab | Question | Frequency | Why it's a tab |
|---|---|---|---|
| **Expenses** (default) | What was added, who paid | most visits | It's the reason to open a group, and it's an unbounded list, so it must own the scroll. The first row moves from y=1,014 to y≈300 |
| **Balances** | Who owes whom, everyone's net | settle time | Only needed when settling. Your own balance stays in the header, so the glance doesn't need a tab switch |
| **Spending** | How much, when, by whom | monthly | Charts are occasional and heavy, so they load lazily |

Rejected: **two tabs** (Expenses | Summary), because it brings back the long scroll at
settle time; and **swipe between tabs**, because it fights the back-swipe in PWAs.

### Header (all tabs)

Nav (back · search · `⋯`), eyebrow `Group · 4 members`, name, member faces (display-name
initials, never "U"), then the **balance strip** (56px): `Your balance ₹5,800 you owe` +
`Settle up`. Below that, the tabs (44px, underlined, with the expense count). On scroll,
the title block and balance strip scroll away, the nav takes a small title, and the tabs
and month header stick.

### Expenses tab · `group-expenses.html`

- Expenses **and payments** in one timeline (payments used to sit in a list at the bottom).
- **Sticky month header with the year** (`November 2026 · ₹57,000 · 23 ▾`) → Jump to a month.
- 64px rows. The date shows on the first row of each day. The subtitle says who paid
  and, when not everyone is in, `· 3 people`.
- **Locked rows** (they involve someone who left): a small dashed `Riya left` tag after
  the title; no other change in the list (`SPEC.md §12`).
- Paginated, 50 per page (`SPEC.md §6`).

### Balances tab · `group-balances.html`

- **Simplify debts** (a per-group setting, default **on**, as before). Its note says what
  it saves: `On: 3 payments instead of 4. Same totals for everyone.`
- **Who owes whom** follows the toggle. Your rows come first with inline `Settle up`, and
  each of your rows has a **`Why Arjun?`** disclosure that expands to the direct debts it
  replaces (`SPEC.md §11`). That way a changed route explains itself instead of looking
  like a bug.
- **Everyone**: each member's net in this group.
- `How we got this` sits in the section header.

### Spending tab · `group-spending.html`

Headline (group total · your share). `Day | Week | Month`, with the default picked from
the group's span; the axis starts at the first expense. The chart shows **both your
share and the total** (owner decision): stacked bars with your share as the solid clay
segment at the bottom and everyone else's part as a lighter segment on top, so the full
bar is the total. A small toggle **Both (default) | My share | Total** switches in place.
The fixed readout says both numbers (`Thu 20 Nov · ₹3,800 your share of ₹12,000`) and
has **See them →**, which opens Expenses filtered to the selected bar. Then **Who paid**.

### `⋯` Group menu · `group-menu.html`

Members and invite link · Name and icon (a letter tile until an emoji is picked; **no
default emoji**) · Currency (fixed once there are expenses, with the reason shown) ·
Simplify debts · **Leave group** (last, red; needs ₹0 balance, and when
you're not at ₹0 it says how much and links to Settle up).

## 4. Add expense · `add-expense.html`, `add-expense-repeat.html`, `add-expense-short.html`

Amount first on a fixed keypad. Note with chips. Then the defaults row (`You paid ▾`,
`Equally · 4 ▾`, `Today ▾`), a live preview line, and **Save pinned to the bottom** (on an
iPhone 13 at 390×664 the keys shrink to 42px; Save never leaves the screen). Defaults:
split equally among everyone, payer you, date today. Memory comes from the note you type,
is always announced, and can be undone (`SPEC.md §4`). Closing keeps a draft per group.

## 5. Settling

- **In a group** (`settle.html`): your outstanding debts there as Balances shows them
  (simplified when Simplify debts is on), as radio cards, prefilled (`Record ₹4,400 to
  Arjun`); partial amounts allowed. A footnote says when this differs from your direct
  balance with that person.
- **With a friend, across every group** (`settle-friend.html`, owner decision): one
  amount, `Settle ₹1,450`, computed from **direct** balances. The sheet shows the
  per-group payments Clay will record (Goa:
  you → Arjun ₹3,000; Flat 4B: Arjun → you ₹1,550), so you're square in every group. Full
  amount only; for part of it, settle inside one group. No UPI, no confirmation from the
  other person. One Undo removes all of them.

## 5b. Profile · `profile.html`

Name, username, avatar (`Edit name`). **Your spending**: the account-level chart with the
same stacked bars and `Both | My share | Total` toggle. Total = everything spent in all
groups you're in; your share = your part of it. One currency at a time (`₹ INR` / `¥ JPY`
chips), never mixed or converted. Then Theme, Install Clay, Sign out.

## 6. Friend · `person.html`

Net with them across groups, **Settle ₹X** (primary) and **Add expense** (secondary),
**By group**, then **Shared expenses**. That replaces today's dead end.

## 7. Search · `search.html`

From a group's nav (that group) or Groups (all groups). Field + `Cancel`, scope line,
chips (`Paid by me`, `I'm in it`, `Payments`, `Any time ▾`), then a fixed count + total
line, then results grouped by year with the match underlined. Same cursor contract.

## 8. Adding people · `add-people.html` (owner decision: invite link only)

- **Invite with a link · Share** comes first: the main way anyone new joins.
- Below it, **From your groups**: people you already share a group with, with **Add**;
  current members show **Already in this group** (dimmed, no button). Typing filters this
  list locally.
- **No search of all Clay users** (privacy). When nothing matches: `No one called "zubin"
  in your groups` plus a pointer back to the link.
- The sheet is top-anchored at full height. Its geometry never changes as you type.

## 9. Join · `join.html`, then `invite-landing.html`

The invite link opens a join page: who invited you, the group card, and one form (Your
name, Username suggested from the name with the rules shown, Password) → **Join Goa
Trip**. `Already on Clay? Log in and join`. You land in the group with a welcome card that
explains your balance. Never on a "Welcome back" login or a "Start a group" empty state.

## 10. What moved

| Thing | Was | Now | Why |
|---|---|---|---|
| Expense list | 4th section, y=1,014 | Default tab, y≈300 | Most frequent job |
| Your balance | 220px card, 2 buttons | 56px strip + Settle up | Glance stays, space goes to the list |
| Reckoning + simplify | Always shown; simplify on | Balances tab; simplify still on, every route explains itself | Settle-time only; trust |
| Friends | Section on Home | Own tab with totals card | Owner decision |
| Charts | Total only, one tone | Stacked: your share + total, `Both / My share / Total` | Owner decision |
| Chart | Always rendered | Spending tab, lazy, bar → filter | Occasional |
| Payments | Separate list at the bottom | In the timeline | One history |
| Add a name | Big button every visit; searched all users | `⋯` → Members and invite link; your groups only | Rare; privacy |
| Spending card | Home | Profile | Occasional |
| Add expense | Description first; not on Home; Save off-screen on iPhone | Amount first, on Home, Save pinned | Fewer taps, no lost Save |
| Settle | Per group only | Also per friend across groups | Owner decision |
| Friend page | Dead end | Settle, add, by group, shared expenses | Critic |
| Group settings | None | `⋯` menu | Critic |
| Locked rows | Locked chip + disabled buttons + long note | `X left` tag, no Edit, one-line reason, Add a correction | Owner decision |
| Words | Tablet, Inscribe, Archive, Seal, Hammurabi | Group, Add expense, Activity, Profile, Simplify debts | Owner decision |
