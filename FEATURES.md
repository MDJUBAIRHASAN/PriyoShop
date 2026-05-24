# PriyoShop Prototype — Product & Feature Overview

An interactive prototype of the PriyoShop retailer app, built for the **Product Peers BD — Product
Case Study Contest 2.0** by **Team Underdogs**.

**Live demo:** https://priyoshop-team-underdogs.netlify.app

---

## The problem we are solving

> *How can PriyoShop get more app users from non-tech-savvy retailers?*

PriyoShop's retailers are often older shopkeepers with low tech confidence. They prefer ordering
manually (over phone / agent), fear making mistakes in the app, and face language and usability
barriers. The app exists, but adoption stalls because using it *feels* harder and riskier than the
old way.

**Our answer:** make the app feel safe, familiar, rewarding, and human. Every feature below is
designed to remove a specific fear or friction for a non-tech-savvy retailer. The entire interface
is in **Bengali with Bangla numerals**, because the audience is older and not comfortable in English.

---

## What the prototype is

A fully clickable, phone-sized prototype of the retailer app. It opens with a PriyoShop intro
splash, then a home screen, and lets a reviewer tap through real shopping flows plus 10 product
ideas. It runs entirely in the browser — no login, no setup. On a wide desktop screen, context
panels appear on either side of the phone (the problem statement on the left, Team Underdogs on the
right); on a phone, only the app shows.

---

## The 10 product ideas (what each one does and why)

### 1. Voice Ordering (ভয়েস অর্ডার)
The retailer can order by **speaking** instead of typing or searching. A mic flow captures the
request and turns it into a reviewable order list before checkout.
**Why:** typing Bengali product names and navigating menus is the single biggest barrier for an
older shopkeeper. Talking is how they already order today.

### 2. Digital Bhai — তালহা ভাই (human-feeling support)
Not a faceless chatbot — a **named assistant, তালহা ভাই**, who greets the retailer personally,
chats, and can be **called** like a real person. If the retailer sends a **voice message**, তালহা ভাই
**replies in voice** too.
**Why:** retailers trust people, not apps. A familiar "bhai" who talks back (and can read answers
aloud for those who struggle to read) makes the app feel like a relationship, not a form. The help
button is a single clear icon so it's never confusing.

### 3. Local Bazaar Community (এলাকার বাজার কমিউনিটি)
Retailers join a community of nearby shops, see a **leaderboard**, earn **badges** (consistent
buyer, top digital adopter, area champion…), and take part in **challenges** (e.g. "5 orders this
week", "order 3 days in a row").
**Why:** social proof and friendly competition. Seeing neighbors use the app — and climbing a local
ranking — makes adoption feel normal and motivating.

### 4. Spin-the-Wheel Reward (স্পিন করে জিতুন)
After hitting an order milestone, the retailer unlocks a **spin** with exciting prizes — cashback
(৳50–৳500), bonus points, and festival-themed rewards (Eid bonus). No dull prizes.
**Why:** a small surprise reward turns repeat ordering into a habit and gives a reason to come back
to the app instead of calling an agent.

### 5. Editable Order Window (অর্ডার পরিবর্তন)
After placing an order, the retailer gets a short **window to modify or cancel** it — visible as a
status pill across the app, counting down.
**Why:** fear of mistakes is a top reason retailers avoid self-service. A safety net ("I can still
fix it") removes that fear and builds confidence to order on their own.

### 6. 1-Tap Reorder (এক ট্যাপে আবার অর্ডার)
The retailer's last order can be repeated in **one tap**. A reconciled review screen lets them
adjust quantities or swap alternatives before confirming.
**Why:** most shop restocking is the same items every week. One tap beats rebuilding the cart and
beats phoning an agent.

### 8. App-Exclusive Rewards (পয়েন্ট ও ক্যাশব্যাক)
A points + tier program — **Silver / Gold / Platinum** — with rising benefits (cashback %, free
delivery, priority support). Points are earned on orders and can be **redeemed** for vouchers.
Tier upgrades are celebrated.
**Why:** concrete, app-only value the retailer *loses* by ordering the old way. It makes the app the
cheaper, smarter channel.

### 9. Simple Mode (সহজ মোড / বড় লেখা)
A toggle (in the side menu) that switches the app to a **large-text, simplified** layout with a
focused home and order-modification status shown clearly.
**Why:** directly addresses low vision and low tech confidence. The retailer can shrink the app down
to only what matters, with big readable text.

### Plus, a complete shopping experience
On top of the ideas, the prototype includes the full retail flow so the ideas have a real home:
- **Home** with a clickable hero carousel (rice / offers / new arrivals) that deep-links into the
  right category.
- **Categories, All Products, Search, Product Detail** with quantity controls and add-to-cart.
- **Brands page** with real brand logos (and a few branded wordmark tiles).
- **Cart → Checkout** with a delivery-guarantee notice and a delivery note.
- **Order success, order list/detail, modify order, reorder, report issue.**
- **Account, addresses, notifications, referral, rewards, policies.**

---

## The retailer journey (typical demo path)

1. App opens with the PriyoShop splash → lands on the Bengali home screen.
2. Retailer reorders last week's stock in one tap (Idea 6) — or speaks the order (Idea 1).
3. Worried about a mistake? The editable-order pill shows there's still time to change it (Idea 5).
4. Confused? Tap তালহা ভাই, chat or call a real-feeling assistant (Idea 2).
5. Order completes → points added, maybe a tier upgrade, maybe a spin unlocked (Ideas 8 & 4).
6. Retailer checks the local leaderboard and joins a weekly challenge (Idea 3).
7. Older retailer turns on Simple Mode for big, easy text (Idea 9).

Each step replaces a reason a non-tech-savvy retailer would otherwise avoid the app.

---

## Design choices that serve the audience

- **Bengali everywhere, Bangla numerals everywhere** — never English digits or labels in the UI.
- **Human over robotic** — named assistant, voice replies, friendly community.
- **Safety over speed** — editable window and clear confirmations reduce fear of mistakes.
- **Familiar over novel** — mirrors how shopkeepers already order (talking, repeating, asking a bhai).
- **Rewarding** — points, tiers, spins, badges give continuous reasons to return.
- **Polished & professional** — clean glassmorphism UI, branded splash, no clutter on the home screen.

---

## Notes for reviewers

This is a **front-end prototype** to demonstrate the product experience and the 10 ideas. Data is
illustrative (orders, points, leaderboard are sample data), voice/AI flows are simulated for the
demo, and there is no live backend. The goal is to show *how the experience feels* to a retailer —
which is exactly what drives adoption.

For technical/architecture details, ask the team — this document focuses on the product and its
features.
