**EnrollAxis: account creation flow, UI brief for Figma (24 Nov 2026)**

**Goal:** design every screen and email a person sees from "someone added me to EnrollAxis" to "I am signed in and on my first page". Covers agents and agency admins (invited), carrier staff (added by an admin) and password reset. Frame ids `ACC-01` onwards; they sit next to the existing `SSO-01` to `SSO-06` frames (sign-in, carrier, portal access, landing).

**Ground rules**
- **AaNeel SSO is the login page.** We never design a username/password sign-in form; "Sign in" always hands off to AaNeel SSO (outside EnrollAxis, not ours to design).
- **EnrollAxis never stores a password.** The only password screen we own is "Set your password" (ACC-06), which passes the password straight to AaNeel SSO. AaNeel SSO decides the password rules; we only show which rule failed.
- **The invitation link is open** (no sign-in) but only shows the invitation and an Accept button. **Onboarding needs sign-in from the first step** (it collects SSN, bank details and ID).
- One person = one AaNeel account, even across carriers. Someone who already has an AaNeel account never sets a new password; they just sign in.
- Synthetic data only in designs (for example Sandra Adams, Gold Kidney Health Plan, NPN 9900000001, phone (555) 555-0142, emails on example.com).

**The flows at a glance**

```
A. Invited agent or agency admin
   [ACC-E1 invitation email] -> ACC-01 Invitation -> Accept
        new AaNeel account      -> ACC-06 Set your password -> ACC-07 Password set -> AaNeel sign-in
        existing AaNeel account -> ACC-03 Sign in to continue -> AaNeel sign-in
   -> SSO-02/03 signing in, carrier -> Onboarding welcome (existing EN-168 screens)

B. Carrier staff added by an admin
   ACC-10 Add user (admin) -> ACC-11 User added -> [ACC-E2 set-password email]
   -> ACC-06 -> ACC-07 -> AaNeel sign-in -> SSO-02..05 landing

C. Forgotten password / reset by admin
   ACC-12 Send reset link (admin)  or  "Forgot password" on AaNeel sign-in
   -> [ACC-E3 reset email] -> ACC-06 -> ACC-07 -> AaNeel sign-in

D. Inviting someone (admin side)
   ACC-20 Invite agent / agency -> ACC-21 Invitation sent -> ACC-22 Invitations list
```

---

**Part 1: Invitee screens (signed out)**

Layout for all signed-out screens: the branded sign-in layout already used by SSO-01 to SSO-04 (EnrollAxis logo, carrier branding where known, centred card, "Powered by AaNeel" footer). Card max width 440 px desktop, full width with 16 px gutters on phone.

**ACC-01 Invitation** (`/invite`)
- Heading: "You're invited to EnrollAxis"
- Intro: "{Inviter name} from {Agency name} has invited you to join {Carrier name}."
- Detail list (read-only): Carrier; Agency (upline); Hierarchy level (for example GA); Role (Agent or Agency Admin); Plan year; Invitation expires ({date, time, time zone}).
- Email it was sent to: "This invitation is for {email}." with a small help text "Not you? Ignore this email or contact {support email}."
- Primary button: **Accept invitation**. Secondary text link: "Decline" (opens ACC-01d).
- Short "What happens next" list: 1. Accept. 2. Set your password (new users) or sign in. 3. Complete your onboarding: details, licences, training, contract.
- States:
    - **ACC-01a Loading:** skeleton of the card while the link is checked.
    - **ACC-01b Expired:** "This invitation has expired" + "Ask {inviter / agency} to send a new one." + Contact support.
    - **ACC-01c Already used:** "This invitation has already been accepted" + **Sign in** button.
    - **ACC-01d Decline confirm:** dialog "Decline this invitation?" with optional reason (text, 250 chars), Decline / Cancel; then "Invitation declined" message.
    - **ACC-01e Cancelled or invalid link:** "This invitation is no longer valid" (same text for cancelled, wrong or broken links) + Contact support.
    - **ACC-01f Accepting:** button shows spinner "Accepting...", card disabled.
    - **ACC-01g Something went wrong:** inline error banner "We couldn't accept the invitation. Try again in a few minutes." + Try again.

