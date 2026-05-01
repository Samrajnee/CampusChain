import api from './client.js';

/**
 * Triggers a PDF download directly in the browser.
 * Uses a raw fetch instead of Axios because we need
 * to handle a binary Blob response, not JSON.
 */
export async function downloadResume(userId = null) {
  const token = localStorage.getItem('cc_token');
  const url = userId
    ? `/api/resume/generate?userId=${userId}`
    : '/api/resume/generate';

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to generate resume');
  }

  // Convert response to blob and trigger browser download
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;

  // Read filename from Content-Disposition header if present
  const disposition = response.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="(.+)"/);
  a.download = match ? match[1] : 'CampusChain_Resume.pdf';

  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}