import { emailLayout, S } from './layout.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── 1. Welcome email — sent on successful registration ───────────────────────

export function welcomeEmail({ firstName, email }) {
  return emailLayout({
    previewText: `Welcome to CampusChain, ${firstName}. Your campus life starts here.`,
    body: `
      <p style="${S.h1}">Welcome, ${firstName}.</p>
      <p style="${S.body}">
        Your CampusChain account is ready. You can now participate in elections,
        submit proposals, attend events, join clubs, and build your campus identity.
      </p>

      <div style="${S.card}">
        <span style="${S.label}">Your account</span>
        <p style="margin:0;font-size:14px;color:#111827;font-weight:600;">${email}</p>
      </div>

      <p style="${S.body}">Here is what you can do right away:</p>

      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        ${[
          ['Complete your profile', 'Add your bio, department, and photo'],
          ['Browse elections', 'Vote in active elections and earn XP'],
          ['Join a club', 'Find clubs that match your interests'],
          ['Check announcements', 'Stay updated with institution news'],
        ].map(([title, desc]) => `
          <tr>
            <td style="padding:6px 0;vertical-align:top;">
              <div style="width:6px;height:6px;background:#4338CA;border-radius:50%;margin:6px 8px 0 0;display:inline-block;"></div>
            </td>
            <td style="padding:6px 0;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${title}</p>
              <p style="margin:2px 0 0;font-size:12px;color:#6B7280;">${desc}</p>
            </td>
          </tr>
        `).join('')}
      </table>

      <a href="${CLIENT_URL}/dashboard" style="${S.btn}">Go to Dashboard</a>
    `,
  });
}

// ── 2. Password reset email ───────────────────────────────────────────────────

export function passwordResetEmail({ firstName, resetUrl }) {
  return emailLayout({
    previewText: 'Reset your CampusChain password. Link expires in 1 hour.',
    body: `
      <p style="${S.h1}">Reset your password</p>
      <p style="${S.body}">
        Hi ${firstName}, we received a request to reset the password for your
        CampusChain account. Click the button below to set a new password.
      </p>

      <p style="margin:0 0 24px;">
        <a href="${resetUrl}" style="${S.btn}">Reset Password</a>
      </p>

      <hr style="${S.divider}" />

      <p style="${S.muted}">
        This link expires in <strong>1 hour</strong>. If you did not request a
        password reset, you can ignore this email — your account is safe.
      </p>

      <p style="${S.muted};margin-top:8px;">
        If the button does not work, copy and paste this URL into your browser:<br/>
        <span style="color:#4338CA;word-break:break-all;">${resetUrl}</span>
      </p>
    `,
  });
}

// ── 3. Certificate issued email ───────────────────────────────────────────────

export function certificateIssuedEmail({ firstName, title, issuedBy, type, uniqueCode }) {
  const verifyUrl = `${CLIENT_URL}/verify/${uniqueCode}`;
  const typeLabel = type.charAt(0) + type.slice(1).toLowerCase();

  return emailLayout({
    previewText: `You received a ${typeLabel} certificate: ${title}`,
    body: `
      <p style="${S.h1}">Certificate issued</p>
      <p style="${S.body}">
        Congratulations, ${firstName}. A certificate has been issued to your
        CampusChain profile.
      </p>

      <div style="${S.card}">
        <span style="${S.label}">Certificate</span>
        <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#111827;">${title}</p>
        <p style="margin:0 0 10px;font-size:13px;color:#6B7280;">Issued by ${issuedBy}</p>
        <span style="${S.tag}">${typeLabel}</span>
      </div>

      <p style="${S.body}">
        Your certificate is permanently stored on your profile and can be
        independently verified using the link below.
      </p>

      <p style="margin:0 0 8px;">
        <a href="${verifyUrl}" style="${S.btn}">Verify Certificate</a>
      </p>

      <p style="${S.muted};margin-top:12px;">
        Verification URL: <span style="color:#4338CA;">${verifyUrl}</span>
      </p>
    `,
  });
}

// ── 4. Badge earned email ─────────────────────────────────────────────────────

export function badgeEarnedEmail({ firstName, badgeName, badgeCategory, xpReward }) {
  const categoryLabel = badgeCategory.charAt(0) + badgeCategory.slice(1).toLowerCase();

  return emailLayout({
    previewText: `You earned the "${badgeName}" badge and ${xpReward} XP on CampusChain.`,
    body: `
      <p style="${S.h1}">Badge earned</p>
      <p style="${S.body}">
        Well done, ${firstName}. You have earned a new badge on CampusChain.
      </p>

      <div style="${S.card};text-align:center;padding:28px 24px;">
        <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#4338CA;">
          ${badgeName}
        </p>
        <span style="${S.tag}">${categoryLabel}</span>
        <p style="margin:14px 0 0;font-size:13px;color:#6B7280;">
          + ${xpReward} XP added to your profile
        </p>
      </div>

      <p style="${S.body}">
        Keep participating in campus activities to earn more badges and climb
        the leaderboard.
      </p>

      <a href="${CLIENT_URL}/profile" style="${S.btn}">View My Profile</a>
    `,
  });
}

