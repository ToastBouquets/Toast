# Toast Bouquets — Launch Guide

Everything you need to take the site live: connect the quote form (Formspree),
publish (GitHub Pages), and pass a security/launch check.

The site is a **plain static HTML/CSS/JavaScript website** — no framework, no
build step, no server. That's why Formspree + GitHub Pages is the right, simple,
low-cost fit.

**You edit exactly ONE line to make the form live:** the Formspree endpoint in
`js/quote-form.js`. Until you do, the form is in safe **demo mode** (shows the
success screen but sends nothing).

---

## 1. Connect the quote form with Formspree

**Is Formspree the right choice?** Yes. It's built for exactly this — a static
site that needs a form to email you and store submissions, with spam filtering,
no backend, and no exposed secrets. (The form endpoint in your code is public by
design and safe; it only lets people *submit*, not read anything.)

### Setup
1. Go to **https://formspree.io** → **Sign up** (free "Free" plan).
2. **+ New form** → name it `Toast Bouquets Quotes` → set the notification email
   to where you want alerts (e.g. `toastbouquets@gmail.com`) → **Create form**.
3. On the form's page, find the **endpoint** — it looks like
   `https://formspree.io/f/abcdwxyz`. Copy it.
4. Open **`js/quote-form.js`** and paste it into the top:
   ```js
   var TB_CONFIG = {
     FORMSPREE_ENDPOINT: 'https://formspree.io/f/abcdwxyz'
   };
   ```
   Save. The demo banner disappears; the form now sends for real.

### Notification settings to enable (in Formspree)
- **Email notifications:** ON (to your address).
- **reCAPTCHA / spam filtering:** ON (default). The form also has a built-in
  hidden "honeypot" field that traps most bots before they reach Formspree.
- **Autoresponse (optional):** you can turn on a "thank you" email to the
  customer using their submitted email.

### What each submission includes
Name, Email, Phone, Order type, Requested date, Budget, Submission date/time,
and the page source — all with clear labels in your dashboard and email.

### Testing
1. After pasting the endpoint and re-publishing, open your live site.
2. Submit a real test quote. **First submission triggers a one-time Formspree
   confirmation email — click the link to verify the form.**
3. Confirm you got the notification email and that it appears in your Formspree
   dashboard under **Submissions**.

### Free plan, limits, storage, backups
- **Free plan:** 50 submissions/month, spam filtering, email notifications,
  submissions dashboard.
- **If you hit the limit:** extra submissions that month are blocked/held until
  the count resets or you upgrade (paid plans raise the cap). For ~45/month
  you're right at the edge — watch it, and upgrade if you grow.
- **Storage:** Formspree stores your submissions in your dashboard. **Export /
  back up** anytime from the dashboard (CSV). Do this monthly so you always have
  your own copy.
- **Custom domain / verification:** no domain setup needed for Formspree itself;
  the one-time email verification above is all that's required.

---

## 2. Publish with GitHub Pages

GitHub Pages is perfect here because the site is static (no server code).

### Create the account & repo
1. Sign up at **https://github.com** → verify your email.
2. **Turn on two-factor authentication** (Settings → Password and authentication)
   — do this before anything else.
3. **New repository** → name it e.g. `toast-bouquets` → **Public** → Create.

### Upload the site (no command line needed)
1. On the empty repo page → **uploading an existing file**.
2. Drag in the **contents** of the `toast-bouquets-website` folder (so
   `index.html` sits at the top level of the repo, not inside a subfolder).
   The included `.gitignore` keeps backups/scratch out.
3. **Commit changes.**

### Turn on Pages
1. Repo **Settings → Pages**.
2. **Source:** Deploy from a branch → **Branch:** `main` → **Folder:** `/ (root)`
   → **Save**.
3. Wait ~1 minute. Your site is live at
   `https://<your-username>.github.io/toast-bouquets/`.
4. HTTPS is automatic on github.io — no action needed.

### Custom domain (optional, later)
1. Buy a domain (Namecheap, Google Domains, etc.).
2. Settings → Pages → **Custom domain** → enter it → Save.
3. At your domain registrar, add the DNS records GitHub shows (A records for the
   apex, or a CNAME to `<username>.github.io`).
4. Check **Enforce HTTPS** once the certificate is issued.

### Updating the site later
Edit the file on GitHub (or re-upload) and commit — Pages redeploys in ~1 min.

