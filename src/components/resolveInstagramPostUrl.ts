/**
 * Detecta URL de publicación Instagram (post / reel / tv) desde el árbol del evento,
 * incluyendo nodos dentro de Shadow DOM (composedPath).
 */
export function normalizeInstagramPostUrl(raw: string): string {
  const m = raw.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[A-Za-z0-9_-]+/i);
  return m ? m[0] : raw.trim().split(/[?"']/)[0];
}

export function resolveInstagramPostUrlFromEvent(event: MouseEvent): string | null {
  const path =
    typeof event.composedPath === 'function' ? (event.composedPath() as EventTarget[]) : [event.target];

  for (const node of path) {
    if (!(node instanceof Element)) continue;

    if (node instanceof HTMLAnchorElement) {
      const href = node.href || node.getAttribute('href') || '';
      if (/instagram\.com\/(p|reel|tv)\//i.test(href)) {
        return normalizeInstagramPostUrl(href);
      }
    }

    if (node.hasAttributes?.()) {
      for (const { value } of node.attributes) {
        if (!value.includes('instagram.com')) continue;
        const m = value.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[A-Za-z0-9_-]+/i);
        if (m) return normalizeInstagramPostUrl(m[0]);
      }
    }
  }
  return null;
}

export function eventComposedPathIncludes(host: HTMLElement, event: MouseEvent): boolean {
  return typeof event.composedPath === 'function' && event.composedPath().includes(host);
}
