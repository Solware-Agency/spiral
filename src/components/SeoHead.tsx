import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { metaForPathname } from '../seo/routeMeta';
import { SITE_ORIGIN } from '../seo/siteOrigin';

function upsertMetaByName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertMetaByProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export default function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = metaForPathname(pathname);
    const path = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
    const canonicalPath = path === '' ? '/' : path;
    const canonicalUrl = `${SITE_ORIGIN}${canonicalPath === '/' ? '/' : canonicalPath}`;
    const imageUrl = `${SITE_ORIGIN}${meta.imagePath}`;

    document.title = meta.title;
    upsertMetaByName('description', meta.description);

    upsertMetaByProperty('og:site_name', 'SPIRAL Marketing Studio');
    upsertMetaByProperty('og:type', 'website');
    upsertMetaByProperty('og:locale', 'en_US');
    upsertMetaByProperty('og:url', canonicalUrl);
    upsertMetaByProperty('og:title', meta.title);
    upsertMetaByProperty('og:description', meta.description);
    upsertMetaByProperty('og:image', imageUrl);

    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', meta.title);
    upsertMetaByName('twitter:description', meta.description);
    upsertMetaByName('twitter:image', imageUrl);

    upsertCanonical(canonicalUrl);
  }, [pathname]);

  return null;
}
