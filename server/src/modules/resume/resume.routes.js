import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { authenticate } from '../../middleware/authenticate.js';
import authorize from '../../middleware/authorize.js';
import prisma from '../../lib/prisma.js';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function displayName(profile) {
  if (!profile) return 'Student';
  return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

function safeText(val) {
  if (val === null || val === undefined) return '';
  return String(val);
}

// ── Color palette (matches CampusChain brand) ─────────────────────────────────

const C = {
  indigo:     '#4338CA',
  indigoLight:'#EEF2FF',
  gray900:    '#111827',
  gray700:    '#374151',
  gray500:    '#6B7280',
  gray400:    '#9CA3AF',
  gray100:    '#F3F4F6',
  white:      '#FFFFFF',
  amber:      '#D97706',
  teal:       '#0D9488',
  green:      '#059669',
};

// ── Layout constants ──────────────────────────────────────────────────────────

const PAGE_W      = 595.28;  // A4 width in points
const PAGE_H      = 841.89;  // A4 height in points
const MARGIN      = 36;
const SIDEBAR_W   = 168;
const MAIN_X      = MARGIN + SIDEBAR_W + 20;
const MAIN_W      = PAGE_W - MAIN_X - MARGIN;

// ── Drawing helpers ───────────────────────────────────────────────────────────

function sectionHeader(doc, x, y, width, label) {
  doc
    .fillColor(C.indigo)
    .rect(x, y, width, 1.5)
    .fill();

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(C.indigo)
    .text(label.toUpperCase(), x, y + 5, { width });

  return y + 18;
}

function tag(doc, x, y, label, bg, fg) {
  const padding = 5;
  const w = doc.widthOfString(label) + padding * 2;
  doc.fillColor(bg).roundedRect(x, y, w, 14, 3).fill();
  doc.fillColor(fg).font('Helvetica').fontSize(7).text(label, x + padding, y + 3.5);
  return w + 5; // returns width consumed + gap
}

// ── Main route ────────────────────────────────────────────────────────────────

// Students generate their own resume.
// TEACHER+ can generate for any userId via ?userId= query param.
router.get(
  '/generate',
  authenticate,
  async (req, res, next) => {
    try {
      const isAdmin = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN']
        .includes(req.user.role);

      // Determine whose resume to generate
      const targetUserId =
        isAdmin && req.query.userId ? req.query.userId : req.user.id;

      // ── Fetch all data in parallel ──────────────────────────────────────────
      const [user, certificates, userBadges, clubMemberships, mentorships] =
        await Promise.all([
          prisma.user.findUnique({
            where: { id: targetUserId },
            include: {
              profile: true,
              studentDetail: true,
            },
          }),
          prisma.certificate.findMany({
            where: { userId: targetUserId, isRevoked: false },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.userBadge.findMany({
            where: { userId: targetUserId },
            include: { badge: true },
            orderBy: { earnedAt: 'desc' },
          }),
          prisma.clubMember.findMany({
            where: { userId: targetUserId },
            include: {
              club: { select: { name: true, status: true } },
            },
            orderBy: { joinedAt: 'desc' },
          }),
          prisma.mentorship.findMany({
            where: {
              menteeId: targetUserId,
              status: 'COMPLETED',
            },
            orderBy: { completedAt: 'desc' },
            take: 5,
          }),
        ]);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const profile = user.profile;
      const detail  = user.studentDetail;
      const name    = displayName(profile);

      // ── Create PDF document ─────────────────────────────────────────────────
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 0, left: 0, right: 0, bottom: 0 },
        info: {
          Title:    `${name} — CampusChain Resume`,
          Author:   'CampusChain',
          Subject:  'Student Academic Resume',
          Creator:  'CampusChain Platform',
        },
      });

      // Stream directly to HTTP response
      const safeName = name.replace(/\s+/g, '_') || 'resume';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeName}_CampusChain_Resume.pdf"`
      );
      doc.pipe(res);

      // ── SIDEBAR ─────────────────────────────────────────────────────────────

      // Sidebar background
      doc.fillColor(C.indigo).rect(0, 0, MARGIN + SIDEBAR_W, PAGE_H).fill();

      // Name block
      let sY = 40;

      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(C.white)
        .text(name, MARGIN, sY, { width: SIDEBAR_W, lineGap: 2 });

      sY += doc.heightOfString(name, { width: SIDEBAR_W, fontSize: 16 }) + 6;

      if (detail?.department) {
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#A5B4FC')
          .text(safeText(detail.department), MARGIN, sY, { width: SIDEBAR_W });
        sY += 12;
      }

      if (detail?.year) {
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#A5B4FC')
          .text(`Year ${detail.year}${detail.semester ? ` · Sem ${detail.semester}` : ''}`, MARGIN, sY, { width: SIDEBAR_W });
        sY += 12;
      }

      if (detail?.studentId) {
        doc
          .fontSize(8)
          .fillColor('#818CF8')
          .text(`ID: ${detail.studentId}`, MARGIN, sY, { width: SIDEBAR_W });
        sY += 20;
      }

      // Divider
      doc.fillColor('#6366F1').rect(MARGIN, sY, SIDEBAR_W, 0.5).fill();
      sY += 12;

      // Contact
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor('#E0E7FF')
        .text('CONTACT', MARGIN, sY, { width: SIDEBAR_W });
      sY += 10;

      doc.font('Helvetica').fontSize(7.5).fillColor(C.white);

      if (user.email) {
        doc.text(user.email, MARGIN, sY, { width: SIDEBAR_W });
        sY += 11;
      }
      if (profile?.phone && profile.showPhone) {
        doc.text(safeText(profile.phone), MARGIN, sY, { width: SIDEBAR_W });
        sY += 11;
      }
      sY += 8;

      // XP and Level
      doc.fillColor('#6366F1').rect(MARGIN, sY, SIDEBAR_W, 0.5).fill();
      sY += 12;

      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor('#E0E7FF')
        .text('CAMPUS XP', MARGIN, sY, { width: SIDEBAR_W });
      sY += 10;

      const xpTotal = detail?.xpTotal ?? 0;
      const level   = detail?.level   ?? 1;

      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(C.white)
        .text(safeText(xpTotal), MARGIN, sY, { width: SIDEBAR_W });
      sY += 26;

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#A5B4FC')
        .text(`Level ${level}`, MARGIN, sY, { width: SIDEBAR_W });
      sY += 20;

      // CGPA
      if (detail?.cgpa && detail.showCgpa !== false) {
        doc.fillColor('#6366F1').rect(MARGIN, sY, SIDEBAR_W, 0.5).fill();
        sY += 12;

        doc
          .font('Helvetica-Bold')
          .fontSize(7)
          .fillColor('#E0E7FF')
          .text('CGPA', MARGIN, sY, { width: SIDEBAR_W });
        sY += 10;

        doc
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor(C.white)
          .text(safeText(detail.cgpa), MARGIN, sY, { width: SIDEBAR_W });
        sY += 28;
      }

      // Badges
      if (userBadges.length > 0) {
        doc.fillColor('#6366F1').rect(MARGIN, sY, SIDEBAR_W, 0.5).fill();
        sY += 12;

        doc
          .font('Helvetica-Bold')
          .fontSize(7)
          .fillColor('#E0E7FF')
          .text('BADGES EARNED', MARGIN, sY, { width: SIDEBAR_W });
        sY += 10;

        for (const ub of userBadges.slice(0, 8)) {
          doc
            .font('Helvetica')
            .fontSize(7.5)
            .fillColor(C.white)
            .text(`· ${ub.badge.name}`, MARGIN, sY, { width: SIDEBAR_W });
          sY += 10;

          if (sY > PAGE_H - 60) break; // overflow guard
        }
        sY += 8;
      }

      // Bio
      if (profile?.bio) {
        doc.fillColor('#6366F1').rect(MARGIN, sY, SIDEBAR_W, 0.5).fill();
        sY += 12;

        doc
          .font('Helvetica-Bold')
          .fontSize(7)
          .fillColor('#E0E7FF')
          .text('ABOUT', MARGIN, sY, { width: SIDEBAR_W });
        sY += 10;

        doc
          .font('Helvetica')
          .fontSize(7.5)
          .fillColor('#C7D2FE')
          .text(safeText(profile.bio), MARGIN, sY, {
            width: SIDEBAR_W,
            lineGap: 2,
          });
      }

      // Footer watermark on sidebar
      doc
        .font('Helvetica')
        .fontSize(6.5)
        .fillColor('#4338CA')
        .text('Generated by CampusChain', MARGIN, PAGE_H - 20, {
          width: SIDEBAR_W,
        });

      // ── MAIN CONTENT ────────────────────────────────────────────────────────

      let mY = 40; // main column Y cursor

      // ── Education ──────────────────────────────────────────────────────────

      mY = sectionHeader(doc, MAIN_X, mY, MAIN_W, 'Education');

      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(C.gray900)
        .text('Techno India Batanagar', MAIN_X, mY, { width: MAIN_W });
      mY += 13;

      const eduLine = [
        detail?.department,
        detail?.year ? `Year ${detail.year}` : null,
        detail?.section ? `Section ${detail.section}` : null,
      ]
        .filter(Boolean)
        .join(' · ');

      if (eduLine) {
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor(C.gray700)
          .text(safeText(eduLine), MAIN_X, mY, { width: MAIN_W });
        mY += 12;
      }

      if (detail?.cgpa && detail.showCgpa !== false) {
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(C.gray500)
          .text(`CGPA: ${detail.cgpa}`, MAIN_X, mY, { width: MAIN_W });
        mY += 12;
      }

      mY += 14;

      // ── Certificates ───────────────────────────────────────────────────────

      if (certificates.length > 0) {
        mY = sectionHeader(doc, MAIN_X, mY, MAIN_W, 'Certificates & Achievements');

        for (const cert of certificates) {
          if (mY > PAGE_H - 80) break;

          // Cert title + type tag
          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor(C.gray900)
            .text(safeText(cert.title), MAIN_X, mY, { width: MAIN_W - 70 });

          // Type badge — top right
          const typeColors = {
            PARTICIPATION: [C.indigoLight, C.indigo],
            ACHIEVEMENT:   ['#FEF3C7', C.amber],
            LEADERSHIP:    ['#D1FAE5', C.green],
            ACADEMIC:      ['#E0F2FE', '#0369A1'],
            CUSTOM:        [C.gray100, C.gray500],
          };
          const [bg, fg] = typeColors[cert.type] ?? typeColors.CUSTOM;
          const typeLabel = cert.type.charAt(0) + cert.type.slice(1).toLowerCase();

          doc
            .font('Helvetica')
            .fontSize(7);
          const typeW = doc.widthOfString(typeLabel) + 10;
          const typeX = MAIN_X + MAIN_W - typeW;

          doc.fillColor(bg).roundedRect(typeX, mY, typeW, 13, 3).fill();
          doc.fillColor(fg).text(typeLabel, typeX + 5, mY + 3);

          mY += 13;

          doc
            .font('Helvetica')
            .fontSize(8)
            .fillColor(C.gray500)
            .text(
              `Issued by ${safeText(cert.issuedBy)}  ·  ${formatDate(cert.createdAt)}`,
              MAIN_X,
              mY,
              { width: MAIN_W }
            );
          mY += 11;

          if (cert.description) {
            doc
              .font('Helvetica')
              .fontSize(7.5)
              .fillColor(C.gray700)
              .text(safeText(cert.description), MAIN_X, mY, {
                width: MAIN_W,
                lineGap: 1.5,
              });
            mY += doc.heightOfString(cert.description, { width: MAIN_W, fontSize: 7.5 }) + 4;
          }

          // Verify URL
          doc
            .font('Helvetica')
            .fontSize(7)
            .fillColor(C.indigo)
            .text(
              `Verify: ${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${cert.uniqueCode}`,
              MAIN_X,
              mY,
              { width: MAIN_W }
            );
          mY += 14;
        }

        mY += 6;
      }

      // ── Clubs & Activities ─────────────────────────────────────────────────

      if (clubMemberships.length > 0) {
        mY = sectionHeader(doc, MAIN_X, mY, MAIN_W, 'Clubs & Activities');

        for (const membership of clubMemberships) {
          if (mY > PAGE_H - 60) break;

          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor(C.gray900)
            .text(safeText(membership.club.name), MAIN_X, mY, { width: MAIN_W - 80 });

          // Role tag
          const roleColors = {
            PRESIDENT:  ['#D1FAE5', C.green],
            SECRETARY:  ['#E0F2FE', '#0369A1'],
            MEMBER:     [C.gray100, C.gray500],
          };
          const [rBg, rFg] = roleColors[membership.role] ?? roleColors.MEMBER;
          const roleLabel = membership.role.charAt(0) + membership.role.slice(1).toLowerCase();

          doc.font('Helvetica').fontSize(7);
          const rW = doc.widthOfString(roleLabel) + 10;
          const rX = MAIN_X + MAIN_W - rW;

          doc.fillColor(rBg).roundedRect(rX, mY, rW, 13, 3).fill();
          doc.fillColor(rFg).text(roleLabel, rX + 5, mY + 3);

          mY += 13;

          if (membership.joinedAt) {
            doc
              .font('Helvetica')
              .fontSize(7.5)
              .fillColor(C.gray400)
              .text(`Joined ${formatDate(membership.joinedAt)}`, MAIN_X, mY, {
                width: MAIN_W,
              });
            mY += 12;
          }

          mY += 2;
        }

        mY += 6;
      }

      // ── Mentorships ────────────────────────────────────────────────────────

      if (mentorships.length > 0) {
        mY = sectionHeader(doc, MAIN_X, mY, MAIN_W, 'Completed Mentorships');

        for (const m of mentorships) {
          if (mY > PAGE_H - 50) break;

          doc
            .font('Helvetica-Bold')
            .fontSize(9)
            .fillColor(C.gray900)
            .text(safeText(m.topic), MAIN_X, mY, { width: MAIN_W });
          mY += 12;

          doc
            .font('Helvetica')
            .fontSize(7.5)
            .fillColor(C.gray500)
            .text(`Completed ${formatDate(m.completedAt)}`, MAIN_X, mY, {
              width: MAIN_W,
            });
          mY += 14;
        }

        mY += 4;
      }

      // ── Badges summary in main (if no room in sidebar) ────────────────────

      if (userBadges.length > 8 && mY < PAGE_H - 80) {
        mY = sectionHeader(doc, MAIN_X, mY, MAIN_W, 'Additional Badges');
        let bX = MAIN_X;
        const bY = mY;

        for (const ub of userBadges.slice(8)) {
          if (bX + 80 > MAIN_X + MAIN_W) break;
          const consumed = tag(doc, bX, bY, ub.badge.name, C.indigoLight, C.indigo);
          bX += consumed;
        }
        mY = bY + 22;
      }

      // ── Footer ─────────────────────────────────────────────────────────────

      // Horizontal rule above footer
      doc
        .fillColor(C.gray100)
        .rect(MAIN_X, PAGE_H - 28, MAIN_W, 0.5)
        .fill();

      doc
        .font('Helvetica')
        .fontSize(6.5)
        .fillColor(C.gray400)
        .text(
          `This resume was auto-generated by CampusChain on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. Certificates can be verified at the URLs listed above.`,
          MAIN_X,
          PAGE_H - 22,
          { width: MAIN_W }
        );

      // ── Finalise ────────────────────────────────────────────────────────────

      doc.end();
    } catch (err) {
      next(err);
    }
  }
);

export default router;