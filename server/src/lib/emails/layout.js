export function emailLayout({ previewText = '', body }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CampusChain</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">

  <!-- Preview text (hidden, shown in email client inbox) -->
  <div style="display:none;max-height:0;overflow:hidden;color:#F5F3FF;">
    ${previewText}
  </div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3FF;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#4338CA;border-radius:16px 16px 0 0;padding:28px 36px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:-0.3px;">
                CampusChain
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#A5B4FC;letter-spacing:1px;text-transform:uppercase;">
                Campus Management Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#FFFFFF;padding:36px;border-left:1px solid #EEF2FF;border-right:1px solid #EEF2FF;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8F7FF;border:1px solid #EEF2FF;border-top:none;border-radius:0 0 16px 16px;padding:20px 36px;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.6;">
                This email was sent by CampusChain. If you did not expect this email, you can safely ignore it.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#9CA3AF;">
                &copy; ${new Date().getFullYear()} CampusChain. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

// ── Shared style primitives ───────────────────────────────────────────────────
// Use these inline in every template for consistency.

export const S = {
  h1:     'margin:0 0 8px;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.3px;',
  h2:     'margin:0 0 6px;font-family:Georgia,serif;font-size:16px;font-weight:700;color:#111827;',
  body:   'margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;',
  muted:  'margin:0;font-size:12px;color:#6B7280;line-height:1.6;',
  label:  'display:block;font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;',
  btn:    'display:inline-block;background:#4338CA;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;font-family:Georgia,serif;letter-spacing:0.2px;',
  btnGhost: 'display:inline-block;background:#EEF2FF;color:#4338CA;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;',
  divider:'border:none;border-top:1px solid #EEF2FF;margin:24px 0;',
  card:   'background:#F8F7FF;border:1px solid #EEF2FF;border-radius:12px;padding:20px 24px;margin:16px 0;',
  tag:    'display:inline-block;background:#EEF2FF;color:#4338CA;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;',
};