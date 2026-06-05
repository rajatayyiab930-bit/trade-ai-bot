const String baseUrl = 'http://10.0.2.2:5000/api';
const String socketUrl = 'http://10.0.2.2:5000';
const String appName = 'TradeX AI';
const String appVersion = '1.0.0';

const double demoBalance = 999999999.0;

const List<String> assetTypes = ['crypto', 'stock', 'forex', 'commodity'];

const Map<String, String> assetIcons = {
  'BTC': '₿', 'ETH': '⟠', 'SOL': '◎', 'BNB': '◆', 'XRP': '✕',
  'AAPL': '⌘', 'GOOGL': '◉', 'TSLA': '⊼',
  'EUR/USD': '€', 'XAU/USD': '♛', 'XAG/USD': '♜',
};

const List<Map<String, dynamic>> bottomNavItems = [
  {'icon': Icons.dashboard_rounded, 'label': 'Dashboard'},
  {'icon': Icons.trending_up_rounded, 'label': 'Trade'},
  {'icon': Icons.account_balance_wallet_rounded, 'label': 'Portfolio'},
  {'icon': Icons.auto_awesome_rounded, 'label': 'AI'},
  {'icon': Icons.more_horiz_rounded, 'label': 'More'},
];
