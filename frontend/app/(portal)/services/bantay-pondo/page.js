'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './pondo.module.css';

function formatPeso(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

// SVG Donut Chart component
function DonutChart({ categories }) {
  const total = categories.reduce((s, c) => s + (c.allocated_amount || 0), 0);
  if (total === 0) return <div className={styles.donut}><p>No data</p></div>;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={styles.donutContainer}>
      <div className={styles.donut}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          {categories.map((cat, i) => {
            const pct = (cat.allocated_amount || 0) / total;
            const dash = pct * circumference;
            const gap = circumference - dash;
            const segment = (
              <circle key={i} cx="90" cy="90" r={radius} fill="none"
                stroke={cat.color_hex || '#ccc'} strokeWidth="24"
                strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset}
                style={{ transition: 'all 1s ease' }} />
            );
            offset += dash;
            return segment;
          })}
          <circle cx="90" cy="90" r="56" fill="white" />
        </svg>
        <div className={styles.donutCenter}>
          <div className={styles.val}>{formatPeso(total)}</div>
          <div className={styles.lab}>Total Budget</div>
        </div>
      </div>
      <div className={styles.legend}>
        {categories.map((cat, i) => (
          <div key={i} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: cat.color_hex }} />
            <span className={styles.legendLabel}>{cat.name}</span>
            <span className={styles.legendValue}>{formatPeso(cat.allocated_amount || 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BantayPondoPage() {
  const [data, setData] = useState(null);
  const [expenditures, setExpenditures] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const budget = await api.get('/budget/overview');
        setData(budget);
        if (budget.categories?.length > 0) {
          const first = budget.categories[0];
          setSelectedCat(first);
          if (first.allocation_id) {
            const exp = await api.get(`/budget/expenditures/${first.allocation_id}`);
            setExpenditures(exp);
          }
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, []);

  async function selectCategory(cat) {
    setSelectedCat(cat);
    if (cat.allocation_id) {
      try {
        const exp = await api.get(`/budget/expenditures/${cat.allocation_id}`);
        setExpenditures(exp);
      } catch (err) { setExpenditures([]); }
    } else {
      setExpenditures([]);
    }
  }

  if (loading) {
    return <div className={styles.pondo}><p>Loading budget data...</p></div>;
  }

  if (!data) {
    return <div className={styles.pondo}><p>Failed to load budget data.</p></div>;
  }

  const totalBudget = data.total_allocated || 0;
  const totalSpent = data.total_spent || 0;
  const remaining = totalBudget - totalSpent;
  const utilization = data.utilization_rate || 0;

  return (
    <div className={styles.pondo}>
      <div className={styles.header}>
        <h1>💰 Bantay-Pondo</h1>
        <p className={styles.subtitle}>
          Interactive Budget Tracker — See exactly where youth funds are invested
          <span className={styles.fiscalSelect}>FY {data.fiscal_year}</span>
        </p>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard} style={{ animationDelay: '0s' }}>
          <div className={styles.summaryLabel}>Total ABYIP Budget</div>
          <div className={styles.summaryValue}>{formatPeso(totalBudget)}</div>
          <div className={styles.summaryMeta}>Fiscal Year {data.fiscal_year}</div>
        </div>
        <div className={styles.summaryCard} style={{ animationDelay: '0.1s' }}>
          <div className={styles.summaryLabel}>Total Expenditures</div>
          <div className={styles.summaryValue}>{formatPeso(totalSpent)}</div>
          <div className={styles.summaryMeta}>{utilization}% utilized</div>
        </div>
        <div className={styles.summaryCard} style={{ animationDelay: '0.2s' }}>
          <div className={styles.summaryLabel}>Remaining Funds</div>
          <div className={`${styles.summaryValue} ${styles.green}`}>{formatPeso(remaining)}</div>
          <div className={styles.summaryMeta}>{(100 - utilization).toFixed(1)}% available</div>
        </div>
        <div className={styles.summaryCard} style={{ animationDelay: '0.3s' }}>
          <div className={styles.summaryLabel}>Budget Categories</div>
          <div className={styles.summaryValue}>{data.categories?.length || 0}</div>
          <div className={styles.summaryMeta}>Active allocations</div>
        </div>
      </div>

      {/* ─── Charts ─── */}
      <div className={styles.chartSection}>
        <div className={styles.chartCard} style={{ animationDelay: '0.2s' }}>
          <h3>📊 Budget Allocation</h3>
          <DonutChart categories={data.categories || []} />
        </div>
        <div className={styles.chartCard} style={{ animationDelay: '0.3s' }}>
          <h3>📈 Spending Progress</h3>
          <div className={styles.barList}>
            {(data.categories || []).map((cat, i) => {
              const allocated = cat.allocated_amount || 0;
              const spent = cat.spent_amount || 0;
              const pct = allocated > 0 ? ((spent / allocated) * 100).toFixed(0) : 0;
              return (
                <div key={i} className={styles.barItem}>
                  <div className={styles.barHeader}>
                    <span className={styles.barLabel}>
                      <span className={styles.legendDot} style={{ background: cat.color_hex, display: 'inline-block' }} />
                      {cat.name}
                    </span>
                    <span className={styles.barPercent}>{pct}%</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%`, background: cat.color_hex }} />
                  </div>
                  <div className={styles.barAmounts}>
                    <span>{formatPeso(spent)} spent</span>
                    <span>{formatPeso(allocated)} allocated</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Expenditure Details ─── */}
      <div className={styles.expenditureSection} style={{ animationDelay: '0.4s' }}>
        <h3>📋 Expenditure Details</h3>
        <div className={styles.catTabs}>
          {(data.categories || []).map((cat, i) => (
            <button key={i}
              className={`${styles.catTab} ${selectedCat?.id === cat.id ? styles.catTabActive : ''}`}
              onClick={() => selectCategory(cat)}>
              {cat.name}
            </button>
          ))}
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Recorded By</th>
            </tr>
          </thead>
          <tbody>
            {expenditures.length === 0 ? (
              <tr><td colSpan={4} className={styles.emptyRow}>No expenditures recorded for this category yet.</td></tr>
            ) : expenditures.map(exp => (
              <tr key={exp.id}>
                <td>{exp.description}</td>
                <td className={styles.amount}>{formatPeso(exp.amount)}</td>
                <td>{new Date(exp.date_spent).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>{exp.admin_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