**ACC-02 Creating your account** (short loader after Accept, usually under 2 s)
- "Setting up your account..." with spinner. No buttons. Then goes to ACC-06 (new account) or ACC-03 (existing account) automatically.

**ACC-03 Sign in to continue** (existing AaNeel account)
- Heading: "Sign in to continue"
- Text: "You already have an AaNeel account for {email}. Sign in with it to start your onboarding with {Carrier}."
- Primary button: **Sign in with AaNeel**. Help link: "Forgot your password?" (goes to AaNeel SSO's forgot password).

**ACC-06 Set your password** (`/set-password`; already built in code, needs the final design)
- Heading: "Set your password"
- Text: "Choose the password for your AaNeel account. You will use it to sign in to EnrollAxis."
- Fields: **New password** (show/hide eye button), help text under it: "AaNeel password rules apply. If a rule isn't met, you'll see which one."; **Confirm password** (show/hide).
- Optional (nice to have): a neutral checklist that fills in as the user types is **not** possible, because the rules live in AaNeel SSO; design the error list instead.
- Primary button: **Set password** (full width); loading state "Setting password...".
- States:
    - **ACC-06a Rules not met:** field error under New password listing each broken rule on its own line, for example "Use a longer password." "Include at least one number (0-9)." "Include at least one uppercase letter (A-Z)." "Include at least one lowercase letter (a-z)." "Include at least one symbol, such as ! or #." Fallback: "The password does not meet the sign-in rules."
    - **ACC-06b Passwords don't match:** error under Confirm password "The passwords do not match."
    - **ACC-06c Empty fields:** "Enter a new password." / "Enter the password again."
    - **ACC-06d Link can't be used** (expired, already used or broken; replaces the form): heading "This link can't be used", text "Set-password links work once and expire. Ask your administrator to send you a new one. If you already set your password, sign in." Button **Go to sign in** (outline).
    - **ACC-06e Service unavailable:** red alert at the top of the form "The sign-in service is not available. Try again in a few minutes." Form stays filled.
    - **ACC-06f Too many attempts:** alert "Too many attempts. Wait a minute, then try again."

**ACC-07 Password set**
- Heading: "Your password is set"
- Text: "Sign in with your AaNeel account: your email address and the password you just chose."
- Primary button: **Sign in** (goes to AaNeel SSO, then back into EnrollAxis).

After sign-in the existing screens continue: SSO-02 signing in, SSO-03 choose carrier (only with more than one), then the **Onboarding welcome** for invited agents (EN-168 screens) or the area landing (SSO-05) for staff.

---

**Part 2: Emails** (content rules in `email-set-first-password-brief.md`: transactional, no PHI, one button plus the plain link, plain-text version, WCAG AA, 14 px minimum, EnrollAxis logo, teal button)

**ACC-E1 Invitation email** (agents and agency admins)
- Subject: "You're invited to join {Carrier name} on EnrollAxis"
- Preheader: "{Inviter name} invited you to start your contracting with {Carrier name}."
- Body: greeting; who invited them, carrier, agency, level, role; button **View invitation**; "This link expires in {72} hours ({date time})."; plain link; support contact; footer.

**ACC-E2 Set your password** (carrier staff added by an admin)
- Subject: "Set your EnrollAxis password"
- Body: "{Admin name} has set up your EnrollAxis account for {Carrier} as {Role}."; button **Set your password**; expiry line; "After you set your password: go to {portal URL} and sign in with your AaNeel account {email}."

**ACC-E3 Reset your password** (admin-requested reset; SSO's own forgot-password email is AaNeel's)
- Subject: "Reset your EnrollAxis password"
- Body: "{Admin name} asked for a password reset for your account."; button **Choose a new password**; expiry; "If you didn't expect this, contact {support}."

**ACC-E4 Invitation reminder / expiring soon** (optional, same layout as E1, subject "Your invitation to {Carrier} expires soon").

---

**Part 3: Admin screens (signed in, inside the portal shell)**

**ACC-10 Add user** (carrier staff; payer area, Administration > Users > Add user; side panel or page)
- Fields: First name*, Last name*, Email*, Phone (optional), Role(s)* (multi-select: Payer Admin, Broker Support / Sales Ops, Finance, Compliance, Enrollment Ops, Sales Leadership, System Admin), Status (Active by default).
- Info strip: "We'll create their AaNeel sign-in and email them a link to set their password."
- Buttons: **Add user**, Cancel.
- Errors: "A user with this email already exists in {Carrier}." (field), "The sign-in service couldn't create the account. Try again later." (banner). Email of an existing AaNeel account is fine: info "This person already has an AaNeel account; they'll sign in with it."

**ACC-11 User added** (toast or confirmation)
- "{Name} added. We emailed them a link to set their password." Action: "View user".

**ACC-12 User detail actions** (on the user page, `/users/{id}` today, later under the payer area)
- Status badge: **Invited** (no sign-in yet), **Active**, **Switched off**. Last sign-in shown (sign-in history card already built).
- Actions menu: **Resend set-password link** (only while Invited), **Send password reset link**, **Switch off / Switch on**.
- Confirm dialog for reset: "Send a password reset link to {email}? Their current password keeps working until they set a new one." Send / Cancel. Toast "Reset link sent."

**ACC-20 Invite agent or agency admin** (agent area for agency admins; payer area for Broker Support; EN-14)
- Fields: Invite as* (Agent / Agency Admin), First name*, Last name*, Email*, NPN (optional, 8-10 digits; "We check this against agents already with {Carrier}"), Upline agency* (only agencies in your downline), Hierarchy level* (only levels below the inviter's own), Plan year*, Link expires in (default 72 hours, from carrier settings), Personal note (optional, 500 chars).
- Duplicate warnings: "This NPN is already active with {Carrier}." (blocks), "An EnrollAxis user with this email already exists in {Carrier}." (warning).
- Buttons: **Send invitation**, Save as draft, Cancel.

**ACC-21 Invitation sent**: toast "Invitation sent to {email}. It expires on {date}."

**ACC-22 Invitations list** (EN-15 owns the full dashboard; design at least the row and statuses)
- Columns: Name, Email, Role, Level, Upline, Sent, Expires, Status, Actions.
- Status badges: Draft, Sent, Opened, Accepted, Expired, Cancelled, Declined (BRD PO-05 calls it "Rejected"; who can reject is still open with the BA, so show it as the invitee declining for now).
- Row actions: Resend (Sent, Expired), Cancel (Sent), View activity.

---

**Part 4: Edge cases to show somewhere (annotations are fine)**
- The same person invited by a second carrier: accepting goes to ACC-03 (sign in), not ACC-06.
- An invitation opened by an email security scanner must not count as used: status "Opened" only, link still works.
- A switched-off user opening an old link sees ACC-06d / ACC-01e (no detail about why).
- Agent and agency admin go to Onboarding after first sign-in; carrier staff go to their area landing.
- Phone: every screen at 360 px, buttons full width, no horizontal scroll.

**Style** (same as the post-SSO brief)
- Colours: primary teal `#177e71` (hover `#12655a`), accent lime `#89c765` sparingly, text `#1b1c1c`, muted `#6a716f`, border `#ced1d1`, page background `#e7e8e8`, cards white, error and success colours from the design system alert tokens.
- Fonts: Poppins headings, Inter text, nothing below 12 px (14 px in email). 4 px grid, card padding 20-24, radius 8, 44 px touch targets, visible focus, WCAG AA contrast, icons only from the design system icon set.
- One `h1` per screen (the card heading); the EnrollAxis wordmark is not a heading.

**Open points (design both where marked)**
- **Who hosts "Set your password"** is being confirmed with the SSO team: our page (ACC-06, built) or AaNeel's own reset page. Design ACC-06 anyway; if AaNeel's page is used, ACC-06 and ACC-07 drop out and the email button goes to AaNeel.
- Invitation landing lives in the portal (current plan), on the carrier's branding if available.
- Final role list for ACC-10 follows the RBAC story (EN-43).

**Frames checklist**
ACC-01, 01a-01g, ACC-02, ACC-03, ACC-06, 06a-06f, ACC-07, ACC-E1 to E4, ACC-10, ACC-11, ACC-12 (+ reset dialog), ACC-20, ACC-21, ACC-22. Desktop 1440 and phone 360 for every signed-out screen; desktop 1440 for admin screens plus one 768 example.
