import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/app_provider.dart';

class PortfolioScreen extends StatefulWidget {
  @override
  _PortfolioScreenState createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppProvider>().getPortfolio();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: Text('Portfolio'), actions: [
        IconButton(icon: Icon(Icons.download_outlined), onPressed: () {}),
      ]),
      body: Consumer<AppProvider>(
        builder: (_, provider, __) {
          if (provider.loading) return Center(child: CircularProgressIndicator());
          final portfolio = provider.portfolio;
          final user = provider.user;

          return RefreshIndicator(
            onRefresh: () => provider.getPortfolio(),
            child: SingleChildScrollView(
              physics: AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Summary Card
                  Container(
                    padding: EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [AppTheme.secondary.withOpacity(0.2), AppTheme.surface]),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.secondary.withOpacity(0.15)),
                    ),
                    child: Column(children: [
                      Text('Portfolio Value', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                      SizedBox(height: 8),
                      Text('\$${_formatAmount(portfolio?.totalValue ?? 0)}', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
                        _summaryItem('Invested', '\$${_formatAmount(portfolio?.totalInvested ?? 0)}', AppTheme.info),
                        _summaryItem('P&L', '\$${_formatAmount(portfolio?.totalPnl ?? 0)}', (portfolio?.totalPnl ?? 0) >= 0 ? AppTheme.success : AppTheme.danger),
                        _summaryItem('ROI', '${(portfolio?.roi ?? 0).toStringAsFixed(1)}%', AppTheme.warning),
                      ]),
                    ]),
                  ),
                  SizedBox(height: 20),

                  Text('Holdings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  SizedBox(height: 12),

                  if (portfolio == null || portfolio.holdings.isEmpty)
                    Container(
                      padding: EdgeInsets.all(40),
                      alignment: Alignment.center,
                      child: Column(children: [
                        Icon(Icons.account_balance_wallet_outlined, size: 60, color: AppTheme.textMuted),
                        SizedBox(height: 16),
                        Text('No holdings yet', style: TextStyle(color: AppTheme.textMuted, fontSize: 16)),
                        Text('Start trading to build your portfolio', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                      ]),
                    )
                  else
                    ...portfolio.holdings.map((h) => Container(
                      margin: EdgeInsets.only(bottom: 8),
                      padding: EdgeInsets.all(14),
                      decoration: AppTheme.cardGradient,
                      child: Column(children: [
                        Row(children: [
                          Container(width: 40, height: 40, alignment: Alignment.center,
                            decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                            child: Text(h.symbol[0], style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold))),
                          SizedBox(width: 12),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(h.symbol, style: TextStyle(fontWeight: FontWeight.w600)),
                            Text('${h.quantity.toStringAsFixed(4)} @ \$${h.avgPrice.toStringAsFixed(2)}', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                          ])),
                          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                            Text('\$${h.currentValue.toStringAsFixed(2)}', style: TextStyle(fontWeight: FontWeight.w600)),
                            Text('${h.pnlPercent.toStringAsFixed(2)}%', style: TextStyle(color: h.isProfit ? AppTheme.success : AppTheme.danger, fontSize: 12)),
                          ]),
                        ]),
                        SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: portfolio.totalValue > 0 ? h.currentValue / portfolio.totalValue : 0,
                            backgroundColor: AppTheme.surfaceLight,
                            valueColor: AlwaysStoppedAnimation(AppTheme.primary),
                            minHeight: 4,
                          ),
                        ),
                      ]),
                    )),
                  SizedBox(height: 80),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _summaryItem(String label, String value, Color color) => Column(children: [
    Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16)),
    SizedBox(height: 2),
    Text(label, style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
  ]);

  String _formatAmount(double amount) {
    if (amount >= 1e9) return '${(amount / 1e9).toStringAsFixed(2)}B';
    if (amount >= 1e6) return '${(amount / 1e6).toStringAsFixed(2)}M';
    if (amount >= 1e3) return '${(amount / 1e3).toStringAsFixed(2)}K';
    return amount.toStringAsFixed(2);
  }
}
