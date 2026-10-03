import React from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

const FEATURES = [
  {
    emoji: '💳',
    title: 'Expense Tracking',
    desc: 'Log every expense with category, payment method, and date. Search, filter, and sort with ease.',
    path: '/transactions',
  },
  {
    emoji: '🎯',
    title: 'Budget Management',
    desc: 'Set monthly category budgets and get instant alerts before you overspend.',
    path: '/budgets',
  },
  {
    emoji: '📈',
    title: 'Analytics',
    desc: 'Visual charts showing spending trends, category breakdowns, and month-over-month comparisons.',
    path: '/analytics',
  },
  {
    emoji: '🏦',
    title: 'Savings Goals',
    desc: 'Create goals with target amounts and dates. Track progress with visual progress bars.',
    path: '/savings',
  },
  {
    emoji: '🤖',
    title: 'AI Insights',
    desc: 'Anomaly detection, spending predictions, and personalised recommendations — all local, no API key.',
    path: '/ai-insights',
  },
  {
    emoji: '💬',
    title: 'AI Assistant',
    desc: 'Ask plain-English questions about your finances and get instant data-driven answers.',
    path: '/assistant',
  },
]

export default function Home() {
  usePageTitle('Home')

  return (
    <div className="home-page">
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-badge">✦ AI-Powered Personal Finance</div>

        <div className="hero-logo">₹</div>

        <h1 className="hero-title">SpendSense AI</h1>
        <p className="hero-tagline">Spend Wisely, Save Confidently</p>
        <p className="hero-desc">
          A complete personal finance assistant that tracks your spending, manages budgets,
          predicts upcoming expenses, and answers your financial questions — entirely on your
          local machine, no external APIs required.
        </p>

        <div className="hero-actions">
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            📊 Go to Dashboard
          </Link>
          <Link to="/assistant" className="btn btn-secondary btn-lg">
            💬 Ask AI Assistant
          </Link>
        </div>

        {/* Quick stats strip */}
        <div className="hero-stats">
          {[
            { label: 'Pages', value: '8' },
            { label: 'AI Features', value: '6' },
            { label: 'No External API', value: '✓' },
            { label: 'Currency', value: '₹ INR' },
          ].map(s => (
            <div key={s.label} className="hero-stat">
              <div className="hero-stat-value">{s.value}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <h2 className="section-title">Everything you need to manage money</h2>
        <p className="section-sub">Six powerful modules, one clean interface.</p>

        <div className="features-grid">
          {FEATURES.map(f => (
            <Link key={f.path} to={f.path} className="feature-card">
              <div className="feature-emoji">{f.emoji}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-link">Open →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section">
        <h2 className="section-title">How it works</h2>
        <div className="steps-row">
          {[
            { n: '1', title: 'Add Transactions', desc: 'Log income and expenses manually or let AI auto-categorise from the description.' },
            { n: '2', title: 'Set Budgets & Goals', desc: 'Define monthly category budgets and savings targets to work toward.' },
            { n: '3', title: 'Get AI Insights', desc: 'The AI engine analyses patterns, spots anomalies, and surfaces actionable recommendations.' },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-number">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to take control of your finances?</h2>
        <p className="cta-sub">Your data stays on your machine. No subscriptions, no cloud.</p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">
          Get Started — View Dashboard
        </Link>
      </section>

      <style>{`
        /* ── Page wrapper ─────────────────── */
        .home-page {
          max-width: 900px;
          margin: 0 auto;
          padding-bottom: 60px;
        }

        /* ── Hero ────────────────────────── */
        .hero-section {
          text-align: center;
          padding: 40px 24px 48px;
        }
        .hero-badge {
          display: inline-block;
          background: #FFF3E0;
          color: var(--warning);
          border: 1px solid #FFE0B2;
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 24px;
          letter-spacing: 0.3px;
        }
        .hero-logo {
          width: 72px; height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; color: white; font-weight: 800;
          margin: 0 auto 20px;
          box-shadow: 0 6px 20px rgba(139,105,20,0.35);
        }
        .hero-title {
          font-size: 42px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          margin-bottom: 8px;
          line-height: 1.1;
        }
        .hero-tagline {
          font-size: 18px;
          color: var(--primary);
          font-weight: 600;
          margin-bottom: 16px;
        }
        .hero-desc {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.75;
          max-width: 600px;
          margin: 0 auto 32px;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        /* ── Stats strip ─────────────────── */
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .hero-stat {
          flex: 1;
          padding: 14px 20px;
          text-align: center;
          border-right: 1px solid var(--border);
        }
        .hero-stat:last-child { border-right: none; }
        .hero-stat-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        /* ── Section common ──────────────── */
        .features-section,
        .how-section,
        .cta-section {
          padding: 48px 0 0;
        }
        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          text-align: center;
          margin-bottom: 6px;
        }
        .section-sub {
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 32px;
        }

        /* ── Feature cards ───────────────── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 20px;
          text-decoration: none;
          color: inherit;
          transition: box-shadow 0.18s, transform 0.18s, border-color 0.18s;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: var(--shadow-sm);
        }
        .feature-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
          border-color: var(--primary);
        }
        .feature-emoji {
          font-size: 28px;
          margin-bottom: 4px;
          line-height: 1;
        }
        .feature-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .feature-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          flex: 1;
        }
        .feature-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary);
          margin-top: 8px;
        }

        /* ── How it works steps ──────────── */
        .steps-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .step-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 24px 20px;
          box-shadow: var(--shadow-sm);
          position: relative;
        }
        .step-number {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: white;
          font-size: 16px;
          font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
          box-shadow: 0 3px 10px rgba(139,105,20,0.3);
        }
        .step-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .step-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        /* ── CTA ─────────────────────────── */
        .cta-section {
          text-align: center;
          background: linear-gradient(135deg, #FFF8EE, #FAF7F2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 48px 32px;
          margin-top: 48px;
          box-shadow: var(--shadow-sm);
        }
        .cta-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .cta-sub {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }

        /* ── Responsive ──────────────────── */
        @media (max-width: 640px) {
          .hero-title  { font-size: 30px; }
          .hero-stats  { display: none; }
          .hero-actions { flex-direction: column; align-items: center; }
          .features-grid { grid-template-columns: 1fr; }
          .steps-row     { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
