// Live previews next to the wording in the editor, for every page and section.
// Each preview has two parts:
//   1. "As you type": the content drawn in the site's colours, updating live.
//   2. "On the website": the page as it is published, jumped to this section (a collapsible panel).
// Sveltia CMS has its own button to show or hide the whole preview pane (Editor Options > Show Preview).
(function () {
  if (!window.CMS || !window.h) return;
  var h = window.h;

  var C = { bone: '#f5f1e7', sand: '#eae1cd', olive: '#4a5240', ink: '#241f1a', muted: '#5c5548', line: '#d8cfba', white: '#fff' };
  var SERIF = "Georgia, 'Times New Roman', serif";

  // where each editor entry lives on the website
  var PAGES = {
    hero: ['Top banner', '/'], highlights: ['Key numbers', '/'], whoItsFor: ["Who it's for", '/#recognition'],
    services: ['Services', '/#help'], approach: ['My approach', '/#approach'], process: ['How it works', '/#process'],
    offers: ['Pricing & offers', '/#work-with-me'], testimonials: ['Testimonials', '/#testimonials'], about: ['About', '/#about'],
    discoveryCall: ['Free discovery call', '/#discovery-call'], finalCta: ['Final call to action', '/#book'],
    programPage: ['8-Week Program page', '/8-week-program'], bookingPage: ['Booking page', '/book'],
    privacy: ['Privacy Policy', '/privacy-policy'], cancellation: ['Cancellation Policy', '/cancellation-policy'],
    terms: ['Terms of Service', '/terms-of-service'], refund: ['Refund Policy', '/refund-policy'], sitemapPage: ['Site map page', '/site-map'],
    contactPage: ['Contact page', '/contact'],
    contact: ['Footer: contact and locations', '/#contact'], site: ['Menu and footer', '/'],
  };

  function toJS(v) { return v && typeof v.toJS === 'function' ? v.toJS() : v; }
  function isImage(v) { return typeof v === 'string' && /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(v); }
  function words(k) { return String(k).replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); }); }
  function isHeadingKey(k) { return /^(heading|title|name|headingStart|headingEnd|headingEmphasis|question)$/i.test(k) || /Heading$/.test(k); }

  var S = {
    eyebrow: { margin: '14px 0 4px', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: C.olive },
    heading: { margin: '8px 0 6px', fontFamily: SERIF, fontWeight: 500, fontSize: '20px', lineHeight: 1.25 },
    text: { margin: '6px 0', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
    quote: { margin: '8px 0', fontFamily: SERIF, fontStyle: 'italic', fontSize: '15px', lineHeight: 1.5 },
    meta: { margin: '4px 0', fontSize: '12px', color: C.muted },
    button: { display: 'inline-block', margin: '8px 0', padding: '8px 16px', background: C.olive, color: '#f2ecdd', borderRadius: '3px', fontSize: '13px', fontWeight: 600 },
    card: { margin: '10px 0', padding: '10px 14px', background: C.white, border: '1px solid ' + C.line, borderRadius: '2px' },
    group: { margin: '10px 0', paddingLeft: '12px', borderLeft: '3px solid ' + C.line },
    img: { display: 'block', maxWidth: '100%', maxHeight: '220px', margin: '8px 0', border: '1px solid ' + C.line },
  };

  function imageUrl(getAsset, v) {
    try { var a = getAsset && getAsset(v); var u = a ? (a.url || String(a)) : ''; return /^(blob:|https?:|\/|data:)/.test(u) ? u : ''; } catch (e) { return ''; }
  }

  function node(value, key, ctx) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return key === 'visible' && !value ? h('p', { key: key, style: { margin: '6px 0', padding: '6px 10px', background: '#f3dcdc', color: '#7a2020', fontSize: '12px' } }, 'This section is currently hidden on the website.') : null;
    if (typeof value === 'number') return h('p', { key: key, style: S.text }, String(value));
    if (typeof value === 'string') {
      if (isImage(value)) { var u = imageUrl(ctx.getAsset, value); return u ? h('img', { key: key, src: u, alt: '', style: S.img }) : h('p', { key: key, style: S.meta }, 'Photo: ' + value.split('/').pop()); }
      if (/^(href|buttonHref|url|mapEmbedUrl|mapLinkUrl|embedUrl|bookingUrl|instagramUrl|facebookUrl|tiktokUrl|whatsappUrl|id)$/.test(key)) return null;
      if (/Alt$/.test(key)) return h('p', { key: key, style: S.meta }, 'Photo description: ' + value);
      if (key === 'eyebrow' || key === 'badge') return h('p', { key: key, style: S.eyebrow }, value);
      if (/button|cta/i.test(key) && value.length < 60) return h('span', { key: key, style: S.button }, value);
      if (isHeadingKey(key)) return h('h3', { key: key, style: S.heading }, value);
      if (/quote/i.test(key)) return h('p', { key: key, style: S.quote }, '“' + value + '”');
      return h('p', { key: key, style: S.text }, value);
    }
    if (Array.isArray(value)) {
      if (!value.length) return null;
      if (value.every(function (x) { return typeof x === 'string' && !isImage(x); })) {
        return h('ul', { key: key, style: { margin: '6px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: 1.6 } }, value.map(function (x, i) { return h('li', { key: i }, x); }));
      }
      return h('div', { key: key }, value.map(function (x, i) { return h('div', { key: i, style: S.card }, node(x, 'item' + i, ctx)); }));
    }
    if (typeof value === 'object') {
      var kids = Object.keys(value).map(function (k) { return node(value[k], k, ctx); }).filter(Boolean);
      if (!kids.length) return null;
      return h('div', { key: key, style: S.group }, kids);
    }
    return null;
  }

  function makePreview(name) {
    var info = PAGES[name];
    return function Preview(props) {
      var entry = props.entry;
      var data = (entry && typeof entry.getIn === 'function' ? toJS(entry.getIn(['data'])) : entry && entry.data) || {};
      var ctx = { getAsset: props.getAsset };
      var body = Object.keys(data).map(function (k) { return node(data[k], k, ctx); }).filter(Boolean);
      return h('div', { style: { fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', color: C.ink, padding: '4px 0 24px' } },
        h('p', { style: { margin: '0 0 4px', fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, color: C.olive } }, 'Preview: ' + info[0]),
        h('p', { style: { margin: '0 0 12px', fontSize: '12.5px', color: C.muted } }, 'Updates as you type. Photos and layout look slightly different on the real website.'),
        h('div', { style: { background: C.bone, border: '1px solid ' + C.line, padding: '8px 16px 14px' } }, body.length ? body : h('p', { style: S.meta }, 'Nothing to show yet.')),
        h('details', { style: { marginTop: '16px' } },
          h('summary', { style: { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: C.olive, padding: '8px 0' } }, 'Show this on the website (last published version)'),
          h('p', { style: { margin: '0 0 8px', fontSize: '12.5px', color: C.muted } }, 'This is how the page looks right now. After you save, it updates in about a minute.'),
          h('iframe', { title: 'Website: ' + info[0], src: info[1], loading: 'lazy', style: { width: '100%', height: '640px', border: '1px solid ' + C.line, background: C.white } }),
          h('p', { style: { margin: '8px 0 0' } }, h('a', { href: info[1], target: '_blank', rel: 'noopener', style: { color: C.olive, fontSize: '13px' } }, 'Open this page in a new tab ↗'))));
    };
  }

  Object.keys(PAGES).forEach(function (name) {
    try { window.CMS.registerPreviewTemplate(name, makePreview(name)); } catch (e) { console.warn('Preview not available for ' + name, e); }
  });
})();