// ── 5. Weekly digest email ────────────────────────────────────────────────────

export function weeklyDigestEmail({
  firstName,
  xpGained,
  upcomingEvents,
  openElections,
  recentAnnouncements,
}) {
  const hasContent =
    xpGained > 0 ||
    upcomingEvents.length > 0 ||
    openElections.length > 0 ||
    recentAnnouncements.length > 0;

  return emailLayout({
    previewText: `Your CampusChain weekly update — ${upcomingEvents.length} events, ${openElections.length} elections open.`,
    body: `
      <p style="${S.h1}">Your weekly summary</p>
      <p style="${S.body}">
        Hi ${firstName}, here is what is happening on campus this week.
      </p>

      ${xpGained > 0 ? `
        <div style="${S.card};background:#EEF2FF;border-color:#C7D2FE;">
          <span style="${S.label}">XP earned this week</span>
          <p style="margin:0;font-size:28px;font-weight:700;color:#4338CA;">${xpGained} XP</p>
        </div>
      ` : ''}

      ${upcomingEvents.length > 0 ? `
        <hr style="${S.divider}" />
        <p style="${S.h2}">Upcoming events</p>
        ${upcomingEvents.map((e) => `
          <p style="margin:0 0 10px;font-size:14px;color:#374151;">
            <strong>${e.title}</strong><br/>
            <span style="font-size:12px;color:#6B7280;">${
              new Date(e.startsAt).toLocaleDateString('en-IN', {
                weekday: 'short', day: 'numeric', month: 'short',
              })
            }</span>
          </p>
        `).join('')}
      ` : ''}

      ${openElections.length > 0 ? `
        <hr style="${S.divider}" />
        <p style="${S.h2}">Elections open for voting</p>
        ${openElections.map((e) => `
          <p style="margin:0 0 10px;font-size:14px;color:#374151;">
            <strong>${e.title}</strong>
            ${e.endsAt ? `<br/><span style="font-size:12px;color:#6B7280;">Closes ${
              new Date(e.endsAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short',
              })
            }</span>` : ''}
          </p>
        `).join('')}
      ` : ''}

      ${recentAnnouncements.length > 0 ? `
        <hr style="${S.divider}" />
        <p style="${S.h2}">Recent announcements</p>
        ${recentAnnouncements.map((a) => `
          <p style="margin:0 0 8px;font-size:14px;color:#374151;">
            <strong>${a.title}</strong>
          </p>
        `).join('')}
      ` : ''}

      ${!hasContent ? `
        <p style="${S.body}">No major updates this week. Check the platform for the latest activity.</p>
      ` : ''}

      <hr style="${S.divider}" />
      <a href="${CLIENT_URL}/dashboard" style="${S.btn}">Open CampusChain</a>
    `,
  });
}

// ── 6. Grievance status update email ─────────────────────────────────────────

export function grievanceUpdateEmail({ firstName, title, status, adminNote }) {
  const statusColors = {
    UNDER_REVIEW: '#D97706',
    ESCALATED:    '#DC2626',
    RESOLVED:     '#059669',
    CLOSED:       '#6B7280',
  };
  const color = statusColors[status] ?? '#4338CA';
  const statusLabel = status.replace('_', ' ');

  return emailLayout({
    previewText: `Your grievance "${title}" is now ${statusLabel}.`,
    body: `
      <p style="${S.h1}">Grievance update</p>
      <p style="${S.body}">
        Hi ${firstName}, the status of your grievance has been updated.
      </p>

      <div style="${S.card}">
        <span style="${S.label}">Grievance</span>
        <p style="margin:0 0 10px;font-size:15px;font-weight:600;color:#111827;">${title}</p>
        <span style="display:inline-block;background:${color}15;color:${color};font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">
          ${statusLabel}
        </span>
      </div>

      ${adminNote ? `
        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:16px 20px;margin:16px 0;">
          <span style="${S.label};color:#92400E;">Note from admin</span>
          <p style="margin:0;font-size:14px;color:#78350F;line-height:1.6;">${adminNote}</p>
        </div>
      ` : ''}

      <a href="${CLIENT_URL}/grievances" style="${S.btn}">View Grievance</a>
    `,
  });
}

// ── 7. Mentorship accepted email ──────────────────────────────────────────────

export function mentorshipAcceptedEmail({ firstName, topic, mentorName }) {
  return emailLayout({
    previewText: `${mentorName} has accepted your mentorship request on "${topic}".`,
    body: `
      <p style="${S.h1}">Mentorship accepted</p>
      <p style="${S.body}">
        Great news, ${firstName}. Your mentorship request has been accepted.
      </p>

      <div style="${S.card}">
        <span style="${S.label}">Topic</span>
        <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#111827;">${topic}</p>
        <span style="${S.label}">Your mentor</span>
        <p style="margin:0;font-size:15px;font-weight:600;color:#4338CA;">${mentorName}</p>
      </div>

      <p style="${S.body}">
        Your mentor will reach out to you directly. Make sure your contact
        details on your profile are up to date.
      </p>

      <a href="${CLIENT_URL}/mentorship" style="${S.btn}">View Mentorship</a>
    `,
  });
}