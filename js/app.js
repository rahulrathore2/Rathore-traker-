/**
 * Rathore Money Tracker - Core Application Logic
 * Full offline PWA, LocalStorage persistence, Chart.js analytics & Excel export
 */

// --- Initial Constants & Categories ---
const EXPENSE_CATEGORIES = [
  { id: 'Food', name: 'Food', icon: 'utensils', emoji: '🍛', color: '#f59e0b' },
  { id: 'Groceries', name: 'Groceries', icon: 'shopping-cart', emoji: '🛒', color: '#10b981' },
  { id: 'Travel', name: 'Travel', icon: 'car', emoji: '🛺', color: '#3b82f6' },
  { id: 'Shopping', name: 'Shopping', icon: 'shopping-bag', emoji: '🛍️', color: '#ec4899' },
  { id: 'Bills', name: 'Bills', icon: 'zap', emoji: '💡', color: '#8b5cf6' },
  { id: 'Entertainment', name: 'Fun', icon: 'film', emoji: '🎬', color: '#f43f5e' },
  { id: 'Health', name: 'Health', icon: 'heart-pulse', emoji: '💊', color: '#06b6d4' },
  { id: 'Other', name: 'Other', icon: 'more-horizontal', emoji: '📦', color: '#64748b' }
];

const INCOME_CATEGORIES = [
  { id: 'Salary', name: 'Salary', icon: 'briefcase', emoji: '💼', color: '#10b981' },
  { id: 'Business', name: 'Business', icon: 'trending-up', emoji: '📈', color: '#6366f1' },
  { id: 'Freelance', name: 'Freelance', icon: 'laptop', emoji: '💻', color: '#0ea5e9' },
  { id: 'Investment', name: 'Investment', icon: 'dollar-sign', emoji: '💰', color: '#8b5cf6' },
  { id: 'Gift', name: 'Gift', icon: 'gift', emoji: '🎁', color: '#ec4899' },
  { id: 'Other', name: 'Other', icon: 'plus-circle', emoji: '🪙', color: '#64748b' }
];

const CURRENCIES = {
  INR: { symbol: '₹', code: 'INR' },
  USD: { symbol: '$', code: 'USD' },
  EUR: { symbol: '€', code: 'EUR' },
  GBP: { symbol: '£', code: 'GBP' },
  AED: { symbol: 'AED', code: 'AED' }
};

// --- Application State ---
let state = {
  transactions: [],
  budget: 25000,
  currency: 'INR',
  theme: 'dark',
  balanceVisible: true,
  currentModalType: 'expense',
  selectedCategory: 'Food',
  filterType: 'all',
  searchQuery: '',
  charts: {
    donut: null,
    trend: null
  }
};

// --- Sample Seed Data (For first-time open) ---
const SEED_DATA = [
  {
    id: 'seed-1',
    type: 'income',
    amount: 45000,
    category: 'Salary',
    mode: 'Card',
    date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    note: 'Monthly Salary Credit',
    createdAt: Date.now() - 6 * 86400000
  },
  {
    id: 'seed-2',
    type: 'expense',
    amount: 1850,
    category: 'Groceries',
    mode: 'UPI',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    note: 'Monthly Ration & Snacks',
    createdAt: Date.now() - 4 * 86400000
  },
  {
    id: 'seed-3',
    type: 'expense',
    amount: 280,
    category: 'Food',
    mode: 'UPI',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    note: 'Lunch at Cafe',
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: 'seed-4',
    type: 'expense',
    amount: 120,
    category: 'Travel',
    mode: 'UPI',
    date: new Date().toISOString().split('T')[0],
    note: 'Auto Rickshaw & Metro',
    createdAt: Date.now() - 100000
  },
  {
    id: 'seed-5',
    type: 'expense',
    amount: 50,
    category: 'Food',
    mode: 'Cash',
    date: new Date().toISOString().split('T')[0],
    note: 'Evening Tea / Snacks',
    createdAt: Date.now() - 50000
  }
];

