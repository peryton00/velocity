/**
 * SUPABASE CLIENT
 * Alpha Vector Inventory Management System
 * Replace YOUR_SUPABASE_URL and YOUR_ANON_KEY with your actual Supabase credentials
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://enwakysljyfscucnwgij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVud2FreXNsanlmc2N1Y253Z2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzg4NDQsImV4cCI6MjA5MDYxNDg0NH0.dBkZPRSA4zAHG9_AEkRduyWu9t8bwMR6J9MdxLym_Ww';

// ── Supabase Client Initialization ──
let supabase;
try {
  if (!SUPABASE_URL || !SUPABASE_URL.startsWith('http')) {
    throw new Error('Invalid Supabase configuration');
  }
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.error('Supabase initialization failed:', err.message);
}

export { supabase };

// ── Connection Status Monitoring ──
let isOnline = true;

function updateConnectionStatus(online) {
  isOnline = online;
  const badge = document.getElementById('connection-badge');
  if (!badge) return;
  if (online) {
    badge.className = 'connection-badge online';
    badge.innerHTML = `<span class="connection-dot"></span> Connected`;
  } else {
    badge.className = 'connection-badge offline';
    badge.innerHTML = `<span class="connection-dot"></span> Offline`;
  }
}

supabase.auth.onAuthStateChange((event) => {
  updateConnectionStatus(event !== 'SIGNED_OUT');
});

window.addEventListener('online',  () => updateConnectionStatus(true));
window.addEventListener('offline', () => updateConnectionStatus(false));

// Test connection on page load
supabase.from('products').select('id', { count: 'exact', head: true })
  .then(({ error }) => updateConnectionStatus(!error))
  .catch(() => updateConnectionStatus(false));

// ── Real-Time Inventory Listener ──
export function subscribeToInventory(callback) {
  return supabase
    .channel('inventory-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      (payload) => callback(payload)
    )
    .subscribe();
}

// ── PRODUCTS ──
export const Products = {
  async list(page = 1, limit = 50, search = '', category = '') {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search)   query = query.ilike('name', `%${search}%`);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count };
  },

  async get(id) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(product) {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    // Log price history if price changed
    const current = await Products.get(id);
    if (updates.unit_price && updates.unit_price !== current.unit_price) {
      await PriceHistory.log(id, current.unit_price, updates.unit_price);
    }
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async getLowStock() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lt('current_stock', supabase.raw('min_stock_alert'))
      .order('current_stock', { ascending: true });
    if (error) {
      // Fallback
      const { data: all } = await supabase.from('products').select('*');
      return (all || []).filter(p => p.current_stock < (p.min_stock_alert || 10));
    }
    return data;
  }
};

// ── PRICE HISTORY ──
export const PriceHistory = {
  async log(productId, oldPrice, newPrice) {
    const { error } = await supabase.from('price_history').insert({
      product_id: productId,
      old_price: oldPrice,
      new_price: newPrice
    });
    if (error) console.error('Price history log error:', error);
  },

  async get(productId) {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('changed_at', { ascending: true });
    if (error) throw error;
    return data;
  }
};

// ── CUSTOMERS ──
export const Customers = {
  async list(page = 1, limit = 50, search = '') {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('name')
      .range((page - 1) * limit, page * limit - 1);

    if (search) query = query.or(`name.ilike.%${search}%,company_name.ilike.%${search}%,phone.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count };
  },

  async get(id) {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(customer) {
    const { data, error } = await supabase.from('customers').insert(customer).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
  }
};

// ── INVOICES ──
export const Invoices = {
  async list(page = 1, limit = 50, filters = {}) {
    let query = supabase
      .from('invoices')
      .select('*, customers(name, company_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filters.status)     query = query.eq('status', filters.status);
    if (filters.customerId) query = query.eq('customer_id', filters.customerId);
    if (filters.from)       query = query.gte('invoice_date', filters.from);
    if (filters.to)         query = query.lte('invoice_date', filters.to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count };
  },

  async get(id) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customers(*)')
      .eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(invoice) {
    const { data, error } = await supabase.from('invoices').insert(invoice).select().single();
    if (error) throw error;
    // Deduct stock for each item
    for (const item of (invoice.items || [])) {
      if (item.product_id) {
        const product = await Products.get(item.product_id);
        await Products.update(item.product_id, {
          current_stock: Math.max(0, (product.current_stock || 0) - (item.quantity || 0))
        });
      }
    }
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async generateInvoiceNo() {
    const year  = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });
    const seq = String((count || 0) + 1).padStart(4, '0');
    return `INV-${year}${month}-${seq}`;
  }
};

// ── ORDERS ──
export const Orders = {
  async list(page = 1, limit = 50, status = '') {
    let query = supabase
      .from('orders')
      .select('*, customers(name), invoices(invoice_no, total)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count };
  },

  async get(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, customers(*), invoices(*, customers(*))')
      .eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(order) {
    const { data, error } = await supabase.from('orders').insert(order).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};

// ── PAYMENTS ──
export const Payments = {
  async list(invoiceId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(payment) {
    const { data, error } = await supabase.from('payments').insert(payment).select().single();
    if (error) throw error;
    // Update invoice status
    const total = await Payments.list(payment.invoice_id);
    const paid  = total.reduce((s, p) => s + Number(p.amount), 0);
    const inv   = await Invoices.get(payment.invoice_id);
    const status = paid >= inv.total ? 'paid' : 'partial';
    await Invoices.update(payment.invoice_id, { status });
    // Update customer outstanding
    if (inv.customer_id) {
      const customer = await Customers.get(inv.customer_id);
      const outstanding = Math.max(0, (customer.outstanding_balance || 0) - Number(payment.amount));
      await Customers.update(inv.customer_id, { outstanding_balance: outstanding });
    }
    return data;
  }
};

// ── OFFERS ──
export const Offers = {
  async list() {
    const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(offer) {
    const { data, error } = await supabase.from('offers').insert(offer).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('offers').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) throw error;
  }
};

// ── DASHBOARD STATS ──
export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];

  const [salesRes, pendingRes, lowStockRes, outstandingRes] = await Promise.all([
    supabase.from('invoices').select('total').eq('invoice_date', today).neq('status', 'draft'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('id', { count: 'exact', head: true }).lt('current_stock', 10),
    supabase.from('customers').select('outstanding_balance').gt('outstanding_balance', 0)
  ]);

  const todaySales = (salesRes.data || []).reduce((s, r) => s + Number(r.total || 0), 0);
  const outstandingTotal = (outstandingRes.data || []).reduce((s, r) => s + Number(r.outstanding_balance || 0), 0);

  return {
    todaySales,
    pendingOrders: pendingRes.count || 0,
    lowStockCount: lowStockRes.count || 0,
    outstandingPayments: outstandingTotal
  };
}

// ── SALES CHART DATA (last 30 days) ──
export async function getSalesChartData() {
  const days = [];
  const labels = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push(dateStr);
    labels.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
  }

  const from = days[0];
  const to   = days[days.length - 1];

  const { data } = await supabase
    .from('invoices')
    .select('invoice_date, total')
    .gte('invoice_date', from)
    .lte('invoice_date', to)
    .neq('status', 'draft');

  const salesMap = {};
  days.forEach(d => { salesMap[d] = 0; });
  (data || []).forEach(inv => {
    if (salesMap[inv.invoice_date] !== undefined) {
      salesMap[inv.invoice_date] += Number(inv.total || 0);
    }
  });

  return { labels, data: days.map(d => salesMap[d]) };
}

export default supabase;
