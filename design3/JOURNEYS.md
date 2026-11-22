# Clay · design3 · Journeys

What people actually do with Clay, how often, and what each job should cost. The
personas' weeks come first because they drive the decisions in `IA.md` and `SPEC.md`.
Persona testers should judge the built app against these walkthroughs, not against a
checklist.

**Wording.** The default Clay theme now uses plain words: Groups, Add expense, Expenses,
Balances, Activity, Profile, Simplify debts, Settle up. The clay look stays in the
visuals: Fraunces headings, the palette, illustrations in empty states, and the
"First expense" stamp at the end of a list.

**Where the "Current" numbers come from.** Measured by the black-box critic on Pixel 7
(412×839) and iPhone 13 (390×664) against the live app. Cells marked *(walkthrough)*
weren't measured; they come from my own pass on 21 Nov 2026 with two `ux2_*` accounts.

---

## 1. Jobs ranked by frequency

| # | Job | How often | Start screen (new) | Target | Current (measured) |
|---|---|---|---|---|---|
| 1 | **Add an expense right after it happens** | 3-15 a week (trips: 5+ a day) | Anywhere: `Add expense` on Groups and inside every group. The last group is preselected | **3 taps, < 10 s**, Save always visible, the new row highlighted at the top | **6 taps, 1 scroll, 2 keyboard switches, ~25-30 s.** No add on Home (only "New tablet"). On iPhone 13 Save sits off-screen even without the keyboard (ends at y=690 on a 664px screen). No autofocus; Enter doesn't advance; Save is disabled with no reason; closing throws the draft away silently; no description suggestions; the saved row isn't visible after saving |
| 2 | **Glance: do I owe anyone, does anyone owe me** | daily | Groups (cold start: net) or the Friends tab (net + owe/owed tiles + per-friend list) | **0 taps, < 2 s** | 0 taps *(walkthrough)*, but amounts read `₹13,425.00`, paise rounding looks random across rows, and the add button covers the amount column and Friends rows |
| 3 | **Check a group's recent expenses** | 2-5 a week | Groups → group | **1 tap**, first expense at y≈300 | First expense at **y=1,014 (Pixel 7) / 1,052 (iPhone 13)**: 1.2-1.6 screens down, under the balance card, reckoning and chart |
| 4 | **See who paid** | with #3 | Expense row subtitle | 0 extra | 0 extra, after the scroll in #3. Avatars all read "U" for `ux_*` users, so faces don't help |
| 5 | **Settle with a friend** | 1-4 a month | Friends tab → friend → `Settle ₹X` (all groups at once), or group → `Settle up` | **3 taps**, one amount per friend | Settle prefill works. But it's per group only, and the friend's page is a dead end (no shared expenses, no settle). With Simplify on, "who do I owe Rahul" changes when **unrelated** expenses are added |
| 6 | **Find an old expense** ("last month's plumber") | 1-3 a month | Group → search, or tap a chart bar | **2 taps + 3-4 letters, < 6 s** | **Scroll 2,985px (4.5 screens).** Three identical rows, no year on dates, no search |
| 7 | **Review spending** | monthly | Group → Spending tab; Profile → Your spending | 2 taps, no jumps; your share **and** the total in one chart | Week/Month removes and reinserts the chart (+37 / +140 ms), the card collapses ~280px, **CLS 0.14**, a tooltip is pinned on an empty current week, and 9 empty leading months show |
| 8 | **Add people / manage members** | rare | Group → `⋯` → Members and invite link | Share link 2 taps; add someone from your groups 3 taps | The search input moves **252→264→291→279px** while typing (the sheet is bottom-anchored and resizes); the hint is pinned where the keyboard covers it; it searches every user on the server |
| 9 | **Group settings, leaving, fixing an old expense with someone who left** | rare | Group → `⋯`; a locked row | 2 taps; a correction in 3 | No settings at all: no rename, emoji (default 🏖️ even for "Flat 4B"), currency. A 1:1 group named "Rahul" is also "Rahul" on Rahul's phone. The leave guard works |
| 10 | **First run, invited by a friend** | once per user | Invite link → join page → that group | **1 form, < 60 s**, landing in the group with the debt explained | The invited user lands on a **"Welcome back" login**, then an empty state saying "Start a tablet". No welcome when added. The username is silently lowercased and there's no display name |

Rule: the more often a job happens, the fewer taps it gets and the closer it is to the
thumb. Jobs 1-4 are the product. Jobs 7-9 may not take space from them.

---

## 2. Personas and their weeks

Each step says what they **expect**, what they **try first**, and what Clay should
**remember or suggest**. Every "remember" maps to one rule in `SPEC.md §4`.

### P1 · Flat 4B: three flatmates with monthly bills

**Kabir Shah (28), Arjun Kapoor (27), you (Ashutosh, 29).** Bengaluru 3BHK, 2.5 years on
Clay, ~1,240 expenses. Rent ₹45,000 (Kabir pays the landlord), electricity ₹2,600-4,000
(whoever gets the bill), WiFi ₹1,199 (you, autopay), gas cylinder ₹1,050 every 6 weeks,
groceries. The pain points: the 1st of the month, and "did anyone add the electricity?".

