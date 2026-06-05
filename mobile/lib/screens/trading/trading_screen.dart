import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/app_provider.dart';
import '../../models/trade_models.dart';

class TradingScreen extends StatefulWidget {
  @override
  _TradingScreenState createState() => _TradingScreenState();
}

class _TradingScreenState extends State<TradingScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  final _qtyCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  String _selectedSymbol = 'BTC';
  String _orderType = 'market';
  bool _isBuy = true;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppProvider>().getAssets();
    });
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _qtyCtrl.dispose();
    _priceCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text('Trade'),
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          tabs: [Tab(text: 'Place Order'), Tab(text: 'History')],
        ),
      ),
      body: Consumer<AppProvider>(
        builder: (_, provider, __) => TabBarView(
          controller: _tabCtrl,
          children: [
            _buildOrderTab(provider),
            _buildHistoryTab(provider),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderTab(AppProvider provider) {
    final asset = provider.assets.where((a) => a.symbol == _selectedSymbol).firstOrNull;
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Asset Selector
          Container(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: provider.assets.map((a) => Padding(
                padding: EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => setState(() => _selectedSymbol = a.symbol),
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: _selectedSymbol == a.symbol ? AppTheme.primary.withOpacity(0.2) : AppTheme.surfaceLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _selectedSymbol == a.symbol ? AppTheme.primary : Colors.transparent),
                    ),
                    alignment: Alignment.center,
                    child: Text(a.symbol, style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: _selectedSymbol == a.symbol ? AppTheme.primary : AppTheme.textSecondary,
                    )),
                  ),
                ),
              )).toList(),
            ),
          ),
          SizedBox(height: 16),

          // Price Info
          if (asset != null) Container(
            padding: EdgeInsets.all(16),
            decoration: AppTheme.cardGradient,
            child: Column(children: [
              Text(asset.name, style: TextStyle(color: AppTheme.textSecondary)),
              SizedBox(height: 8),
              Text(asset.priceFormatted, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text(asset.changeFormatted, style: TextStyle(color: asset.isPositive ? AppTheme.success : AppTheme.danger, fontWeight: FontWeight.w600)),
            ]),
          ),
          SizedBox(height: 16),

          // Buy/Sell Toggle
          Row(children: [
            Expanded(child: GestureDetector(
              onTap: () => setState(() => _isBuy = true),
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: _isBuy ? AppTheme.success.withOpacity(0.2) : AppTheme.surfaceLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _isBuy ? AppTheme.success : Colors.transparent),
                ),
                alignment: Alignment.center,
                child: Text('BUY', style: TextStyle(fontWeight: FontWeight.bold, color: _isBuy ? AppTheme.success : AppTheme.textMuted, fontSize: 16)),
              ),
            )),
            SizedBox(width: 12),
            Expanded(child: GestureDetector(
              onTap: () => setState(() => _isBuy = false),
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: !_isBuy ? AppTheme.danger.withOpacity(0.2) : AppTheme.surfaceLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: !_isBuy ? AppTheme.danger : Colors.transparent),
                ),
                alignment: Alignment.center,
                child: Text('SELL', style: TextStyle(fontWeight: FontWeight.bold, color: !_isBuy ? AppTheme.danger : AppTheme.textMuted, fontSize: 16)),
              ),
            )),
          ]),
          SizedBox(height: 16),

          // Order Type
          Row(children: [
            _orderTypeChip('Market', 'market'),
            SizedBox(width: 8),
            _orderTypeChip('Limit', 'limit'),
            SizedBox(width: 8),
            _orderTypeChip('Stop Loss', 'stop_loss'),
          ]),
          SizedBox(height: 16),

          // Quantity
          TextField(
            controller: _qtyCtrl,
            decoration: InputDecoration(
              labelText: 'Quantity',
              prefixIcon: Icon(Icons.square_foot),
              suffixText: _selectedSymbol,
            ),
            keyboardType: TextInputType.number,
          ),
          SizedBox(height: 12),

          if (_orderType != 'market')
            Column(children: [
              TextField(
                controller: _priceCtrl,
                decoration: InputDecoration(labelText: 'Price', prefixIcon: Icon(Icons.attach_money)),
                keyboardType: TextInputType.number,
              ),
              SizedBox(height: 12),
            ]),

          // Summary
          Container(
            padding: EdgeInsets.all(14),
            decoration: AppTheme.cardGradient,
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Est. Total', style: TextStyle(color: AppTheme.textSecondary)),
              Text('\$${_qtyCtrl.text.isNotEmpty && asset != null ? (double.tryParse(_qtyCtrl.text)! * asset.price).toStringAsFixed(2) : '0.00'}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ]),
          ),
          SizedBox(height: 16),

          // Submit Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () async {
                if (_qtyCtrl.text.isEmpty) return;
                final qty = double.tryParse(_qtyCtrl.text) ?? 0;
                final price = _orderType == 'market' ? (asset?.price ?? 0) : (double.tryParse(_priceCtrl.text) ?? 0);
                final result = await provider.placeOrder(
                  _selectedSymbol, asset?.name ?? _selectedSymbol, asset?.type ?? 'crypto',
                  _isBuy ? 'buy' : 'sell', qty, price, orderType: _orderType,
                );
                if (result != null && mounted) {
                  _qtyCtrl.clear();
                  _priceCtrl.clear();
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Order placed successfully!')));
                }
              },
              child: Text('${_isBuy ? 'Buy' : 'Sell'} $_selectedSymbol'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _isBuy ? AppTheme.success : AppTheme.danger,
                padding: EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _orderTypeChip(String label, String value) {
    final isSelected = _orderType == value;
    return GestureDetector(
      onTap: () => setState(() => _orderType = value),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary.withOpacity(0.2) : AppTheme.surfaceLight,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? AppTheme.primary : Colors.transparent),
        ),
        child: Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: isSelected ? AppTheme.primary : AppTheme.textSecondary)),
      ),
    );
  }

  Widget _buildHistoryTab(AppProvider provider) {
    if (provider.trades.isEmpty) {
      return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.receipt_long_outlined, size: 60, color: AppTheme.textMuted),
        SizedBox(height: 16),
        Text('No trades yet', style: TextStyle(color: AppTheme.textMuted, fontSize: 16)),
      ]));
    }
    return RefreshIndicator(
      onRefresh: () => provider.getTrades(),
      child: ListView.builder(
        padding: EdgeInsets.all(16),
        itemCount: provider.trades.length,
        itemBuilder: (_, i) {
          final t = provider.trades[i];
          final isBuy = t.tradeType == 'buy';
          return Container(
            margin: EdgeInsets.only(bottom: 8),
            padding: EdgeInsets.all(14),
            decoration: AppTheme.cardGradient,
            child: Row(children: [
              Container(
                width: 40, height: 40, alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: (isBuy ? AppTheme.success : AppTheme.danger).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(isBuy ? Icons.arrow_upward : Icons.arrow_downward, color: isBuy ? AppTheme.success : AppTheme.danger, size: 20),
              ),
              SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${isBuy ? 'Buy' : 'Sell'} ${t.symbol}', style: TextStyle(fontWeight: FontWeight.w600)),
                Text('${t.quantity} @ \$${t.price.toStringAsFixed(2)}', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ])),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text('\$${t.totalValue.toStringAsFixed(2)}', style: TextStyle(fontWeight: FontWeight.w600)),
                Text(t.status, style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ]),
            ]),
          );
        },
      ),
    );
  }
}
