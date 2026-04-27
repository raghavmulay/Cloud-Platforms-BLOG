/* ================================================================
   CLOUD MONITORING 2026 — SCRIPT
   Smooth scrolling, navbar, fade-in, tabs, recommender
   ================================================================ */

'use strict';

/* ── Navbar: Scroll shadow + active section highlight ─────────── */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Shadow on scroll
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 80;
    if (window.scrollY >= top) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}, { passive: true });

/* ── Hamburger Menu ───────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navLinkBox = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinkBox.classList.toggle('open');
});

// Close mobile menu when a link is clicked
navLinkBox.addEventListener('click', e => {
  if (e.target.classList.contains('nav-link')) {
    navLinkBox.classList.remove('open');
  }
});

/* ── Smooth Scrolling (for older browsers) ────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Fade-in on scroll (IntersectionObserver) ─────────────────── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ── Implementation Tabs ─────────────────────────────────────── */
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels  = document.querySelectorAll('.tab-panel');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const panel = document.getElementById(`tab-panel-${target}`);
    if (panel) panel.classList.add('active');
  });
});

/* ── Stack Recommendation Framework ─────────────────────────── */

// Selection state
const selections = { team: null, budget: null, problem: null, infra: null, ops: null };
const dims = ['team', 'budget', 'problem', 'infra', 'ops'];

// Stack database
const stacks = [
  {
    // AAAA / AABA — Small team, low budget, getting started, simple infra
    match: (s) => s.team === 'A' && s.budget === 'A',
    primary:  'New Relic (Free Tier)',
    tracing:  'New Relic APM + OpenTelemetry SDK',
    logs:     'New Relic Log Management (via Fluent Bit)',
    alerting: 'New Relic Alerts + PagerDuty Free',
    note:     'Ideal for zero-to-one teams. Fully managed with a generous free tier. Instrument with OTel from day one.',
    cost:     '$0–$500/month',
  },
  {
    // ABBB / BBBA — Small/medium team, moderate budget, consolidation, microservices
    match: (s) => (s.team === 'A' || s.team === 'B') && (s.budget === 'B') && (s.problem === 'B' || s.infra === 'B'),
    primary:  'Grafana Cloud (managed)',
    tracing:  'Honeycomb (via OTel Collector)',
    logs:     'Grafana Loki (managed)',
    alerting: 'Grafana Alerting + PagerDuty',
    note:     'Best balance of cost, flexibility, and power. Unified view without enterprise pricing.',
    cost:     '$3,000–$12,000/month',
  },
  {
    // BCCC / CBBB — Medium/large team, higher budget, cost/scale challenges, Kubernetes
    match: (s) => (s.team === 'B' || s.team === 'C') && (s.budget === 'C') && (s.infra === 'C' || s.problem === 'C'),
    primary:  'Datadog',
    tracing:  'Datadog APM',
    logs:     'Datadog Log Management',
    alerting: 'Datadog Monitors + PagerDuty',
    note:     'Best all-in-one for scaling teams who need unified observability with enterprise integrations.',
    cost:     '$25,000–$80,000/month',
  },
  {
    // CCCD / DCCC — Large team, enterprise budget, AI / compliance needs
    match: (s) => (s.team === 'C' || s.team === 'D') && (s.budget === 'C' || s.budget === 'D') && (s.problem === 'D' || s.infra === 'D'),
    primary:  'Dynatrace',
    tracing:  'Dynatrace APM (OneAgent)',
    logs:     'Elastic Cloud (compliance + long retention)',
    alerting: 'PagerDuty + Dynatrace Davis AI',
    note:     'Top choice for large, compliance-heavy environments needing AI-driven root cause analysis.',
    cost:     '$50,000–$150,000/month',
  },
  {
    // Any D-heavy — Self-hosted, data sovereignty
    match: (s) => s.ops === 'D' || (s.problem === 'D' && s.ops === 'C'),
    primary:  'Grafana OSS (self-hosted)',
    tracing:  'Grafana Tempo (on object storage)',
    logs:     'Grafana Loki (on S3/GCS)',
    alerting: 'Alertmanager + Grafana OnCall',
    note:     'Maximum control and lowest cloud cost. Requires 0.5–1 FTE operations. Best for data sovereignty.',
    cost:     '$500–$5,000/month infrastructure',
  },
  {
    // Fallback — Medium team, any
    match: () => true,
    primary:  'New Relic',
    tracing:  'New Relic Distributed Tracing (OTel)',
    logs:     'New Relic Log Management',
    alerting: 'New Relic Alerts',
    note:     'A solid choice for most teams. Flat per-user pricing, good free tier, and low setup overhead.',
    cost:     '$4,500–$15,000/month',
  },
];

function getStack(s) {
  return stacks.find(st => st.match(s));
}

function renderResult(s) {
  const stack = getStack(s);
  const resultEl = document.getElementById('rec-result');
  const contentEl = document.getElementById('result-content');

  contentEl.innerHTML = `
    <div class="result-stack-item">
      <span class="result-label">Primary Platform</span>
      <span class="result-tool">${stack.primary}</span>
    </div>
    <div class="result-stack-item">
      <span class="result-label">Tracing</span>
      <span class="result-tool">${stack.tracing}</span>
    </div>
    <div class="result-stack-item">
      <span class="result-label">Log Analytics</span>
      <span class="result-tool">${stack.logs}</span>
    </div>
    <div class="result-stack-item">
      <span class="result-label">Alerting</span>
      <span class="result-tool">${stack.alerting}</span>
    </div>
    <div class="result-stack-item">
      <span class="result-label">Estimated Cost</span>
      <span class="result-tool" style="font-weight:700;color:#1F3A5F;">${stack.cost}</span>
    </div>
    <div style="margin-top:0.9rem;padding:0.75rem 1rem;background:#EFF8FF;border-radius:6px;font-size:0.85rem;color:#1F3A5F;border-left:3px solid #3A6EA5;">
      💡 ${stack.note}
    </div>
    <div style="margin-top:0.75rem;font-size:0.8rem;color:#5A6478;">
      <strong>Note:</strong> This framework is a directional guide, not a rigid prescription. Adjust based on your specific system constraints.
    </div>
  `;
  resultEl.classList.remove('hidden');
}

// Handle button selections
document.querySelectorAll('.rec-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dim = btn.dataset.dim;
    const val = btn.dataset.val;

    // Deselect others in same dim
    document.querySelectorAll(`.rec-btn[data-dim="${dim}"]`).forEach(b => b.classList.remove('selected'));

    // Select this
    btn.classList.add('selected');
    selections[dim] = val;

    // Check if all 5 dimensions selected
    const allSelected = dims.every(d => selections[d] !== null);
    if (allSelected) {
      renderResult(selections);
    } else {
      // If result was showing, hide it while user re-selects
      document.getElementById('rec-result').classList.add('hidden');
    }
  });
});

// Reset
document.getElementById('rec-reset').addEventListener('click', () => {
  dims.forEach(d => selections[d] = null);
  document.querySelectorAll('.rec-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('rec-result').classList.add('hidden');
});

/* ── Section Progress Bar (optional styling hook) ─────────────── */
// Add a subtle reading-progress indicator at the top of the page
(function () {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px;
    background: linear-gradient(90deg, #3A6EA5, #1F3A5F);
    z-index: 200; width: 0%; transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const total  = document.documentElement.scrollHeight - window.innerHeight;
    const pct    = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();