### Rolling back a broken update
Repo → **Commits** → open the last good commit → **Revert**, or restore that
version. Pages redeploys the previous version automatically.

> **Asset paths:** all links in the site are already relative (`images/…`,
> `js/…`, `css/…`), so they work correctly on GitHub Pages with no changes.

---

## 3. Security & launch-readiness audit

What I checked in this project and the status:

- **No exposed secrets.** The Formspree endpoint is public by design and is
  safe (submit-only). There are no passwords, private API keys, or database
  secrets anywhere in the code. *(Important truth: any key placed in a static
  site's code is readable by visitors — so we deliberately use a service, like
  Formspree, that has no secret key to hide.)*
- **Form handling:** client-side validation on every field, a loading state, and
  a double-submit lock so repeated clicks can't create duplicates.
- **Spam/bots:** hidden honeypot field + Formspree's reCAPTCHA. Turn on Turnstile
  only if you later get spam.
- **XSS / unescaped input:** the site doesn't render user input back onto the
  page, so there's no injection surface. Submissions go straight to Formspree.
- **Mixed content / external scripts:** all resources load over HTTPS
  (Google Fonts, Leaflet map, Formspree, Supabase CDN — the last is only used if
  configured; you can remove it since we moved to Formspree, see note below).
- **Data minimization:** we collect only what a quote needs — name, phone,
  email, order type, date, budget. The optional "message" field was removed.
- **Accessibility/SEO:** page has a title + meta description; images have alt
  text; touch targets on mobile are large (≥44px). 
- **No admin page:** the old private dashboard was removed, so there is no
  publicly reachable admin surface to leak.

### Recommended protections (practical)
- HTTPS (automatic on GitHub Pages) ✓
- Formspree spam filtering ON ✓
- GitHub two-factor authentication ✓
- Monthly CSV export/backup of submissions ✓
- Add Cloudflare Turnstile/CAPTCHA **only if** you start seeing spam.

### What your Privacy Policy should honestly say
Update `privacy-policy.html` to disclose only what's true:
- **Quote form:** "When you request a quote we collect your name, phone, email,
  and order details, and use them only to prepare and follow up on your quote."
- **Formspree:** "Form submissions are processed and stored by our form provider,
  Formspree, on our behalf."
- **Google reviews:** if/when you display Google reviews, "We display public
  reviews from our Google Business Profile."
- **Analytics/cookies:** the site currently uses **no analytics and sets no
  cookies** — say that. If you add Google Analytics later, update this.
- **Map:** "Our service-area map is provided by OpenStreetMap/Leaflet."
Do not promise encryption-at-rest, deletion timelines, or certifications you
can't guarantee.

> **Optional cleanup:** since we switched to Formspree, the Supabase `<script>`
> tag in `index.html` is no longer needed. It's harmless (loads over HTTPS and is
> unused), but you can delete the line
> `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2...">` if you
> want the code fully tidy. Tell me and I'll remove it.

---

## 4. Pre-launch checklist
- [ ] Pasted Formspree endpoint into `js/quote-form.js`
- [ ] Submitted a test quote and clicked the Formspree verification email
- [ ] Got the notification email; submission shows in Formspree dashboard
- [ ] Real Google reviews added (send me your Google Business Profile link)
- [ ] Updated `privacy-policy.html` per the notes above
- [ ] GitHub 2FA enabled
- [ ] Site uploaded; Pages enabled on `main` / root; loads over HTTPS

## 5. Post-launch test checklist
- [ ] Form works from a phone on cellular (not just your computer)
- [ ] Widths 320 / 375 / 390 / 430 / 768 / desktop — no sideways scrolling
- [ ] Mobile hamburger menu opens with the dark-green glass panel, right-aligned
- [ ] "Get a Free Quote" and the phone link work from inside the menu
- [ ] All "Get a Quote" buttons scroll to the form
- [ ] Map, gallery lightbox, and reviews animation all work
- [ ] A second rapid double-click on submit does NOT create two entries

---

### Accounts you need to create
1. **Formspree** (free) — for the quote form.
2. **GitHub** (free) — to publish.
That's it. No database, no server, no monthly cost to start.

### What I still need from you
- Your **Google Business Profile link** (to add the real reviews).
- Your **Formspree endpoint** (after step 1) — or paste it in yourself.
- Your GitHub username / custom domain, if you'd like tailored publish steps.
