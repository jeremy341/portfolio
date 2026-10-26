// Links to other sites open in a new tab. rel="noopener" keeps the new page from reaching back into this one.
for (const anchor of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
  if (new URL(anchor.href, location.href).origin === location.origin) continue;
  anchor.target = "_blank";
  anchor.rel = "noopener";
}
