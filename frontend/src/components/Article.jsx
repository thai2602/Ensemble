import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { isGoogleDoc, gdocExportHtml } from "../utils/gooleDocs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();


const getExt = (u = "") => (u.split("?")[0].split(".").pop() || "").toLowerCase();

/* ===== main component ===== */
export default function RichArticle({ fileUrl = "" }) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!fileUrl) return;
    let aborted = false;

    (async () => {
      try {
        setErr(""); setLoading(true); setHtml("");

        // 1) Google Docs -> export HTML
        if (isGoogleDoc(fileUrl)) {
          const res = await fetch(gdocExportHtml(fileUrl));
          const text = await res.text();
          if (!aborted) setHtml(text);
          return;
        }

        const ext = getExt(fileUrl);

        // 2) DOCX -> dùng Mammoth convert sang HTML
        if (ext === "docx") {
          const { default: mammoth } = await import("mammoth/mammoth.browser");
          const buf = await fetch(fileUrl).then(r => r.arrayBuffer());
          const { value: docxHtml } = await mammoth.convertToHtml({ arrayBuffer: buf });
          if (!aborted) setHtml(docxHtml);
          return;
        }

        // 3) PDF -> trích text (giữ format cơ bản)
        if (ext === "pdf") {
          const loadingTask = pdfjsLib.getDocument(fileUrl);
          const pdf = await loadingTask.promise;
          let out = "";

          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            const strings = content.items.map(it => ("str" in it ? it.str : ""));
            out += `<h3 style="margin-top:1.5rem">Trang ${p}</h3><p>${strings.join(" ")}</p>`;
          }
          if (!aborted) setHtml(out);
          return;
        }

        // 4) fallback: thử fetch như HTML thường (vd: đã có sẵn .html)
        const res = await fetch(fileUrl);
        const asText = await res.text();
        if (!aborted) setHtml(asText);
      } catch (e) {
        console.error(e);
        if (!aborted) setErr("Không thể chuyển nội dung thành bài viết.");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => { aborted = true; };
  }, [fileUrl]);

  if (!fileUrl) return <p className="text-sm text-zinc-500">Không có file.</p>;
  if (loading) return <p className="text-sm text-zinc-500 animate-pulse">Đang chuyển nội dung…</p>;
  if (err) return <p className="text-sm text-red-500">{err}</p>;

  // Sanitize HTML trước khi inject
  const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

  return (
    <article
      className="prose prose-override max-w-none"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

export function IsolatedArticle({ fileUrl }) {
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    if (!fileUrl) return;
    (async () => {
      try {
        const res = await fetch(fileUrl);
        const html = await res.text();
        // thêm <base> để ảnh/style trong tài liệu load đúng
        const withBase = html.includes("<head>")
          ? html.replace("<head>", `<head><base href="${fileUrl}">`)
          : `<base href="${fileUrl}">` + html;
        setSrcDoc(withBase);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [fileUrl]);

  if (!srcDoc) return <p>Đang tải…</p>;

  return (
    <iframe
      srcDoc={srcDoc}
      style={{ width: "100%", height: "80vh", border: "none", borderRadius: "12px" }}
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
  );
}
