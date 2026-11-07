// Adds a live "finished email" preview next to the email wording in the editor
// (Email templates, one preview per email). Needs Sveltia CMS and /admin/email-render.js
// (the shared email templates).
(function () {
  if (!window.CMS || !window.VFEmails || !window.h) return;
  var h = window.h;
  // one editor entry per email; the preview shows that email
  var EMAILS = {
    emailCallRequest: 'Request a call (home page)',
    emailContactMessage: 'Contact page message',
    emailWaitlist: '8-Week Program waitlist',
  };
  var BOX = { fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', color: '#241f1a', lineHeight: 1.5 };

  function toJS(v) { return v && typeof v.toJS === 'function' ? v.toJS() : v; }

  function withDefaults(c) {
    c = c || {};
    var steps = Array.isArray(c.steps) ? c.steps : [];
    return {
      subject: c.subject || '', preheader: c.preheader || '', greeting: c.greeting || '', intro: c.intro || '',
      stepsHeading: c.stepsHeading || '', steps: steps.map(function (s) { return typeof s === 'string' ? s : (s && s.text) || ''; }),
      outro: c.outro || '', signOff: c.signOff || '', signature: c.signature || '',
    };
  }

  function makePreview(name) {
    return function Preview(props) {
      var entry = props.entry;
      var data = (entry && typeof entry.getIn === 'function' ? toJS(entry.getIn(['data'])) : entry && entry.data) || {};
      var copy = withDefaults(data);
      var html;
      try { html = window.VFEmails.clientEmail(copy, window.VFEmails.businessName || '', 'Jordan').html; }
      catch (e) { html = '<p style="font-family:sans-serif">Preview unavailable while this email is incomplete.</p>'; }
      return h('div', { style: Object.assign({ padding: '4px 0 24px' }, BOX) },
        h('p', { style: { margin: '0 0 6px', fontWeight: 600 } }, 'How the finished email looks: ' + EMAILS[name]),
        h('p', { style: { margin: '0 0 12px', fontSize: '13px', color: '#5c5548' } }, 'Updates as you type, shown with a sample person ("Jordan"). Subject: ' + (copy.subject || '(none yet)')),
        h('p', { style: { margin: '0 0 16px' } },
          h('a', { href: '/admin/email-previews/', target: '_blank', rel: 'noopener', style: { display: 'inline-block', padding: '9px 16px', background: '#4a5240', color: '#f2ecdd', textDecoration: 'none', borderRadius: '3px', fontSize: '14px' } }, 'Open the full preview page (all emails) ↗')),
        h('iframe', { title: EMAILS[name], srcDoc: html, style: { width: '100%', height: '760px', border: '1px solid #d8cfba', background: '#f5f1e7' } }));
    };
  }

  Object.keys(EMAILS).forEach(function (name) {
    try { window.CMS.registerPreviewTemplate(name, makePreview(name)); } catch (e) { console.warn('Email preview not available', e); }
  });
})();
