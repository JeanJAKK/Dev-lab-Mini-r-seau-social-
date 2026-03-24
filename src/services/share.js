export async function shareContent({ title, text, url }) {
  const sharePayload = { title, text, url };

  if (navigator.share) {
    try {
      await navigator.share(sharePayload);
      return { ok: true, mode: "native" };
    } catch (err) {
      // User cancellation is not a functional error.
      if (err?.name === "AbortError") {
        return { ok: false, cancelled: true, mode: "native" };
      }
    }
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(url);
      return { ok: true, mode: "clipboard" };
    } catch {
      // Fallback below
    }
  }

  const copied = window.prompt("Copie ce lien pour partager :", url);
  return { ok: Boolean(copied !== null), mode: "manual" };
}
