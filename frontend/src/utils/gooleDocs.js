export const isGoogleDoc = (url) =>
  /https?:\/\/docs\.google\.com\/document\/d\/[^/]+/i.test(url);

export const gdocExportUrl = (url, format = "pdf") =>
  url.replace(/\/edit(\?.*)?$/i, "") + `/export?format=${format}`;

export const gdocExportHtml = (url = "") =>
  url.replace(/\/edit(\?.*)?$/i, "") + `/export?format=html`;