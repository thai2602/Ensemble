/**
 * Get full URL for uploaded file
 * @param {string} filename - The uploaded filename
 * @returns {string} Full URL to access the file
 */
export const getFileUrl = (filename) => {
  if (!filename) return '';
  
  // Nếu đã là full URL thì return luôn
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Lấy base URL từ env hoặc dùng localhost
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  
  // Remove leading slash nếu có
  const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
  
  return `${baseUrl}/${cleanFilename}`;
};

/**
 * Extract filename from full URL or path
 * @param {string} urlOrPath - Full URL or relative path
 * @returns {string} Just the filename
 */
export const extractFilename = (urlOrPath) => {
  if (!urlOrPath) return '';
  
  // Nếu là URL, lấy phần path
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    const url = new URL(urlOrPath);
    return url.pathname;
  }
  
  return urlOrPath;
};
