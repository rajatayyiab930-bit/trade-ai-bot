import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../config/theme.dart';
import '../../providers/app_provider.dart';
import '../auth/login_screen.dart';
import '../rewards/rewards_screen.dart';

class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<AppProvider>();
      provider.getDashboard();
      provider.getAssets();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text('TradeX AI'),
        actions: [
          Consumer<AppProvider>(builder: (_, provider, __) => Padding(
            padding: EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => RewardsScreen())),
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.primary.withOpacity(0.2)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.emoji_events, color: AppTheme.warning, size: 16),
                    SizedBox(width: 4),
                    Text('Lv. ${provider.user?.level ?? 'Beginner'}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                  ],
                ),
              ),
            ),
          )),
          IconButton(
            icon: CircleAvatar(radius: 16, backgroundColor: AppTheme.primary, child: Icon(Icons.person, size: 18, color: Colors.white)),
            onPressed: () {},
          ),
        ],
      ),
      body: Consumer<AppProvider>(
        builder: (_, provider, __) {
          if (provider.loading) return Center(child: CircularProgressIndicator());
          if (!provider.isLoggedIn) return Center(child: ElevatedButton(onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => LoginScreen())), child: Text('Login')));
          final dash = provider.dashboard;
          if (dash == null) return Center(child: Text('No data', style: TextStyle(color: AppTheme.textMuted)));

          return RefreshIndicator(
            color: AppTheme.primary,
            onRefresh: () => provider.getDashboard(),
            child: SingleChildScrollView(
              physics: AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildBalanceCard(dash),
                  SizedBox(height: 16),
                  _buildProfitRow(dash),
                  SizedBox(height: 16),
                  _buildStatsCard(dash),
                  SizedBox(height: 16),
                  _buildChart(),
                  SizedBox(height: 16),
                  _buildTrendingAssets(provider),
                  SizedBox(height: 80),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBalanceCard(var dash) {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppTheme.primary.withOpacity(0.2), AppTheme.surface]),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.primary.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Total Balance', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: AppTheme.success.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
              child: Text('DEMO', style: TextStyle(color: AppTheme.success, fontSize: 11, fontWeight: FontWeight.w600)),
            ),
          ]),
          SizedBox(height: 8),
          Text('\$${_formatAmount(dash.totalValue)}', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
          SizedBox(height: 8),
          Row(children: [
            _statChip('Balance', '\$${_formatAmount(dash.balance)}', AppTheme.info),
            SizedBox(width: 12),
            _statChip('Portfolio', '\$${_formatAmount(dash.portfolioValue)}', AppTheme.secondary),
          ]),
        ],
      ),
    );
  }

  Widget _buildProfitRow(var dash) {
    return Row(children: [
      Expanded(child: _profitCard('Daily P&L', dash.dailyProfit, Icons.today)),
      SizedBox(width: 12),
      Expanded(child: _profitCard('Weekly P&L', dash.weeklyProfit, Icons.date_range)),
      SizedBox(width: 12),
      Expanded(child: _profitCard('Monthly P&L', dash.monthlyProfit, Icons.calendar_month)),
    ]);
  }

  Widget _buildStatsCard(var dash) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: AppTheme.cardGradient,
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          _statItem('Win Rate', '${dash.winRate.toStringAsFixed(1)}%', Colors.green),
          _statItem('Total Trades', '${dash.totalTrades}', AppTheme.info),
          _statItem('Today', '${dash.todayTrades}', AppTheme.warning),
        ]),
        SizedBox(height: 16),
        Row(children: [
          Expanded(child: _progressBar('Wins', dash.winningTrades.toDouble(), Colors.green)),
          SizedBox(width: 8),
          Expanded(child: _progressBar('Losses', dash.losingTrades.toDouble(), AppTheme.danger)),
        ]),
      ]),
    );
  }

  Widget _buildChart() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Portfolio Performance', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
      SizedBox(height: 12),
      Container(
        height: 180, padding: EdgeInsets.all(8),
        decoration: AppTheme.cardGradient,
        child: LineChart(LineChartData(
          gridData: FlGridData(show: false),
          titlesData: FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: List.generate(20, (i) => FlSpot(i.toDouble(), 90 + (i * 3) + (i % 5) * 5)),
              isCurved: true, color: AppTheme.primary, barWidth: 2.5,
              dotData: FlDotData(show: false),
              belowBarData: BarAreaData(show: true, color: AppTheme.primary.withOpacity(0.1)),
            ),
          ],
        )),
      ),
    ]);
  }

  Widget _buildTrendingAssets(AppProvider provider) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Trending Assets', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
      SizedBox(height: 12),
      ...provider.assets.take(5).map((asset) => Container(
        margin: EdgeInsets.only(bottom: 8), padding: EdgeInsets.all(14),
        decoration: AppTheme.cardGradient,
        child: Row(children: [
          Container(width: 40, height: 40, alignment: Alignment.center,
            decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
            child: Text(asset.symbol[0], style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 16))),
          SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(asset.symbol, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            Text(asset.name, style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          ])),
          Text(asset.priceFormatted, style: TextStyle(fontWeight: FontWeight.w600)),
          SizedBox(width: 12),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: asset.isPositive ? AppTheme.success.withOpacity(0.15) : AppTheme.danger.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(asset.changeFormatted, style: TextStyle(color: asset.isPositive ? AppTheme.success : AppTheme.danger, fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ]),
      )),
    ]);
  }

  Widget _statChip(String label, String value, Color color) => Container(
    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
    child: Row(mainAxisSize: MainAxisSize.min, children: [
      Text(label, style: TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
      SizedBox(width: 6),
      Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12)),
    ]),
  );

  Widget _profitCard(String label, double value, IconData icon) {
    final isPositive = value >= 0;
    return Container(
      padding: EdgeInsets.all(14), decoration: AppTheme.cardGradient,
      child: Column(children: [
        Icon(icon, color: isPositive ? AppTheme.success : AppTheme.danger, size: 20),
        SizedBox(height: 8),
        Text('\$${_formatAmount(value)}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: isPositive ? AppTheme.success : AppTheme.danger)),
        Text(label, style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
      ]),
    );
  }

  Widget _statItem(String label, String value, Color color) => Column(children: [
    Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
    SizedBox(height: 4),
    Text(label, style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
  ]);

  Widget _progressBar(String label, double value, Color color) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Text('$label: ${value.toInt()}', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
    SizedBox(height: 4),
    ClipRRect(
      borderRadius: BorderRadius.circular(4),
      child: LinearProgressIndicator(value: value / 100, backgroundColor: AppTheme.surfaceLight, valueColor: AlwaysStoppedAnimation(color), minHeight: 6),
    ),
  ]);

  String _formatAmount(double amount) {
    if (amount >= 1e9) return '${(amount / 1e9).toStringAsFixed(2)}B';
    if (amount >= 1e6) return '${(amount / 1e6).toStringAsFixed(2)}M';
    if (amount >= 1e3) return '${(amount / 1e3).toStringAsFixed(2)}K';
    return amount.toStringAsFixed(2);
  }
}