| When | Step | Expects | Tries first | Clay remembers / suggests |
|---|---|---|---|---|
| Sat 1 Nov, 09:10 | Kabir pays rent | Seconds; it's the same every month | `Add expense` on Groups | **Last group he added to** is preselected (Flat 4B). Typing `Ren` matches **Rent, October**: payer Kabir, split equally 3, amount ₹45,000 (stable for 3 months). A blue strip says so, with **Undo** (`add-expense-repeat.html`). Save: 3 taps, ~6 s. After saving, Groups shows Flat 4B at the top with the new subtitle, highlighted |
| Sat 1 Nov | You open Clay | See your share without hunting | Groups | Flat 4B first (latest activity), `Kabir · Rent, November ₹45,000 · 2m`, `owed to you ₹6,350`. 0 taps |
| Mon 3 Nov | You log WiFi | Same as last month | `Add expense`, `wi` | Chip **WiFi** (frequent here) fills ₹1,199, payer you, split 3. The date is **today**, never copied |
| Wed 12 Nov | Arjun pays electricity | Amount differs every month | Types ₹2,640, then `ele` | Fills payer and split, **not** the amount (it isn't stable, and he already typed one) |
| Sun 16 Nov | "Who paid the gas last time?" | Find it in seconds | Flat 4B → search | `gas` → 19 results grouped by year, newest first; the top row says `Arjun paid ₹1,050 · 2 Oct` (`search.html`) |
| 30 Nov | Month-end, Kabir owes you | One number per flatmate | Friends tab → Kabir | Kabir's page: `Kabir owes you ₹4,800`, **Settle ₹4,800**. One record covers every group they share (`settle-friend.html`) |
| Any day | Look back at March | Smooth scroll, no "load more" button | Flings the Expenses list | Pages of 50 load ahead; sticky header `March 2026 · ₹61,300 · 44 ▾` → **Jump to a month** (`month-jump.html`) |
| Jan | A previous flatmate, Rahul, moved out last year (settled, left). Arjun spots that an old electricity bill was ₹300 too high | Fix it | Taps the old row | The row is locked because Rahul left. It shows a `Rahul left` tag and no Edit. The sheet gives one line of reason plus **Add a correction**, which opens Add expense prefilled as a correcting entry among the current flatmates (`locked-expense.html`) |

**Lesson:** monthly repeats are most of their adds. Refilling from a matching note beats a
"recurring expenses" feature: no setup, and nothing posts on its own. Search and jump to a
month must work on 1,000+ rows, which forces pagination.

### P2 · Goa Trip: five friends, adding on the go, settling at the end

**Meera Iyer (organiser), Arjun, Kabir, Riya Sen, you.** 17-21 Nov. ~35 expenses in 5 days
on patchy 4G. Not everyone joins everything (parasailing 3, drinks 3). They settle on the
last evening or the week after.

| When | Step | Expects | Tries first | Clay remembers / suggests |
|---|---|---|---|---|
| Day 0 | Meera creates Goa Trip | Get everyone in without swapping usernames | `+ New group` → name → **Add people** | The sheet leads with **Invite with a link → Share** (WhatsApp share sheet). Below it, **people from her groups** (Arjun, Kabir, Riya) with **Add**; anyone already in shows **Already in this group**. No search of all Clay users (`add-people.html`) |
| Day 1, 13:40 | Meera pays the villa deposit ₹20,000 | 10 seconds on the street | `Add expense` | Group preselected (inside it, or the last one she added to). Payer **you**. Split **equally among all 5**. Save, then the row appears at the top of Expenses with a 2 s highlight |
| Day 2, 18:30 | Kabir logs parasailing for 3 of 5 | Exclude 2 people fast | ₹9,600, `Para…`, taps `Equally · 5` | Split sheet: avatars as toggles. He taps 2 off; preview `₹3,200 each · 3 people`. Switching to Exact keeps those 3 (it doesn't re-add the 2) |
| Day 2, 21:10 | Kabir logs drinks for the same 3 | Same 3 again | `Add expense` | His last add here was < 3 h ago with a custom split, so a chip **Same 3 as Parasailing** sits beside the split chip. One tap. Never applied silently |
| Day 3, offline | You add scooter fuel | It doesn't vanish | Save | The row appears at once with `saving…`; an outbox with an idempotency key retries on reconnect. If it fails for good, the row turns red with **Retry / Edit** |
| Day 3 | "Did Meera add yesterday's breakfast?" | Open group, see it | Taps Goa Trip | **Expenses is the default tab**, first row at y≈300. `Arjun paid ₹2,400` answers "who paid" |
| Day 5 | Settle up | Clear amounts she can trust | Goa Trip → `Settle up` | **Simplify debts is on** (the default), so it's 3 payments, not 4: `You pay Arjun ₹4,400`, `You pay Meera ₹1,400` (`settle.html`). Puzzled why Arjun and not Meera? **Why Arjun?** under the row shows the direct debts it replaces; your total stays ₹5,800 (`group-balances.html`). Her Friends tab still shows direct numbers (Arjun ₹3,000 in Goa), which only move when an expense involves them both |
| Week after | "What did the trip cost me, and the group?" | Both numbers | Goa Trip → Spending | `Trip total ₹57,000 · your share ₹14,250`. **Day** buckets because the trip spans < 21 days; the axis starts on day 1. Stacked bars: solid = your share, light = others, full bar = total; readout `₹3,800 your share of ₹12,000`. Toggle `Both / My share / Total`. Tapping a bar → **See them** opens that day's expenses (`group-spending.html`) |
| Week after | Riya settled and wants out | Leave cleanly | `⋯` → **Leave group** | Allowed only at ₹0 (unchanged). After she leaves, every row she's on is locked for everyone and reads as history: `Riya's share was ₹3,200`, never "you owe Riya" |

**Lesson:** adds happen standing up, one-handed, often offline. That means amount-first
entry on a fixed keypad, optimistic save with an outbox, and one sheet to change the split.
Default split stays "everyone, equally", and the remembered subset is offered as a chip.
Simplified routes looked arbitrary, so every simplified row explains itself ("Why
Arjun?") and per-friend numbers are always direct balances.

### P3 · Riya & you: a couple

**You and Riya Sen.** One shared group, ~60 expenses a month: Zepto/Blinkit, dinners, cabs,
Netflix, "I paid for your thing". Settling is a monthly UPI "to make it even".

| When | Step | Expects | Tries first | Clay remembers / suggests |
|---|---|---|---|---|
| Daily | Logs Zepto ₹840 | Fastest path; it's always this group | `Add expense` on Groups | With one active group, it's preselected with no extra tap. Payer you, 50/50. Chips `Zepto`, `Blinkit`, `Dinner`, `Uber` |
| Weekly | "I paid for Riya's haircut, all of it" | Not 50/50 | Split chip | Two-person groups get presets **Equally · Riya owes all · I owe all** (mapped to exact splits) |
| Any time | Who's ahead | One number | Opens app → Friends tab | Totals `₹420 owed to you, net`; row `Riya Sen · owes you ₹420` (`friends.html`) |
| Month end | Even it out | One tap, then UPI outside Clay | Friends tab → Riya → **Settle ₹420** | One record. No UPI and no "Riya confirms" step (owner decision). Footnote: "Clay only records it" |
| Sometimes | "How much on Zepto in October?" | A number | Search `zepto`, `Any time ▾` → October | Count line `14 matches · ₹9,860 in total` |

**Lesson:** two-person groups need the "paid for the other" presets. The global add
skips the group choice when there's one live group. The search total is a feature. Their
1:1 group is named "Riya & you" on your phone and "Ashutosh & you" on hers (`SPEC.md §13`).

### P4 · First-timer: Dev Mehta, invited by Meera

**Dev (31)** has never used Clay and will give it one minute.

| When | Step | Expects | Tries first | Clay remembers / suggests |
|---|---|---|---|---|
| T+0 | Meera taps **Share** on the invite card | A link in WhatsApp | Pastes it | `…/clay/#/join/<token>`, scoped to Goa Trip, expires in 14 days, revocable in Members |
| T+5 s | Dev opens it | What is this, who invited me | Reads | **Join page** (`join.html`): "Meera invited you to a group", the Goa Trip card (members, 1 expense), and **one form**: Your name, Username (suggested from the name, rules shown), Password. Primary **Join Goa Trip**; `Already on Clay? Log in and join`. Never a "Welcome back" login |
| T+40 s | Taps Join | Land where the money is | — | Account created and joined in one transaction → Goa Trip, Expenses tab, **welcome card**: "Meera added 1 expense with you in it… How the ₹3,000 adds up · Got it" (`invite-landing.html`). His avatar shows **DM** |
| T+1 min | Adds the cab he paid for | Obvious button | `Add expense` | Same 3-tap flow; amount keypad already active |
| Later | Arjun adds Dev to another group | Know why it appeared | Opens app | Dev now shares Goa Trip with Arjun, so Arjun can add him directly. Dev's Groups list shows the new group highlighted with `Arjun added you · 1m` |

**Lesson:** the invite link replaces the username dance. Joining must be one form that
ends inside the group with the debt explained. Display names fix "U" avatars and the
lowercased-username surprise.

---

## 3. Target vs current, summed

Weekly, for a typical active user (P1/P3 blend: ~8 adds, 5 glances, 3 group checks,
0.5 settles, 0.5 searches, 0.25 reviews):

| | Current | Target |
|---|---|---|
| Taps per week | ~75 + ~12 scrolls (adds alone: 48 taps, 8 scrolls) | ~33, no scrolls for any top-4 job |
| Time per week | ~5.5 min (adds alone: ~3.5 min at 25-30 s) | ~1.5 min |
| Worst single job | Find last month's expense: 2,985px of scrolling; first run: login wall + empty state | 6 s; < 60 s |
| Layout stability | CLS 0.14 on the chart toggle; search input moves 39px | 0 (every box fixed, `SPEC.md §1, §5`) |
