import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/app_provider.dart';
import '../../models/trade_models.dart';

class AIScreen extends StatefulWidget {
  @override
  _AIScreenState createState() => _AIScreenState();
}

class _AIScreenState extends State<AIScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  final _chatCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  List<ChatMessage> _messages = [];
  List<String> _suggestions = [];

  void _sendMessage() async {
    final text = _chatCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(ChatMessage(text: text, isUser: true));
      _chatCtrl.clear();
    });
    final provider = context.read<AppProvider>();
    final res = await provider.chatWithAI(text);
    setState(() {
      _messages.addAll(res.responses.map((r) => ChatMessage(text: r, isUser: false)));
      _suggestions = res.suggestions;
    });
    _scrollToBottom();
  }

  void _scrollToBottom() {
    Future.delayed(Duration(milliseconds: 100), () {
      if (_scrollCtrl.hasClients) _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent, duration: Duration(milliseconds: 300), curve: Curves.easeOut);
    });
  }

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      setState(() => _messages.add(ChatMessage(text: 'Hello! I\'m TradeX AI, your personal trading assistant. How can I help you today?', isUser: false)));
    });
  }

  @override
  void dispose() {
    _tabCtrl.dispose(); _chatCtrl.dispose(); _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text('TradeX AI'),
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          tabs: [Tab(text: 'Chat', icon: Icon(Icons.chat, size: 18)), Tab(text: 'Analysis', icon: Icon(Icons.analytics, size: 18))],
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [_buildChatTab(), _buildAnalysisTab()],
      ),
    );
  }

  Widget _buildChatTab() {
    return Column(children: [
      Expanded(
        child: ListView(
          controller: _scrollCtrl,
          padding: EdgeInsets.all(16),
          children: [
            ..._messages.map((m) => Container(
              margin: EdgeInsets.only(bottom: 12),
              crossAxisAlignment: CrossAxisAlignment.start,
              child: Row(
                mainAxisAlignment: m.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                children: [
                  if (!m.isUser) Container(
                    width: 32, height: 32, margin: EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(8)),
                    child: Icon(Icons.auto_awesome, size: 16, color: Colors.white),
                  ),
                  Flexible(
                    child: Container(
                      padding: EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: m.isUser ? AppTheme.primary.withOpacity(0.2) : AppTheme.surfaceLight,
                        borderRadius: BorderRadius.circular(16).copyWith(
                          bottomLeft: m.isUser ? Radius.circular(16) : Radius.circular(4),
                          bottomRight: m.isUser ? Radius.circular(4) : Radius.circular(16),
                        ),
                      ),
                      child: Text(m.text, style: TextStyle(color: Colors.white, fontSize: 14, height: 1.4)),
                    ),
                  ),
                  if (m.isUser) Container(
                    width: 32, height: 32, margin: EdgeInsets.only(left: 8),
                    decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(8)),
                    child: Icon(Icons.person, size: 16, color: Colors.white),
                  ),
                ],
              ),
            )),
            if (_suggestions.isNotEmpty) ...[
              SizedBox(height: 8),
              Wrap(
                spacing: 8, runSpacing: 8,
                children: _suggestions.map((s) => GestureDetector(
                  onTap: () {
                    _chatCtrl.text = s;
                    _sendMessage();
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.primary.withOpacity(0.2)),
                    ),
                    child: Text(s, style: TextStyle(color: AppTheme.primary, fontSize: 12)),
                  ),
                )).toList(),
              ),
            ],
            SizedBox(height: 16),
          ],
        ),
      ),
      // Input
      Container(
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          border: Border(top: BorderSide(color: AppTheme.surfaceLight)),
        ),
        child: Row(children: [
          Expanded(
            child: TextField(
              controller: _chatCtrl,
              decoration: InputDecoration(
                hintText: 'Ask TradeX AI...',
                filled: true,
                fillColor: AppTheme.surfaceLight,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onSubmitted: (_) => _sendMessage(),
              maxLines: 3,
              minLines: 1,
            ),
          ),
          SizedBox(width: 8),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: AppTheme.primary, shape: BoxShape.circle),
              child: Icon(Icons.send_rounded, color: Colors.white, size: 20),
            ),
          ),
        ]),
      ),
    ]);
  }

  Widget _buildAnalysisTab() {
    return Consumer<AppProvider>(
      builder: (_, provider, __) => FutureBuilder<Map<String, dynamic>?>(
        future: provider.getMarketAnalysis(),
        builder: (_, snap) {
          if (snap.connectionState == ConnectionState.waiting) return Center(child: CircularProgressIndicator());
          if (!snap.hasData) return Center(child: Text('No data available', style: TextStyle(color: AppTheme.textMuted)));
          final data = snap.data!;
          final recs = data['recommendations'] as List? ?? [];
          return SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Market Overview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              SizedBox(height: 12),
              Container(
                padding: EdgeInsets.all(16),
                decoration: AppTheme.cardGradient,
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                  _overviewItem('Trend', data['overall'] ?? 'neutral', AppTheme.primary),
                  _overviewItem('Sentiment', data['marketSentiment'] ?? 'neutral', AppTheme.info),
                  _overviewItem('Risk', data['riskLevel'] ?? 'medium', AppTheme.warning),
                  _overviewItem('Confidence', '${data['confidence'] ?? 0}%', AppTheme.success),
                ]),
              ),
              SizedBox(height: 20),
              Text('AI Recommendations', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              SizedBox(height: 12),
              ...recs.map((r) => Container(
                margin: EdgeInsets.only(bottom: 8),
                padding: EdgeInsets.all(14),
                decoration: AppTheme.cardGradient,
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Container(width: 36, height: 36, alignment: Alignment.center,
                      decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                      child: Text(r['symbol']?[0] ?? '?', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold))),
                    SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(r['symbol'] ?? '', style: TextStyle(fontWeight: FontWeight.w600)),
                      Text(r['name'] ?? '', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                    ])),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: (r['action'] == 'buy' ? AppTheme.success : r['action'] == 'sell' ? AppTheme.danger : AppTheme.warning).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text((r['action'] ?? 'hold').toString().toUpperCase(), style: TextStyle(
                        color: r['action'] == 'buy' ? AppTheme.success : r['action'] == 'sell' ? AppTheme.danger : AppTheme.warning,
                        fontSize: 11, fontWeight: FontWeight.bold,
                      )),
                    ),
                  ]),
                  SizedBox(height: 8),
                  Text(r['reason'] ?? '', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  SizedBox(height: 8),
                  Row(children: [
                    Text('Target: \$${r['targetPrice'] ?? '0'}', style: TextStyle(color: AppTheme.success, fontSize: 12)),
                    SizedBox(width: 16),
                    Text('Stop: \$${r['stopLoss'] ?? '0'}', style: TextStyle(color: AppTheme.danger, fontSize: 12)),
                    Spacer(),
                    Text('${r['confidence'] ?? 0}%', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.primary)),
                  ]),
                ]),
              )),
              SizedBox(height: 80),
            ]),
          );
        },
      ),
    );
  }

  Widget _overviewItem(String label, String value, Color color) => Column(children: [
    Text(value.toString().toUpperCase(), style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 13)),
    SizedBox(height: 4),
    Text(label, style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
  ]);
}

class ChatMessage {
  final String text;
  final bool isUser;
  ChatMessage({required this.text, required this.isUser});
}
