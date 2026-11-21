# Clay · design3 · Journeys

What people actually do with Clay, how often, and what each job should cost. The
personas' weeks come first because they drive the decisions in `IA.md` and `SPEC.md`.
Persona testers should judge the built app against these walkthroughs, not against a
checklist.

"Current" costs come from using the live app on a Pixel 7 viewport (412x839) on
21 Nov 2026, with two `ux2_*` accounts and an 8-entry tablet. Taps count deliberate
touches. Typing a field counts as one tap plus typing. Scrolling is counted separately.
Times are for a practised user.

---

## 1. Jobs ranked by frequency

| # | Job | How often (typical user) | Start screen (new) | Target taps | Target time | Current cost |
|---|---|---|---|---|---|---|
| 1 | **Add an expense right after it happens** | 3-15 a week (trips: 5+ a day) | Anywhere: the `Inscribe` button is on Home and on every tablet tab | **3** + digits (Inscribe, a suggestion chip or a typed note, Save) | **≤ 8 s** | 5 taps + 2 keyboards: open tablet, Inscribe, Description, Amount, Save. A different payer adds 2 taps on a native select. You have to open the right tablet first. ~20 s |
| 2 | **Glance: do I owe anyone, does anyone owe me** | daily, often just from opening the app | Home (cold start) | **0** | **< 2 s** | 0 taps, but the amounts read `₹13,425.00` and the people list sits below a spending card |
| 3 | **Check a tablet's recent expenses** ("did Meera add the dinner?") | 2-5 a week | Home → tablet row | **1** | **< 3 s**, 7 rows above the fold | 1 tap + scroll ~1.2 screens: expenses start at y=1005 in a 1678px page on an 839px screen, under the standing card, the reckoning and the chart |
| 4 | **See who paid for something** | with #3 | Expense row subtitle | **0** extra | instant | 0 extra, after the scroll in #3 |
| 5 | **Settle with a person** | 1-4 a month | Home → person row, or tablet header `Settle up` | **3** (person, Settle, Record) | **< 10 s** | 3 taps from the right tablet. With more than one debt you have to work two dropdowns. No way to start from the person |
| 6 | **Find an old expense** ("what did we pay for the plumber in March?") | 1-3 a month | Tablet → search icon | **2** + 3-4 letters | **< 6 s** | No search. Scroll the whole tablet. The full ledger is rendered at once, so this gets worse with every entry |
| 7 | **Review spending** | monthly, occasional | Tablet → Spending tab; your own on Your seal | **2** | < 5 s | 1 tap + scroll a screen. Month↔Week flashes the bubble (the resource reloads, the chart unmounts and remounts) |
| 8 | **Manage members** (add, see who's in, leave) | rare: when a tablet starts, plus 1-2 later | Tablet → `⋯` → Members / Add a name | 2 | < 15 s with search | 1 tap (it takes a big button in the standing card on every visit). The search sheet jumps as results arrive |
| 9 | **First run, invited by a friend** | once per user, decides whether they stay | Invite link → sign-up → that tablet | **2 screens, 1 form** | **< 60 s** | **No invite flow exists.** The friend has to say "join Clay, tell me your username". The new user registers, messages back, waits to be added, then finds the tablet. Minutes to days |

Rule I used: the more often a job happens, the fewer taps it gets and the closer it sits to
the thumb. Jobs 1-4 are the product. Jobs 7-8 may not take space from them.

---

## 2. Personas and their weeks

Each step says what they **expect**, what they **try first** (the gesture they reach for
before reading anything), and what Clay should **remember or suggest**. Clay's memory
lives in `SPEC.md §4 (Memory)`. Every "remember" below maps to one rule there.

### P1 · Flat 4B: three flatmates with monthly bills

**Kabir (28), Arjun (27), you (Ashu, 29).** Bengaluru 3BHK, 2.5 years on Clay, about 1,240
inscriptions. Rent ₹45,000 (Kabir pays the landlord), electricity ₹2,600-4,000 (whoever
gets the bill), WiFi ₹1,199 (you, autopay), gas cylinder ₹1,050 every 6 weeks, plus
groceries and Swiggy Instamart. The real pain is the 1st of the month and "did anyone add
the electricity?".

| When | Step | Expects | Tries first | Clay remembers / suggests |
|---|---|---|---|---|
| Sat 1 Nov, 09:10 | Kabir pays rent and opens Clay | Logging rent takes seconds; it's the same every month | Taps `Inscribe` on Home | The **last tablet he added to** is preselected (Flat 4B). Typing `Ren` matches **Rent, October**. Clay fills ₹45,000, payer Kabir, split equally 3, and says so in a blue strip with **Undo** (`add-expense-repeat.html`). He changes the note to "Rent, November" and taps Save: 3 taps, about 6 s |
| Sat 1 Nov | You get the push "Kabir added Rent" | See your share without hunting | Opens the app: Home | Home shows Flat 4B on top (latest activity), subtitle `Kabir · Rent, November ₹45,000 · 2m`, standing `you owe ₹15,000`. 0 taps |
| Mon 3 Nov | WiFi autopay, you log it | Same as last month | `Inscribe`, types `wi` | Suggestion chip **WiFi** (frequent here). Tapping it fills ₹1,199, payer **you**, split 3, all from last time. Save. **Do not** fill the date from last time: date is always today unless changed |
| Wed 12 Nov | Arjun pays electricity | Amount differs every month | `Inscribe`, `ele` | Fills payer and split from last time but **not the amount**: Clay only refills an amount when the last 3 entries with that note had the same amount (rent, WiFi), else it keeps what was typed. Amount-first means he typed ₹2,640 before the note, and the match never overwrites a typed amount |
| Sun 16 Nov | "Who paid the gas last time?" | Find it without scrolling 1,200 rows | Opens Flat 4B, taps 🔍 | Search across the tablet, results by year, chips `Paid by me / I'm in it / Payments`. `gas` → 19 results, newest first; the top row says `Arjun paid ₹1,050 · 2 Oct` (`search.html`) |
| 30 Nov | Month-end settle | "Who owes whom, one payment each" | Flat 4B → Balances tab | Hammurabi's shortcut is on by default (remembered per tablet). Each row with you in it has an inline **Settle**. It opens prefilled, then Record |
| Any day | Scrolls back to see March's bills | Smooth, no "load more" button | Flings the Inscriptions list | Pages of 50 load before they're needed; sticky month header `March 2026 · ₹61,300 · 44`; tapping it opens **Jump to a month** (`month-jump.html`) |

**What this persona taught the design:** monthly repeats are most of their adds, so
**note-matched refill** (payer + split, and amount only when stable) beats a generic
"recurring expenses" feature. It costs no setup and nothing fires on its own. Search and
jump-to-month must work on 1,000+ rows, which forces the paginated list.

### P2 · Goa Trip: five friends, adding on the go, settling at the end

**Meera (organiser), Arjun, Kabir, Riya, you.** 17-21 Nov. About 35 inscriptions in 5
days, added on patchy 4G at beaches and bars, often by whoever paid, sometimes later from
memory. Not everyone joins everything: parasailing was 3 people, drinks 3. Settle-up
happens on the last evening or the week after.

| When | Step | Expects | Tries first | Clay remembers / suggests |
|---|---|---|---|---|
| Day 0 | Meera creates Goa Trip, adds 4 names | Find friends fast; no invite dance for those already on Clay | `+ New tablet` → name → **Add names** | Member search opens **full height, top-anchored**, already listing **people you share tablets with** (from cache, 0 ms). Typing filters them at once; "Others on Clay" fills a reserved slot (`member-search.html`). For Riya, who isn't on Clay: **Copy invite link** (P4) |
| Day 1, 13:40 | Meera pays the villa deposit ₹20,000 | Log it on the street in 10 s | `Inscribe` (Home or tablet) | Tablet preselected: the one she's **inside**, else the **last one added to** (Goa). Payer **You** by default. Split **equally among all 5**. Save |
| Day 2, 18:30 | Kabir logs parasailing, 3 of 5 | Exclude 2 people quickly | `Inscribe`, ₹9,600, `Para…`, taps the `Split · Equally 5` chip | Split sheet: avatars as toggles, all on. He taps 2 off; the preview reads `₹3,200 each · 3 people`. Save |
| Day 2, 21:10 | Kabir logs drinks for the same 3 | The same 3 again | `Inscribe` | Because his **last add in this tablet, within 3 hours,** used a custom split, a chip **Same 3 as Parasailing** sits next to the split chip. One tap. Never applied silently: everyone-equal stays the default, so the chip can't cause a wrong split |
| Day 3, offline | You add scooter fuel on no signal | It doesn't vanish or error | `Inscribe` → Save | Optimistic row appears at once with `saving…`; the request waits in an outbox with an idempotency key and retries on reconnect. If it finally fails, the row turns red with **Retry / Edit**. Never silently dropped (`list-states.html` #2) |
| Day 3 | "Did Meera add yesterday's breakfast?" | Open tablet, see it | Taps Goa Trip | Inscriptions tab is the default and starts at y≈300. Row subtitle `Arjun paid ₹2,400` answers "who paid" with 0 taps |
| Day 5, evening | Settle up | One clear number each, fewest transfers | Goa Trip → `Settle up` in the header | Settle sheet lists **your** simplified transfers as radio cards (`You pay Arjun ₹4,400`, `You pay Meera ₹1,400`), first one preselected, amount prefilled, one Record (`settle.html`). After Record: toast with Undo; standing animates from ₹5,800 to ₹1,400 |
| Week after | "How much did the trip cost me?" | One number | Goa Trip → Spending | Spending tab headline `Trip total ₹57,000 · your share ₹14,250`. The chart picks **Day** buckets automatically because the tablet spans under 21 days, and the axis starts at the tablet's first inscription, not 12 empty months (`group-spending.html`) |

**What this persona taught the design:** adds happen standing up, one-handed, often
offline, so we need amount-first input on a fixed keypad (no layout jump when a keyboard
opens), optimistic save with an outbox, and a split change that is one sheet away. The
default stays "everyone, equally" because a silently remembered subset is the worst bug a
money app can have. The remembered subset is offered as a chip.

### P3 · Riya & me: a couple

**You and Riya.** One shared tablet, ~60 inscriptions a month: groceries (Zepto, Blinkit),
dinners, cabs, Netflix, occasional "I paid for your thing". Nobody wants to feel like an
accountant; settling is a monthly UPI transfer "to make it even".

| When | Step | Expects | Tries first | Clay remembers / suggests |
|---|---|---|---|---|
| Daily | Logs Zepto ₹840 | The fastest possible path; it's always this tablet | `Inscribe` on Home | With only one active tablet, Home's `Inscribe` goes straight to it. The tablet chip is shown but needs no tap. Payer You, split 50/50. Chips: `Zepto`, `Blinkit`, `Dinner`, `Uber` (most-used notes in this tablet, last 60 days) |
| Weekly | "I paid for Riya's haircut, all of it" | Not 50/50 | Split chip | The split sheet's top row has three one-tap presets for 2-person tablets: **Equally** · **Riya owes all** · **I owe all**. They map to existing `exact` splits; no new server mode |
| Weekly | Riya logs and you glance | Who's ahead right now | Opens app | Home hero: `₹420 owed to you, net`. Person row `Riya · owes you ₹420` |
| Month end | Even it out | One tap amount, then pay on UPI | Home → Riya → **Settle** | Person view (`person.html`) shows per-tablet balance with Settle. Copy: "Clay only writes it down. Pay Riya the way you usually do." |
| Sometimes | "What did we spend on food delivery in October?" | A number | Search `zepto` with `Any time ▾` set to October | Search count slot: `14 matches · ₹9,860 in total`. The total is the answer, so it's always shown |

**What this persona taught the design:** two-person tablets need the "paid for the other
person" preset and nothing else; the global `Inscribe` should skip tablet choice when
there's only one live tablet; the search result **total** is a feature, not decoration.

### P4 · First-timer: Dev, invited by Meera

**Dev (31)** has never heard of Clay. Meera adds the Goa dinner and wants Dev's ₹3,000.
Dev will give Clay about one minute before going back to WhatsApp.

| When | Step | Expects | Tries first | Clay remembers / suggests |
|---|---|---|---|---|
| T+0 | Meera taps **Copy invite link** in Add a name (no result for "dev") or in `⋯ → Members` | A link to paste in WhatsApp | Pastes it | Link `…/clay/#/join/<token>`. The token is single-tablet and expires in 14 days. Meera can revoke it in Members |
| T+5 s | Dev opens the link on his phone | See what this is before signing up | Reads | Landing (no auth): "**Meera** invited you to **Goa Trip** on Clay. 4 people · 1 inscription." One form: username + password (passkey later), with password-manager autofill. No email step |
| T+40 s | Signs up | Land where the money is | — | Server joins him to the tablet in the same transaction and routes to `/g/<id>`. **Welcome card** (`invite-landing.html`): "Meera added you to Goa Trip. You're on 1 inscription so far… **How the ₹3,000 adds up** · Got it". The card is dismissible and shown once per invited tablet |
| T+1 min | Wants to add the cab he paid for | Obvious button | `Inscribe` (the only filled button) | Same 3-tap flow. The note field shows a one-time hint "What was it for? e.g. Cab". No tour, no carousel |
| Day 2 | Opens Clay from the home-screen prompt | Same place | — | After the first add, a one-time inline banner on Home: "Add Clay to your home screen" (the PWA install prompt), never a modal |

**What this persona taught the design:** the invite link is the single biggest missing
feature. It turns a days-long dance into under a minute. The first screen after sign-up
must be the tablet with the debt explained, not an empty Home.

---

## 3. Target vs current, summed

Weighting each job by weekly frequency for a typical active user (P1/P3 blend: ~8 adds,
5 glances, 3 tablet checks, 0.5 settles, 0.5 searches, 0.25 reviews per week):

| | Current (est.) | Target |
|---|---|---|
| Taps per week | ~70 + ~10 scroll flings | ~33, no scrolls needed for any top-4 job |
| Time per week in Clay | ~4.5 min | ~1.5 min |
| Worst single job | Find an old expense: unbounded scroll; first run: minutes to days | 6 s; 60 s |

The time saved comes almost all from jobs 1 and 3 (the add flow and Inscriptions being
the default tab), which is why `IA.md` spends its space there.

## 4. If the critic's timings differ

These current costs are my own walk-through, not stopwatch timings. If the separate
critic's measured report disagrees, its numbers win for the "Current" column. The targets
and the ranking stay unless it shows a job is more or less frequent than assumed.
