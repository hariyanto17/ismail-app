const baseUrl = process.env.IMAGE_STORAGE_BASE_URL || 'http://localhost:3000';
const apiKey = process.env.IMAGE_STORAGE_API_KEY || 'ismail-kopi-wara-secret-api-key';
const appName = process.env.IMAGE_STORAGE_APP_NAME || 'ismail-kopi-wara';

function extractFilename(url: string): string {
  return url.substring(url.lastIndexOf('/') + 1);
}

export async function uploadImage(base64Data: string, title: string): Promise<string> {
  // Normalize title for filename compatibility (replace spaces with hyphens, etc.)
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const response = await fetch(`${baseUrl}/api/upload/base64`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      appName,
      title: normalizedTitle,
      image: base64Data,
    }),
  });

  const result = await response.json() as any;
  if (!response.ok || !result.success) {
    throw new Error(result.message || `Upload failed with status ${response.status}`);
  }

  return result.data.url;
}

export async function replaceImage(oldUrl: string, base64Data: string, title: string): Promise<string> {
  const oldFilename = extractFilename(oldUrl);
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const response = await fetch(`${baseUrl}/api/images/replace`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      appName,
      oldFilename,
      title: normalizedTitle,
      image: base64Data,
    }),
  });

  const result = await response.json() as any;
  if (!response.ok || !result.success) {
    // If the image to be replaced was not found, fallback to standard upload
    if (response.status === 404) {
      return uploadImage(base64Data, title);
    }
    throw new Error(result.message || `Replace failed with status ${response.status}`);
  }

  return result.data.url;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const filename = extractFilename(imageUrl);
  const response = await fetch(`${baseUrl}/api/images?appName=${appName}&filename=${filename}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const result = await response.json() as any;
    throw new Error(result.message || `Delete failed with status ${response.status}`);
  }
}
