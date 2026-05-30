import React, { useState, useMemo } from 'react'
import { FiDownload } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { C, SortTh, PageTitle, LoadMore } from '../components/UI'
import { useSortedData } from '../hooks/useSortedData'
import { computeBusFactor, exportContributorsCSV } from '../services/analytics'

export default function ContributorsPage() {
  const { model } = useApp()
  const [search, setSearch] = useState('')
  const [shown,  setShown]  = useState(20)

  if (!model) return null
  const { contributors } = model

  const busFactor  = useMemo(() => computeBusFactor(contributors), [contributors])
  const topActive  = contributors.slice(0, 10).filter(c => c.freshness > 50).length
  const freshPct   = contributors.length ? Math.round(topActive / Math.min(10, contributors.length) * 100) : 0
  const connectors = contributors.filter(c => c.isConnector)
  const crossOrg   = contributors.filter(c => c.isCrossOrg)

  const filtered = useMemo(() =>
    contributors.filter(c => !search || c.login.toLowerCase().includes(search.toLowerCase())),
    [contributors, search])

  const { sorted, sortConfig, onSort } = useSortedData(filtered, 'totalContribs', 'desc')
  const visible = sorted.slice(0, shown)

  const riskColor = r => r === 'critical' ? 'var(--red)' : r === 'high' ? 'var(--amber)' : 'var(--green)'
  const riskBar   = r => r === 'critical' ? '90%' : r === 'high' ? '60%' : '25%'

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }} className="fade-up">
      <PageTitle
        title="Contributor Intelligence"
        subtitle="Analyzing contribution patterns, coverage risk, and organizational health — sorted by coverage and recency, not by commit count"
        right={
          <button onClick={() => exportContributorsCSV(contributors)} style={{ ...C.btn('ghost'), fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            <FiDownload size={13} /> Export CSV
          </button>
        }
      />

      {/* Signal panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Bus Factor */}
        <div style={{
          ...C.card,
          borderColor: busFactor.risk === 'critical' ? 'rgba(239,68,68,.4)' : busFactor.risk === 'high' ? 'rgba(245,158,11,.4)' : 'var(--border)',
        }}>
          <div style={{ ...C.label, marginBottom: 8 }}>Bus Factor Risk</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Bus Factor: {busFactor.factor}</div>
            <span style={{
              padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
              background: `color-mix(in srgb, ${riskColor(busFactor.risk)} 15%, transparent)`,
              color: riskColor(busFactor.risk), letterSpacing: '.05em',
            }}>
              {busFactor.risk.toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
            {busFactor.factor <= 2
              ? `${busFactor.factor} contributor${busFactor.factor === 1 ? '' : 's'} own${busFactor.factor === 1 ? 's' : ''} over 50% of total commits. Knowledge distribution is heavily skewed.`
              : 'Healthy contributor distribution across the organization.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>
            <span>RISK LEVEL</span>
            <span style={{ color: riskColor(busFactor.risk), fontWeight: 600 }}>{busFactor.risk.toUpperCase()}</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
            <div style={{ width: riskBar(busFactor.risk), height: '100%', background: riskColor(busFactor.risk), borderRadius: 2 }} />
          </div>
        </div>

        {/* Freshness Index */}
        <div style={C.card}>
          <div style={{ ...C.label, marginBottom: 12 }}>Freshness Index</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: `conic-gradient(var(--green) ${freshPct * 3.6}deg, var(--border) 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>
                {Math.round(freshPct / 10)}/10
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Core Momentum</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{topActive} of top 10 contributors active in last 90 days</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                ACTIVE RECENTLY: <strong style={{ color: 'var(--green)' }}>{freshPct}%</strong>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {connectors.length > 0 && (
              <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(245,197,24,.06)', borderRadius: 4, fontSize: 12 }}>
                <strong style={{ color: 'var(--accent)' }}>{connectors.length}</strong> cross-repo connectors (3+ repos)
              </div>
            )}
            {crossOrg.length > 0 && (
              <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(168,85,247,.06)', borderRadius: 4, fontSize: 12 }}>
                <strong style={{ color: 'var(--purple)' }}>{crossOrg.length}</strong> cross-org contributors
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytical table */}
      <div style={{ ...C.card, padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by username..."
            style={{ ...C.input, width: 220 }}
          />
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>
            {filtered.length} contributors — no rank column by design
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <SortTh label="Contributor"           sortKey="login"        sortConfig={sortConfig} onSort={onSort} />
              <SortTh label="Total Contributions"   sortKey="totalContribs" sortConfig={sortConfig} onSort={onSort} />
              <SortTh label="Repos Contributed To"  sortKey="repos"         sortConfig={sortConfig} onSort={onSort} />
              <SortTh label="Orgs"                  sortKey="orgs"          sortConfig={sortConfig} onSort={onSort} />
              <SortTh label="Last Active"            sortKey="lastActive"   sortConfig={sortConfig} onSort={onSort} />
              <th style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text2)', fontWeight: 600, background: 'var(--surface2)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                SIGNALS
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c, i) => (
              <tr key={c.login} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'var(--surface2)' : 'transparent' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={c.avatar_url} alt={c.login} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{c.login}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 80, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                      <div style={{ width: `${Math.min(100, c.totalContribs / 15)}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{c.totalContribs.toLocaleString()}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text2)' }}>{c.repos.length}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text2)' }}>{c.orgs.length}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text2)' }}>{c.lastActive?.slice(0, 10) || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {c.isConnector && <span style={C.pill('var(--accent)',  'rgba(245,197,24,.12)')}>CONNECTOR</span>}
                    {c.isCrossOrg  && <span style={C.pill('var(--purple)', 'rgba(168,85,247,.12)')}>CROSS-ORG</span>}
                    {c.freshness > 70 && <span style={C.pill('var(--green)', 'rgba(34,197,94,.12)')}>ACTIVE</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <LoadMore shown={shown} total={sorted.length} onLoad={() => setShown(s => s + 20)} />
      </div>
    </div>
  )
}
