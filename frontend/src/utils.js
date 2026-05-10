// WHMCS returns subject/message/name fields HTML-entity-encoded
// (e.g. "i don&#039;t want" instead of "i don't want"). We decode them
// at the render boundary using the browser's parser. Reading `.value`
// from a textarea gives back plain text, so this is XSS-safe — no
// markup ever gets injected into the DOM.

let _el;

export function decodeHtml(str) {
  if (typeof str !== "string" || !str) return str;
  if (!_el) _el = document.createElement("textarea");
  _el.innerHTML = str;
  return _el.value;
}
