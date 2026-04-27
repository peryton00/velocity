/**
 * CHART CONFIGURATIONS
 * VELOCITY CYCLES Inventory Management System
 * Green-themed charts using Chart.js
 */

export const chartColors = {
  primary:   '#059100',   // Fir Green
  secondary: '#A8C084',   // Frosted Green
  accent:    '#F0F592',   // Kiwi Green
  dark:      '#005900',   // Dark Green
  success:   '#4A9062',   // Success Green
  danger:    '#EF4444',
  warning:   '#F59E0B',
  blue:      '#3B82F6'
};

// Chart.js Global Defaults
export function applyChartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size   = 12;
  Chart.defaults.color       = '#374151';
  Chart.defaults.borderColor = '#f1f5f9';
}

// ── SALES LINE CHART (Dashboard) ──
export function createSalesLineChart(canvasId, labels = [], data = []) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  // Destroy if exists
  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Daily Sales (₹)',
        data,
        borderColor: chartColors.primary,
        backgroundColor: createGradient(ctx, chartColors.primary),
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: chartColors.dark,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: chartColors.dark,
          bodyColor: chartColors.dark,
          borderColor: chartColors.primary,
          borderWidth: 2,
          padding: 10,
          callbacks: {
            label: (ctx) => ` ₹${Number(ctx.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#9CA3AF',
            maxTicksLimit: 10,
            font: { size: 11 }
          }
        },
        y: {
          grid: { color: '#f1f5f9', drawBorder: false },
          ticks: {
            color: chartColors.dark,
            font: { size: 11 },
            callback: (v) => '₹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
          }
        }
      }
    }
  });
}

// ── CUSTOMER PURCHASE BAR CHART ──
export function createCustomerBarChart(canvasId, labels = [], data = []) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Purchase Amount (₹)',
        data,
        backgroundColor: data.map((_, i) =>
          i % 2 === 0 ? chartColors.primary : chartColors.secondary
        ),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: chartColors.dark,
          bodyColor: chartColors.dark,
          borderColor: chartColors.primary,
          borderWidth: 2,
          callbacks: {
            label: (ctx) => ` ₹${Number(ctx.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 } } },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            color: chartColors.dark,
            callback: (v) => '₹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
          }
        }
      }
    }
  });
}

// ── PRICE HISTORY MULTI-LINE CHART ──
export function createPriceHistoryChart(canvasId, datasets = []) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const greenShades = [
    chartColors.primary, chartColors.dark, chartColors.success,
    chartColors.secondary, '#2d7a00', '#7ab060', '#b0d090'
  ];

  const chartDatasets = datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    borderColor: greenShades[i % greenShades.length],
    backgroundColor: 'transparent',
    tension: 0.4,
    pointRadius: 4,
    pointBackgroundColor: greenShades[i % greenShades.length],
    pointBorderColor: '#fff',
    pointBorderWidth: 2
  }));

  return new Chart(ctx, {
    type: 'line',
    data: { labels: datasets[0]?.labels || [], datasets: chartDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: chartColors.dark, usePointStyle: true, padding: 16, font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: chartColors.dark,
          bodyColor: '#374151',
          borderColor: chartColors.primary,
          borderWidth: 2,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ₹${Number(ctx.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 10 } } },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            color: chartColors.dark,
            callback: (v) => '₹' + Number(v).toLocaleString('en-IN')
          }
        }
      }
    }
  });
}

// ── CATEGORY PIE CHART ──
export function createCategoryPieChart(canvasId, labels = [], data = []) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          chartColors.primary, chartColors.dark, chartColors.success,
          chartColors.secondary, chartColors.accent, '#7ab060', '#2d7a00'
        ],
        borderWidth: 3,
        borderColor: '#fff',
        hoverBorderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: chartColors.dark, usePointStyle: true, padding: 12, font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: chartColors.dark,
          bodyColor: '#374151',
          borderColor: chartColors.primary,
          borderWidth: 2
        }
      }
    }
  });
}

// ── GST SUMMARY BAR CHART ──
export function createGSTChart(canvasId, cgst = 0, sgst = 0, igst = 0) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['CGST', 'SGST', 'IGST'],
      datasets: [{
        label: 'GST Amount (₹)',
        data: [cgst, sgst, igst],
        backgroundColor: [chartColors.primary, chartColors.success, chartColors.dark],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: chartColors.dark,
          bodyColor: '#374151',
          borderColor: chartColors.primary,
          borderWidth: 2,
          callbacks: {
            label: (ctx) => ` ₹${Number(ctx.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: chartColors.dark, font: { weight: '700' } } },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: { color: chartColors.dark, callback: (v) => '₹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v) }
        }
      }
    }
  });
}

// ── STOCK LEVEL BAR CHART ──
export function createStockChart(canvasId, products = []) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  const existing = Chart.getChart(ctx);
  if (existing) existing.destroy();

  const labels = products.map(p => p.name.length > 12 ? p.name.substring(0, 12) + '…' : p.name);
  const data   = products.map(p => p.current_stock);
  const colors = products.map(p =>
    p.current_stock < 10 ? '#EF4444' :
    p.current_stock < 25 ? '#F59E0B' : chartColors.primary
  );

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Stock Qty',
        data,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: chartColors.dark,
          bodyColor: '#374151',
          borderColor: chartColors.primary,
          borderWidth: 2
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 10 } } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: chartColors.dark } }
      }
    }
  });
}

// ── GRADIENT HELPER ──
function createGradient(ctx, color) {
  try {
    const canvas = ctx.canvas || ctx;
    const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '05');
    return gradient;
  } catch {
    return color + '20';
  }
}

export default { applyChartDefaults, createSalesLineChart, createCustomerBarChart, createPriceHistoryChart, createCategoryPieChart, createGSTChart, createStockChart };
