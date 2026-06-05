// TradeX AI - Web Application
const App = {
  user: null, balance: 999999999, portfolio: { holdings: [], totalValue: 0, totalInvested: 0, totalPnl: 0, roi: 0 },
  trades: [], xp: 0, level: 'Beginner', streak: 0, dailyClaimed: false, loginStreak: 0, lastLoginDate: null,
  selectedAsset: 'BTC', isBuy: true, orderType: 'market', referralCount: 0,

  ASSETS: [
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', price: 67500, change: 2.4 },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto', price: 3450, change: 1.8 },
    { symbol: 'SOL', name: 'Solana', type: 'crypto', price: 142, change: 5.2 },
    { symbol: 'BNB', name: 'BNB', type: 'crypto', price: 580, change: -0.5 },
    { symbol: 'XRP', name: 'Ripple', type: 'crypto', price: 0.62, change: 3.1 },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', price: 178, change: 0.8 },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', price: 245, change: 3.5 },
    { symbol: 'GOOGL', name: 'Alphabet', type: 'stock', price: 141, change: -1.2 },
    { symbol: 'EUR/USD', name: 'Euro/USD', type: 'forex', price: 1.08, change: 0.1 },
    { symbol: 'XAU/USD', name: 'Gold', type: 'commodity', price: 2330, change: 0.6 },
  ],

  formatAmount(amount) {
    if (!amount) return '$0.00';
    if (amount >= 1e9) return '$' + (amount / 1e9).toFixed(2) + 'B';
    if (amount >= 1e6) return '$' + (amount / 1e6).toFixed(2) + 'M';
    if (amount >= 1e3) return '$' + (amount / 1e3).toFixed(1) + 'K';
    return '$' + amount.toFixed(2);
  },

  formatPrice(p) {
    if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return '$' + p.toFixed(2);
    return '$' + p.toFixed(4);
  },

  init() {
    this.loadState();
    this.bindEvents();
    this.runSplash();
  },

  loadState() {
    try {
      const saved = localStorage.getItem('tradex_user');
      if (saved) {
        const data = JSON.parse(saved);
        this.user = data.user;
        this.balance = data.balance || 999999999;
        this.portfolio = data.portfolio || { holdings: [], totalValue: 0, totalInvested: 0, totalPnl: 0, roi: 0 };
        this.trades = data.trades || [];
        this.xp = data.xp || 0;
        this.level = data.level || 'Beginner';
        this.streak = data.streak || 0;
        this.dailyClaimed = data.dailyClaimed || false;
        this.lastLoginDate = data.lastLoginDate || null;
        this.loginStreak = data.loginStreak || 0;
        this.referralCount = data.referralCount || 0;
      }
    } catch (e) {}
  },

  saveState() {
    try {
      localStorage.setItem('tradex_user', JSON.stringify({
        user: this.user, balance: this.balance, portfolio: this.portfolio,
        trades: this.trades, xp: this.xp, level: this.level, streak: this.streak,
        dailyClaimed: this.dailyClaimed, lastLoginDate: this.lastLoginDate,
        loginStreak: this.loginStreak, referralCount: this.referralCount,
      }));
    } catch (e) {}
  },

  runSplash() {
    const statuses = [
      [15, 'Initializing engine...'], [30, 'Loading markets...'],
      [50, 'Connecting AI...'], [70, 'Preparing dashboard...'],
      [85, 'Almost ready...'], [100, 'Welcome to TradeX AI!'],
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= statuses.length) { clearInterval(interval); this.afterSplash(); return; }
      document.getElementById('splashProgress').style.width = statuses[i][0] + '%';
      document.getElementById('splashStatus').textContent = statuses[i][1];
      i++;
    }, 350);
  },

  afterSplash() {
    setTimeout(() => {
      document.getElementById('splash').classList.add('hidden');
      if (this.user) {
        this.enterApp();
      } else {
        document.getElementById('authScreen').classList.remove('hidden');
      }
    }, 400);
  },

  enterApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    this.updateUI();
    this.renderDashboard();
    this.renderAssets();
    this.renderTrade();
    this.renderPortfolio();
    this.renderRewards();
    this.renderSettings();
  },

  bindEvents() {
    // Auth
    document.getElementById('showRegister').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('registerForm').classList.remove('hidden');
    });
    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('registerForm').classList.add('hidden');
      document.getElementById('loginForm').classList.remove('hidden');
    });
    document.getElementById('loginBtn').addEventListener('click', () => this.login());
    document.getElementById('registerBtn').addEventListener('click', () => this.register());
    document.getElementById('googleBtn').addEventListener('click', () => this.googleLogin());

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const tab = item.dataset.tab;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const pageMap = { dashboard: 'pageDashboard', trade: 'pageTrade', portfolio: 'pagePortfolio', ai: 'pageAI', rewards: 'pageRewards', settings: 'pageSettings' };
        document.getElementById(pageMap[tab]).classList.add('active');
        document.getElementById('pageTitle').textContent = item.textContent.trim();
      });
    });

    // Sidebar
    document.getElementById('menuBtn').addEventListener('click', () => this.toggleSidebar(true));
    document.getElementById('closeSidebar').addEventListener('click', () => this.toggleSidebar(false));
    document.getElementById('sidebarOverlay').addEventListener('click', () => this.toggleSidebar(false));
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

    // Trade
    document.getElementById('buyToggle').addEventListener('click', () => { this.isBuy = true; this.updateTradeToggle(); });
    document.getElementById('sellToggle').addEventListener('click', () => { this.isBuy = false; this.updateTradeToggle(); });
    document.getElementById('tradeQty').addEventListener('input', () => this.updateTradeTotal());
    document.querySelectorAll('.order-type').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.order-type').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.orderType = btn.dataset.type;
        document.getElementById('tradePrice').disabled = this.orderType === 'market';
        document.getElementById('tradePriceLabel').textContent = this.orderType === 'market' ? 'Market' : 'Limit';
      });
    });
    document.getElementById('executeTradeBtn').addEventListener('click', () => this.executeTrade());
    document.querySelectorAll('.asset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.asset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedAsset = chip.dataset.symbol;
        this.renderTradePrice();
      });
    });

    // AI
    document.getElementById('aiSendBtn').addEventListener('click', () => this.sendAIMessage());
    document.getElementById('aiInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.sendAIMessage(); });
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('aiInput').value = chip.textContent;
        this.sendAIMessage();
      });
    });

    // Rewards
    document.getElementById('claimDailyBtn').addEventListener('click', () => this.claimDaily());

    // Settings
    document.getElementById('settingsDisplayName').addEventListener('change', () => this.updateProfile());
    document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
  },

  toggleSidebar(open) {
    document.getElementById('sidebar').classList.toggle('open', open);
    document.getElementById('sidebarOverlay').classList.toggle('hidden', !open);
  },

  login() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    if (!email || !pass) { this.toast('Please fill in all fields'); return; }
    this.user = { fullName: email.split('@')[0], username: email.split('@')[0], email, level: 'Beginner' };
    this.saveState();
    this.enterApp();
    this.toast('Welcome back, ' + this.user.fullName + '!');
  },

  register() {
    const name = document.getElementById('regName').value.trim();
    const user = document.getElementById('regUser').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const country = document.getElementById('regCountry').value.trim();
    const pass = document.getElementById('regPass').value;
    if (!name || !user || !email || !pass) { this.toast('Please fill in all fields'); return; }
    this.user = { fullName: name, username: user, email, country, level: 'Beginner' };
    this.balance = 999999999;
    this.xp = 0;
    this.level = 'Beginner';
    this.saveState();
    this.enterApp();
    this.toast('Welcome to TradeX AI! You received $999,999,999');
  },

  googleLogin() {
    this.user = { fullName: 'Google User', username: 'google_' + Math.random().toString(36).substr(2, 4), email: 'user@gmail.com', level: 'Beginner' };
    this.saveState();
    this.enterApp();
    this.toast('Signed in with Google');
  },

  logout() {
    localStorage.removeItem('tradex_user');
    this.user = null;
    document.getElementById('appScreen').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-tab="dashboard"]').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('pageDashboard').classList.add('active');
    document.getElementById('authScreen').classList.remove('hidden');
    this.toast('Signed out');
  },

  updateUI() {
    const initial = (this.user?.fullName || 'U')[0].toUpperCase();
    document.getElementById('sidebarAvatar').textContent = initial;
    document.getElementById('sidebarName').textContent = this.user?.fullName || 'User';
    document.getElementById('sidebarLevel').textContent = this.level;
    document.getElementById('headerAvatar').textContent = initial;
    document.getElementById('headerBalance').textContent = this.formatAmount(this.balance);
    document.getElementById('settingsName').textContent = this.user?.fullName || 'User';
    document.getElementById('settingsEmail').textContent = this.user?.email || '';
    document.getElementById('settingsDisplayName').value = this.user?.fullName || '';
  },

  renderDashboard() {
    const totalValue = this.balance + this.portfolio.totalValue;
    document.getElementById('dashTotalBalance').textContent = this.formatAmount(totalValue);
    document.getElementById('dashBalanceChip').textContent = 'Balance: ' + this.formatAmount(this.balance);
    document.getElementById('dashPortfolioChip').textContent = 'Portfolio: ' + this.formatAmount(this.portfolio.totalValue);
    document.getElementById('dashDaily').textContent = this.formatAmount(this.portfolio.totalPnl);
    document.getElementById('dashDaily').className = 'stat-value ' + (this.portfolio.totalPnl >= 0 ? 'green' : 'red');
    document.getElementById('dashWeekly').textContent = this.formatAmount(this.portfolio.totalPnl * 0.3);
    document.getElementById('dashMonthly').textContent = this.formatAmount(this.portfolio.totalPnl * 0.1);

    const recent = this.trades.slice(-5).reverse();
    const container = document.getElementById('recentTrades');
    if (recent.length === 0) {
      container.innerHTML = '<p class="muted">No trades yet</p>';
    } else {
      container.innerHTML = recent.map(t => {
        const isBuy = t.tradeType === 'buy';
        return `<div class="asset-item" style="cursor:default">
          <div class="asset-icon" style="background:${isBuy ? 'rgba(0,217,166,0.1)' : 'rgba(255,71,87,0.1)'};color:${isBuy ? 'var(--success)' : 'var(--danger)'}">${isBuy ? '↑' : '↓'}</div>
          <div class="asset-info"><div class="asset-symbol">${isBuy ? 'Buy' : 'Sell'} ${t.symbol}</div><div class="asset-name">${t.quantity} @ ${this.formatPrice(t.price)}</div></div>
          <div><div class="asset-price">${this.formatAmount(t.totalValue)}</div></div>
        </div>`;
      }).join('');
    }
  },

  renderAssets() {
    const list = document.getElementById('assetsList');
    list.innerHTML = this.ASSETS.map(a => {
      const isUp = a.change >= 0;
      return `<div class="asset-item" onclick="App.selectAsset('${a.symbol}')">
        <div class="asset-icon">${a.symbol[0]}</div>
        <div class="asset-info"><div class="asset-symbol">${a.symbol}</div><div class="asset-name">${a.name}</div></div>
        <div><div class="asset-price">${this.formatPrice(a.price)}</div></div>
        <div class="asset-change ${isUp ? 'up' : 'down'}">${isUp ? '+' : ''}${a.change.toFixed(2)}%</div>
      </div>`;
    }).join('');
  },

  selectAsset(symbol) {
    this.selectedAsset = symbol;
    // Navigate to trade tab
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-tab="trade"]').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('pageTrade').classList.add('active');
    document.getElementById('pageTitle').textContent = 'Trade';
    // Update chip selection
    document.querySelectorAll('.asset-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.symbol === symbol);
    });
    this.renderTradePrice();
  },

  renderTrade() {
    const selector = document.getElementById('assetSelector');
    selector.innerHTML = this.ASSETS.map(a =>
      `<div class="asset-chip ${a.symbol === this.selectedAsset ? 'active' : ''}" data-symbol="${a.symbol}" onclick="App.selectAssetChip('${a.symbol}')">${a.symbol}</div>`
    ).join('');
    this.renderTradePrice();
  },

  selectAssetChip(symbol) {
    this.selectedAsset = symbol;
    document.querySelectorAll('.asset-chip').forEach(c => c.classList.remove('active'));
    document.querySelector(`.asset-chip[data-symbol="${symbol}"]`).classList.add('active');
    this.renderTradePrice();
  },

  renderTradePrice() {
    const asset = this.ASSETS.find(a => a.symbol === this.selectedAsset);
    if (!asset) return;
    const card = document.getElementById('tradePriceCard');
    card.innerHTML = `<p class="asset-name">${asset.name}</p><p class="price">${this.formatPrice(asset.price)}</p><p style="color:${asset.change >= 0 ? 'var(--success)' : 'var(--danger)'}">${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%</p>`;
    this.updateTradeTotal();
  },

  updateTradeToggle() {
    document.getElementById('buyToggle').classList.toggle('active', this.isBuy);
    document.getElementById('sellToggle').classList.toggle('active', !this.isBuy);
    const btn = document.getElementById('executeTradeBtn');
    btn.textContent = (this.isBuy ? 'Buy' : 'Sell') + ' ' + this.selectedAsset;
    btn.style.background = this.isBuy ? 'linear-gradient(135deg, #00D9A6, #00B87A)' : 'linear-gradient(135deg, #FF4757, #E03141)';
  },

  updateTradeTotal() {
    const asset = this.ASSETS.find(a => a.symbol === this.selectedAsset);
    if (!asset) return;
    const qty = parseFloat(document.getElementById('tradeQty').value) || 0;
    const total = qty * asset.price;
    document.getElementById('tradeTotal').innerHTML = '<span>Est. Total</span><span>' + this.formatAmount(total) + '</span>';
  },

  executeTrade() {
    const asset = this.ASSETS.find(a => a.symbol === this.selectedAsset);
    if (!asset) return;
    const qty = parseFloat(document.getElementById('tradeQty').value);
    if (!qty || qty <= 0) { this.toast('Enter a valid quantity'); return; }

    const price = asset.price;
    const totalValue = qty * price;
    const fee = totalValue * 0.001;
    const totalCost = totalValue + fee;

    const isBuy = this.isBuy;

    if (isBuy) {
      if (this.balance < totalCost) { this.toast('Insufficient balance'); return; }
      this.balance -= totalCost;

      const existing = this.portfolio.holdings.find(h => h.symbol === asset.symbol);
      if (existing) {
        const newQty = existing.quantity + qty;
        const newInvested = existing.investedAmount + totalValue;
        existing.quantity = newQty;
        existing.avgPrice = newInvested / newQty;
        existing.investedAmount = newInvested;
        existing.currentValue = newQty * price;
        existing.pnl = existing.currentValue - existing.investedAmount;
        existing.pnlPercent = (existing.pnl / existing.investedAmount) * 100;
      } else {
        this.portfolio.holdings.push({
          symbol: asset.symbol, assetName: asset.name, assetType: asset.type,
          quantity: qty, avgPrice: price, investedAmount: totalValue,
          currentPrice: price, currentValue: totalValue, pnl: 0, pnlPercent: 0,
        });
      }
    } else {
      const holding = this.portfolio.holdings.find(h => h.symbol === asset.symbol);
      if (!holding || holding.quantity < qty) { this.toast('Insufficient holdings'); return; }

      const pnl = totalValue - (holding.avgPrice * qty);
      this.balance += totalValue - fee;
      holding.quantity -= qty;
      holding.currentValue = holding.quantity * price;
      if (holding.quantity <= 0) {
        this.portfolio.holdings = this.portfolio.holdings.filter(h => h.symbol !== asset.symbol);
      }
    }

    this.portfolio.totalValue = this.portfolio.holdings.reduce((s, h) => s + h.currentValue, 0);
    this.portfolio.totalInvested = this.portfolio.holdings.reduce((s, h) => s + h.investedAmount, 0);
    this.portfolio.totalPnl = this.portfolio.holdings.reduce((s, h) => s + h.pnl, 0);
    this.portfolio.roi = this.portfolio.totalInvested > 0 ? (this.portfolio.totalPnl / this.portfolio.totalInvested) * 100 : 0;

    this.trades.push({
      symbol: asset.symbol, assetName: asset.name, tradeType: isBuy ? 'buy' : 'sell',
      quantity: qty, price: price, totalValue: totalValue, fee: fee,
      status: 'executed', timestamp: Date.now(),
    });

    this.xp += 10;
    this.updateLevel();
    this.saveState();
    this.updateUI();
    this.renderDashboard();
    this.renderPortfolio();
    this.renderRewards();
    document.getElementById('tradeQty').value = '';
    this.updateTradeTotal();
    this.toast((isBuy ? 'Bought' : 'Sold') + ' ' + qty + ' ' + asset.symbol + ' @ ' + this.formatPrice(price));
  },

  updateLevel() {
    const levels = [
      { name: 'Beginner', min: 0 }, { name: 'Intermediate', min: 100 },
      { name: 'Advanced', min: 500 }, { name: 'Expert', min: 2000 }, { name: 'Professional', min: 5000 },
    ];
    let newLevel = 'Beginner';
    for (const l of levels) { if (this.xp >= l.min) newLevel = l.name; }
    this.level = newLevel;
  },

  renderPortfolio() {
    document.getElementById('portfolioValue').textContent = this.formatAmount(this.portfolio.totalValue);
    document.getElementById('portfolioInvested').textContent = 'Invested: ' + this.formatAmount(this.portfolio.totalInvested);
    const pnl = this.portfolio.totalPnl;
    document.getElementById('portfolioPnl').textContent = 'P&L: ' + this.formatAmount(pnl);
    document.getElementById('portfolioPnl').style.color = pnl >= 0 ? 'var(--success)' : 'var(--danger)';
    document.getElementById('portfolioRoi').textContent = 'ROI: ' + this.portfolio.roi.toFixed(2) + '%';

    const container = document.getElementById('holdingsList');
    if (this.portfolio.holdings.length === 0) {
      container.innerHTML = '<p class="muted">No holdings yet</p>';
    } else {
      container.innerHTML = this.portfolio.holdings.map(h => {
        const isProfit = h.pnl >= 0;
        const pct = this.portfolio.totalValue > 0 ? (h.currentValue / this.portfolio.totalValue) * 100 : 0;
        return `<div class="holding-item">
          <div class="holding-top">
            <div class="asset-icon">${h.symbol[0]}</div>
            <div class="asset-info"><div class="asset-symbol">${h.symbol}</div><div class="asset-name">${h.quantity.toFixed(4)} @ ${this.formatPrice(h.avgPrice)}</div></div>
            <div><div class="asset-price">${this.formatAmount(h.currentValue)}</div><div style="font-size:0.8rem;color:${isProfit ? 'var(--success)' : 'var(--danger)'};text-align:right">${isProfit ? '+' : ''}${h.pnlPercent.toFixed(2)}%</div></div>
          </div>
          <div class="holding-bar"><div class="holding-fill" style="width:${pct}%"></div></div>
        </div>`;
      }).join('');
    }
  },

  renderRewards() {
    document.getElementById('userLevel').textContent = this.level;
    const maxXP = 5000;
    const xpPct = Math.min((this.xp / maxXP) * 100, 100);
    document.getElementById('xpFill').style.width = xpPct + '%';
    document.getElementById('userXP').textContent = this.xp + ' XP';
    document.getElementById('referralCount').textContent = this.referralCount;

    const amounts = [0, 1000, 2000, 5000, 10000, 25000, 50000, 100000];
    const container = document.getElementById('dailyRewards');
    container.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
      const day = document.createElement('div');
      const isToday = i === this.loginStreak + 1;
      const claimed = i <= this.loginStreak;
      day.className = 'reward-day' + (claimed ? ' claimed' : '') + (isToday ? ' today' : '');
      day.innerHTML = `<div class="day">Day ${i}</div><div class="amount">$${amounts[i].toLocaleString()}</div>`;
      container.appendChild(day);
    }

    const btn = document.getElementById('claimDailyBtn');
    const today = new Date().toDateString();
    if (this.lastLoginDate === today && this.dailyClaimed) {
      btn.textContent = 'Claimed Today ✓';
      btn.disabled = true;
      btn.style.opacity = '0.5';
    } else {
      btn.textContent = 'Claim Daily Reward';
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  },

  claimDaily() {
    const today = new Date().toDateString();
    if (this.lastLoginDate === today && this.dailyClaimed) {
      this.toast('Already claimed today!');
      return;
    }

    if (this.lastLoginDate) {
      const last = new Date(this.lastLoginDate);
      const now = new Date();
      const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) this.loginStreak++;
      else if (diff > 1) this.loginStreak = 1;
    } else {
      this.loginStreak = 1;
    }

    if (this.loginStreak > 7) this.loginStreak = 1;
    const amounts = [0, 1000, 2000, 5000, 10000, 25000, 50000, 100000];
    const reward = amounts[this.loginStreak] || 1000;
    this.balance += reward;
    this.xp += 20;
    this.dailyClaimed = true;
    this.lastLoginDate = today;
    this.updateLevel();
    this.saveState();
    this.updateUI();
    this.renderRewards();
    this.renderDashboard();
    this.toast('Claimed $' + reward.toLocaleString() + ' for Day ' + this.loginStreak + '!');
  },

  sendAIMessage() {
    const input = document.getElementById('aiInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const container = document.getElementById('aiMessages');
    container.innerHTML += `<div class="ai-msg user"><div class="ai-avatar">U</div><div class="ai-bubble">${this.escapeHtml(msg)}</div></div>`;

    const response = this.getAIResponse(msg);
    setTimeout(() => {
      container.innerHTML += `<div class="ai-msg ai"><div class="ai-avatar">AI</div><div class="ai-bubble">${response}</div></div>`;
      container.scrollTop = container.scrollHeight;
    }, 500 + Math.random() * 500);

    container.scrollTop = container.scrollHeight;
  },

  getAIResponse(msg) {
    const m = msg.toLowerCase();
    if (m.includes('hello') || m.includes('hi')) return 'Welcome to TradeX AI! I\'m your trading assistant. Ask me about markets, strategies, or your portfolio!';
    if (m.includes('trade') || m.includes('trading')) return 'Trading involves buying/selling assets for profit. Start with demo trading using your $999,999,999 balance. Focus on learning trends and risk management. I recommend starting with small positions!';
    if (m.includes('bitcoin') || m.includes('btc')) return 'Bitcoin (BTC) is the largest cryptocurrency at ~$67,500. Market sentiment is currently mixed. Consider using stop-loss orders and diversifying your crypto investments.';
    if (m.includes('risk') || m.includes('loss')) return 'Risk management is key! Use stop-loss orders, diversify your portfolio, never invest more than you can afford to lose, and start small to learn. The 1% rule is popular.';
    if (m.includes('strategy')) return 'Popular strategies: 1) Day Trading - short intraday positions, 2) Swing Trading - hold days to weeks, 3) Trend Following - trade with momentum, 4) DCA - invest fixed amounts regularly.';
    if (m.includes('portfolio') || m.includes('holding')) {
      if (this.portfolio.holdings.length === 0) return 'Your portfolio is empty! Start trading to build your holdings. Try buying Bitcoin or Ethereum to get started.';
      const top = this.portfolio.holdings.reduce((max, h) => h.currentValue > max.currentValue ? h : max);
      return `You have ${this.portfolio.holdings.length} holdings worth ${this.formatAmount(this.portfolio.totalValue)}. Your top position is ${top.symbol} at ${this.formatAmount(top.currentValue)}. Consider diversifying across different asset types.`;
    }
    if (m.includes('beginner') || m.includes('start')) return 'Great that you\'re starting! 1) Explore the demo account, 2) Start with small trades, 3) Use stop-loss always, 4) Learn from AI recommendations, 5) Join trading challenges! Your $999,999,999 demo balance is perfect for practice.';
    return 'Great question! I can help with: market analysis, trading strategies, risk management, portfolio advice, and learning resources. Want to know about a specific asset or strategy? Try asking about Bitcoin, trading strategies, or risk management!';
  },

  escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  },

  renderSettings() {
    document.getElementById('settingsDisplayName').value = this.user?.fullName || '';
  },

  updateProfile() {
    const name = document.getElementById('settingsDisplayName').value.trim();
    if (name && this.user) {
      this.user.fullName = name;
      this.saveState();
      this.updateUI();
      this.toast('Profile updated');
    }
  },

  exportData() {
    const data = { user: this.user, balance: this.balance, portfolio: this.portfolio, trades: this.trades, xp: this.xp, level: this.level };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tradex_export.json';
    a.click();
    URL.revokeObjectURL(url);
    this.toast('Data exported');
  },

  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.add('hidden'), 2500);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