// --- Storage Handlers ---
function loadState() {
  try {
    const saved = localStorage.getItem('rathore_tracker_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
    } else {
      state.transactions = [...SEED_DATA];
      saveState();
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
    state.transactions = [...SEED_DATA];
  }
}

function saveState() {
  try {
    const toSave = {
      transactions: state.transactions,
      budget: state.budget,
      currency: state.currency,
      theme: state.theme,
      balanceVisible: state.balanceVisible
    };
    localStorage.setItem('rathore_tracker_state', JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

// --- Formatting Helpers ---
function formatCurrency(amount, withSymbol = true) {
  const sym = CURRENCIES[state.currency]?.symbol || '₹';
  const val = Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
  return withSymbol ? `${sym}${val}` : val;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// --- Toast Notifications ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'danger' ? '⚠️' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// --- DOM Rendering & Updates ---
function updateDateDisplay() {
  const now = new Date();
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  const dateEl = document.getElementById('current-date-text');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-IN', options);
}

function updateSummaryCards() {
  let income = 0;
  let expense = 0;

  state.transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'income') income += amt;
    else expense += amt;
  });

  const balance = income - expense;
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;

  // Hero Card
  const heroBalance = document.getElementById('hero-total-balance');
  const heroIncome = document.getElementById('hero-income');
  const heroExpenses = document.getElementById('hero-expenses');
  const savingsBadge = document.getElementById('savings-rate-badge');

  if (heroBalance) {
    heroBalance.textContent = state.balanceVisible ? formatCurrency(balance) : '••••••';
  }
  if (heroIncome) heroIncome.textContent = formatCurrency(income);
  if (heroExpenses) heroExpenses.textContent = formatCurrency(expense);
  if (savingsBadge) savingsBadge.textContent = `Savings: ${savingsRate}%`;

  // Budget Progress Card
  const budgetSpentText = document.getElementById('budget-spent-text');
  const budgetTotalText = document.getElementById('budget-total-text');
  const budgetBar = document.getElementById('budget-progress-bar');
  const budgetAlert = document.getElementById('budget-alert-text');

  const budget = state.budget || 25000;
  const percentUsed = Math.min(100, Math.round((expense / budget) * 100));
  const remaining = budget - expense;

  if (budgetSpentText) budgetSpentText.textContent = `${formatCurrency(expense)} spent`;
  if (budgetTotalText) budgetTotalText.textContent = `of ${formatCurrency(budget)} limit`;
  if (budgetBar) {
    budgetBar.style.width = `${percentUsed}%`;
    if (percentUsed > 90) {
      budgetBar.className = 'bg-gradient-to-r from-amber-500 to-rose-600 h-2.5 rounded-full transition-all duration-500';
    } else if (percentUsed > 70) {
      budgetBar.className = 'bg-gradient-to-r from-indigo-500 to-amber-500 h-2.5 rounded-full transition-all duration-500';
    } else {
      budgetBar.className = 'bg-gradient-to-r from-emerald-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500';
    }
  }

  if (budgetAlert) {
    budgetAlert.innerHTML = `
      <span>Remaining: ${formatCurrency(remaining)}</span>
      <span class="${percentUsed > 90 ? 'text-rose-400 font-bold' : ''}">${percentUsed}% used</span>
    `;
  }
}

function createTransactionItemHTML(t) {
  const isExp = t.type === 'expense';
  const categoryObj = (isExp ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).find(c => c.id === t.category) || {
    name: t.category, emoji: '💵', color: '#6366f1'
  };

  return `
    <div class="glass-card p-3 flex items-center justify-between tap-effect" data-id="${t.id}">
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0" style="background-color: ${categoryObj.color}20; color: ${categoryObj.color};">
          ${categoryObj.emoji}
        </div>
        <div class="truncate">
          <p class="text-xs font-bold text-white truncate">${t.note || categoryObj.name}</p>
          <div class="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
            <span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">${t.mode || 'UPI'}</span>
            <span>•</span>
            <span>${formatDate(t.date)}</span>
          </div>
        </div>
      </div>
      <div class="text-right shrink-0 ml-3">
        <p class="text-xs font-extrabold ${isExp ? 'text-rose-400' : 'text-emerald-400'}">
          ${isExp ? '-' : '+'}${formatCurrency(t.amount)}
        </p>
        <button class="delete-trans-btn text-[10px] text-slate-500 hover:text-rose-400 font-medium mt-0.5" data-id="${t.id}">
          Delete
        </button>
      </div>
    </div>
  `;
}

function renderRecentTransactions() {
  const container = document.getElementById('recent-transactions-list');
  if (!container) return;

  const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt);
  const recent = sorted.slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="glass-card p-6 text-center text-slate-400 text-xs">
        No transactions recorded yet. Tap <strong>+</strong> to add your first expense or income!
      </div>
    `;
    return;
  }

  container.innerHTML = recent.map(createTransactionItemHTML).join('');
  attachDeleteListeners();
}

function renderAllTransactions() {
  const container = document.getElementById('all-transactions-list');
  if (!container) return;

  let filtered = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt);

  // Filter Type
  if (state.filterType === 'expense') {
    filtered = filtered.filter(t => t.type === 'expense');
  } else if (state.filterType === 'income') {
    filtered = filtered.filter(t => t.type === 'income');
  } else if (state.filterType === 'upi') {
    filtered = filtered.filter(t => (t.mode || '').toUpperCase() === 'UPI');
  } else if (state.filterType === 'cash') {
    filtered = filtered.filter(t => (t.mode || '').toUpperCase() === 'CASH');
  }

  // Search Query
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      (t.note && t.note.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.mode && t.mode.toLowerCase().includes(q)) ||
      t.amount.toString().includes(q)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-card p-8 text-center text-slate-400 text-xs">
        No matching transactions found.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(createTransactionItemHTML).join('');
  attachDeleteListeners();
}

function attachDeleteListeners() {
  document.querySelectorAll('.delete-trans-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this transaction?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState();
        updateUI();
        showToast('Transaction removed', 'warning');
      }
    };
  });
}

// --- Category Grid Population in Modal ---
function renderCategorySelector(type = 'expense') {
  const container = document.getElementById('category-selector-container');
  if (!container) return;

  const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  if (!cats.some(c => c.id === state.selectedCategory)) {
    state.selectedCategory = cats[0].id;
  }

  container.innerHTML = cats.map(c => `
    <button type="button" class="category-chip tap-effect flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition ${c.id === state.selectedCategory ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700'}" data-category="${c.id}">
      <span class="text-base mb-0.5">${c.emoji}</span>
      <span class="text-[10px] truncate max-w-full font-semibold">${c.name}</span>
    </button>
  `).join('');

  container.querySelectorAll('.category-chip').forEach(chip => {
    chip.onclick = () => {
      state.selectedCategory = chip.getAttribute('data-category');
      renderCategorySelector(state.currentModalType);
    };
  });
}

// --- Charts & Analytics ---
function renderAnalytics() {
  const expenseTransactions = state.transactions.filter(t => t.type === 'expense');

  // Category totals
  const categoryTotals = {};
  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
  });

  const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  
  // Top category
  const topCatEl = document.getElementById('stat-top-category');
  if (topCatEl) {
    topCatEl.textContent = sortedCats.length > 0 ? `${sortedCats[0][0]} (${formatCurrency(sortedCats[0][1])})` : 'None';
  }

  // Avg daily spend (last 30 days)
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const avgDaily = expenseTransactions.length > 0 ? Math.round(totalExpense / 30) : 0;
  const avgDailyEl = document.getElementById('stat-avg-spend');
  if (avgDailyEl) avgDailyEl.textContent = `${formatCurrency(avgDaily)}/day`;

  // Destroy previous charts
  if (state.charts.donut) state.charts.donut.destroy();
  if (state.charts.trend) state.charts.trend.destroy();

  // Donut Chart
  const donutCtx = document.getElementById('categoryDonutChart')?.getContext('2d');
  if (donutCtx) {
    const labels = sortedCats.map(c => c[0]);
    const data = sortedCats.map(c => c[1]);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

    state.charts.donut = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: data.length ? colors.slice(0, data.length) : ['#334155'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 10 }, color: '#94a3b8' }
          }
        },
        cutout: '68%'
      }
    });
  }

  // Trend Chart (Last 7 Days)
  const trendCtx = document.getElementById('spendingTrendChart')?.getContext('2d');
  if (trendCtx) {
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      daysMap[key] = { label, amount: 0 };
    }

    expenseTransactions.forEach(t => {
      if (daysMap[t.date]) {
        daysMap[t.date].amount += parseFloat(t.amount);
      }
    });

    const trendLabels = Object.values(daysMap).map(v => v.label);
    const trendValues = Object.values(daysMap).map(v => v.amount);

    state.charts.trend = new Chart(trendCtx, {
      type: 'bar',
      data: {
        labels: trendLabels,
        datasets: [{
          label: 'Daily Expense',
          data: trendValues,
          backgroundColor: '#6366f1',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
        }
      }
    });
  }
}

// --- Tab Navigation ---
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.nav-item[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = tab.getAttribute('data-tab');
      ['tab-dashboard', 'tab-transactions', 'tab-analytics', 'tab-settings'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          if (id === targetId) {
            el.classList.remove('hidden');
          } else {
            el.classList.add('hidden');
          }
        }
      });

      if (targetId === 'tab-analytics') renderAnalytics();
      if (targetId === 'tab-transactions') renderAllTransactions();
      if (targetId === 'tab-dashboard') updateUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // "See All" button on dashboard
  document.getElementById('view-all-transactions-btn')?.addEventListener('click', () => {
    const recordsTabBtn = document.querySelector('.nav-item[data-tab="tab-transactions"]');
    if (recordsTabBtn) recordsTabBtn.click();
  });
}

// --- Modal Handlers ---
function openTransactionModal(editId = null) {
  const modal = document.getElementById('transaction-modal');
  const dateInput = document.getElementById('trans-date');
  const amountInput = document.getElementById('trans-amount');
  const noteInput = document.getElementById('trans-note');
  const idInput = document.getElementById('trans-id');

  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  if (amountInput) amountInput.value = '';
  if (noteInput) noteInput.value = '';
  if (idInput) idInput.value = '';

  state.currentModalType = 'expense';
  updateModalTypeUI();
  renderCategorySelector('expense');

  modal.classList.add('active');
  if (amountInput) amountInput.focus();
}

function closeModal() {
  document.getElementById('transaction-modal')?.classList.remove('active');
  document.getElementById('budget-modal')?.classList.remove('active');
}

function updateModalTypeUI() {
  const expBtn = document.getElementById('type-expense-btn');
  const incBtn = document.getElementById('type-income-btn');
  if (state.currentModalType === 'expense') {
    expBtn.className = 'py-2 rounded-xl text-xs font-bold transition bg-rose-600 text-white shadow-md';
    incBtn.className = 'py-2 rounded-xl text-xs font-bold transition text-slate-400 hover:text-white';
  } else {
    expBtn.className = 'py-2 rounded-xl text-xs font-bold transition text-slate-400 hover:text-white';
    incBtn.className = 'py-2 rounded-xl text-xs font-bold transition bg-emerald-600 text-white shadow-md';
  }
}

// --- Data Export & Import ---
function exportCSV() {
  if (state.transactions.length === 0) {
    showToast('No transactions to export', 'warning');
    return;
  }

  const headers = ['ID', 'Type', 'Amount', 'Currency', 'Category', 'Mode', 'Date', 'Note'];
  const rows = state.transactions.map(t => [
    t.id,
    t.type,
    t.amount,
    state.currency,
    `"${t.category || ''}"`,
    `"${t.mode || ''}"`,
    t.date,
    `"${(t.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Rathore_Money_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('Excel/CSV export downloaded!');
}

function exportJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `Rathore_Tracker_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast('Backup file downloaded!');
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported.transactions)) {
        state.transactions = imported.transactions;
        if (imported.budget) state.budget = imported.budget;
        if (imported.currency) state.currency = imported.currency;
        saveState();
        updateUI();
        showToast('Backup restored successfully!');
      } else {
        showToast('Invalid backup file structure', 'danger');
      }
    } catch (err) {
      showToast('Error reading backup file', 'danger');
    }
  };
  reader.readAsText(file);
}

// --- Global UI Refresh ---
function updateUI() {
  updateSummaryCards();
  renderRecentTransactions();
  if (lucide) lucide.createIcons();
}

// --- Initialization & Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateDateDisplay();
  setupTabNavigation();

  // Apply currency in UI
  const curSymbol = CURRENCIES[state.currency]?.symbol || '₹';
  document.getElementById('active-currency-symbol').textContent = curSymbol;
  document.getElementById('active-currency-code').textContent = state.currency;
  document.getElementById('input-currency-symbol').textContent = curSymbol;
  document.getElementById('setting-currency-select').value = state.currency;
  document.getElementById('setting-budget-input').value = state.budget || 25000;

  // Toggle Balance Visibility
  document.getElementById('toggle-balance-visibility')?.addEventListener('click', () => {
    state.balanceVisible = !state.balanceVisible;
    saveState();
    updateUI();
  });

  // Modal Open & Close Buttons
  document.getElementById('open-add-modal-btn')?.addEventListener('click', () => openTransactionModal());
  document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
  document.getElementById('close-budget-modal-btn')?.addEventListener('click', closeModal);

  // Quick Add Presets
  document.querySelectorAll('.quick-add-btn').forEach(btn => {
    btn.onclick = () => {
      const amount = parseFloat(btn.getAttribute('data-amount'));
      const cat = btn.getAttribute('data-cat');
      const note = btn.getAttribute('data-note');

      state.transactions.unshift({
        id: 'trans-' + Date.now(),
        type: 'expense',
        amount: amount,
        category: cat,
        mode: 'UPI',
        date: new Date().toISOString().split('T')[0],
        note: note,
        createdAt: Date.now()
      });

      saveState();
      updateUI();
      showToast(`Added ${formatCurrency(amount)} for ${note}!`);
    };
  });

  // Quick Amount Chips in Modal
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.onclick = () => {
      const val = parseFloat(chip.getAttribute('data-val'));
      const input = document.getElementById('trans-amount');
      const current = parseFloat(input.value) || 0;
      input.value = current + val;
    };
  });

  // Type Toggle Buttons (Expense vs Income)
  document.getElementById('type-expense-btn')?.addEventListener('click', () => {
    state.currentModalType = 'expense';
    updateModalTypeUI();
    renderCategorySelector('expense');
  });

  document.getElementById('type-income-btn')?.addEventListener('click', () => {
    state.currentModalType = 'income';
    updateModalTypeUI();
    renderCategorySelector('income');
  });

  // Transaction Form Submit
  document.getElementById('transaction-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const date = document.getElementById('trans-date').value;
    const note = document.getElementById('trans-note').value;
    const mode = document.querySelector('input[name="payment-mode"]:checked')?.value || 'UPI';

    if (!amount || isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'danger');
      return;
    }

    state.transactions.unshift({
      id: 'trans-' + Date.now(),
      type: state.currentModalType,
      amount: amount,
      category: state.selectedCategory,
      mode: mode,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim() || state.selectedCategory,
      createdAt: Date.now()
    });

    saveState();
    closeModal();
    updateUI();
    showToast(`${state.currentModalType === 'income' ? 'Income' : 'Expense'} added successfully!`);
  });

  // Budget Modal Handlers
  document.getElementById('edit-budget-btn')?.addEventListener('click', () => {
    document.getElementById('quick-budget-input').value = state.budget;
    document.getElementById('budget-modal').classList.add('active');
  });

  document.getElementById('save-quick-budget-btn')?.addEventListener('click', () => {
    const val = parseFloat(document.getElementById('quick-budget-input').value);
    if (val && val > 0) {
      state.budget = val;
      saveState();
      closeModal();
      updateUI();
      showToast('Budget goal updated!');
    }
  });

  document.getElementById('save-budget-setting-btn')?.addEventListener('click', () => {
    const val = parseFloat(document.getElementById('setting-budget-input').value);
    if (val && val > 0) {
      state.budget = val;
      saveState();
      updateUI();
      showToast('Budget goal saved!');
    }
  });

  // Currency Setting
  document.getElementById('setting-currency-select')?.addEventListener('change', (e) => {
    state.currency = e.target.value;
    saveState();
    location.reload();
  });

  // Filter Chips on Records Tab
  document.querySelectorAll('.filter-type-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-type-btn').forEach(b => {
        b.className = 'filter-type-btn px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 shrink-0';
      });
      btn.className = 'filter-type-btn px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold shrink-0';
      state.filterType = btn.getAttribute('data-type');
      renderAllTransactions();
    };
  });

  // Search Input
  document.getElementById('transaction-search')?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderAllTransactions();
  });

  // Data Export / Import Buttons
  document.getElementById('export-csv-btn')?.addEventListener('click', exportCSV);
  document.getElementById('export-json-btn')?.addEventListener('click', exportJSON);
  document.getElementById('import-json-input')?.addEventListener('change', (e) => {
    if (e.target.files?.[0]) importJSON(e.target.files[0]);
  });

  // Clear All Data
  document.getElementById('clear-all-data-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all transactions and reset data?')) {
      state.transactions = [];
      saveState();
      updateUI();
      showToast('All data has been reset', 'warning');
    }
  });

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Initial render
  updateUI();
});
