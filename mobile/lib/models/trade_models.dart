class AssetModel {
  final String symbol;
  final String name;
  final String type;
  final double price;
  final double change;
  final double? high24h;
  final double? low24h;
  final double? volume24h;

  AssetModel({
    required this.symbol, required this.name, required this.type,
    required this.price, required this.change,
    this.high24h, this.low24h, this.volume24h,
  });

  factory AssetModel.fromJson(Map<String, dynamic> json) {
    return AssetModel(
      symbol: json['symbol'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? 'crypto',
      price: (json['price'] ?? 0).toDouble(),
      change: (json['change'] ?? 0).toDouble(),
      high24h: (json['high24h'] ?? json['price'])?.toDouble(),
      low24h: (json['low24h'] ?? json['price'])?.toDouble(),
      volume24h: (json['volume24h'])?.toDouble(),
    );
  }

  bool get isPositive => change >= 0;
  String get changeFormatted => '${isPositive ? '+' : ''}${change.toStringAsFixed(2)}%';
  String get priceFormatted => _formatPrice(price);

  static String _formatPrice(double p) {
    if (p >= 1000) return '\$${p.toStringAsFixed(2)}';
    if (p >= 1) return '\$${p.toStringAsFixed(2)}';
    return '\$${p.toStringAsFixed(4)}';
  }
}

class TradeModel {
  final String id;
  final String symbol;
  final String assetName;
  final String assetType;
  final String orderType;
  final String tradeType;
  final double quantity;
  final double price;
  final double totalValue;
  final double fee;
  final String status;
  final double? stopLoss;
  final double? takeProfit;
  final double? pnl;
  final double? pnlPercent;
  final DateTime createdAt;
  final DateTime? executedAt;

  TradeModel({
    required this.id, required this.symbol, required this.assetName,
    required this.assetType, this.orderType = 'market',
    required this.tradeType, required this.quantity, required this.price,
    required this.totalValue, this.fee = 0, this.status = 'executed',
    this.stopLoss, this.takeProfit, this.pnl, this.pnlPercent,
    required this.createdAt, this.executedAt,
  });

  factory TradeModel.fromJson(Map<String, dynamic> json) {
    return TradeModel(
      id: json['_id'] ?? json['id'] ?? '',
      symbol: json['symbol'] ?? '',
      assetName: json['assetName'] ?? '',
      assetType: json['assetType'] ?? 'crypto',
      orderType: json['orderType'] ?? 'market',
      tradeType: json['tradeType'] ?? 'buy',
      quantity: (json['quantity'] ?? 0).toDouble(),
      price: (json['price'] ?? 0).toDouble(),
      totalValue: (json['totalValue'] ?? 0).toDouble(),
      fee: (json['fee'] ?? 0).toDouble(),
      status: json['status'] ?? 'executed',
      stopLoss: json['stopLoss']?.toDouble(),
      takeProfit: json['takeProfit']?.toDouble(),
      pnl: json['pnl']?.toDouble(),
      pnlPercent: json['pnlPercent']?.toDouble(),
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      executedAt: json['executedAt'] != null ? DateTime.tryParse(json['executedAt']) : null,
    );
  }
}

class PortfolioModel {
  final List<HoldingModel> holdings;
  final double totalValue;
  final double totalInvested;
  final double totalPnl;
  final double roi;

  PortfolioModel({
    this.holdings = const [],
    this.totalValue = 0, this.totalInvested = 0,
    this.totalPnl = 0, this.roi = 0,
  });

  factory PortfolioModel.fromJson(Map<String, dynamic> json) {
    return PortfolioModel(
      holdings: (json['holdings'] as List?)?.map((h) => HoldingModel.fromJson(h)).toList() ?? [],
      totalValue: (json['totalValue'] ?? 0).toDouble(),
      totalInvested: (json['totalInvested'] ?? 0).toDouble(),
      totalPnl: (json['totalPnl'] ?? 0).toDouble(),
      roi: (json['roi'] ?? 0).toDouble(),
    );
  }
}

class HoldingModel {
  final String symbol;
  final String assetName;
  final String assetType;
  final double quantity;
  final double avgPrice;
  final double currentPrice;
  final double investedAmount;
  final double currentValue;
  final double pnl;
  final double pnlPercent;

  HoldingModel({
    required this.symbol, required this.assetName, required this.assetType,
    required this.quantity, required this.avgPrice, required this.currentPrice,
    required this.investedAmount, required this.currentValue,
    required this.pnl, required this.pnlPercent,
  });

  factory HoldingModel.fromJson(Map<String, dynamic> json) {
    return HoldingModel(
      symbol: json['symbol'] ?? '',
      assetName: json['assetName'] ?? '',
      assetType: json['assetType'] ?? 'crypto',
      quantity: (json['quantity'] ?? 0).toDouble(),
      avgPrice: (json['avgPrice'] ?? 0).toDouble(),
      currentPrice: (json['currentPrice'] ?? 0).toDouble(),
      investedAmount: (json['investedAmount'] ?? 0).toDouble(),
      currentValue: (json['currentValue'] ?? 0).toDouble(),
      pnl: (json['pnl'] ?? 0).toDouble(),
      pnlPercent: (json['pnlPercent'] ?? 0).toDouble(),
    );
  }

  bool get isProfit => pnl >= 0;
}

class DashboardData {
  final double balance;
  final double portfolioValue;
  final double totalValue;
  final double dailyProfit;
  final double weeklyProfit;
  final double monthlyProfit;
  final double totalProfit;
  final int totalTrades;
  final int winningTrades;
  final int losingTrades;
  final double winRate;
  final int todayTrades;
  final String level;
  final int xp;
  final List<HoldingModel> portfolio;
  final List<TradeModel> recentTrades;

  DashboardData({
    this.balance = 0, this.portfolioValue = 0, this.totalValue = 0,
    this.dailyProfit = 0, this.weeklyProfit = 0, this.monthlyProfit = 0,
    this.totalProfit = 0, this.totalTrades = 0, this.winningTrades = 0,
    this.losingTrades = 0, this.winRate = 0, this.todayTrades = 0,
    this.level = 'Beginner', this.xp = 0,
    this.portfolio = const [], this.recentTrades = const [],
  });

  factory DashboardData.fromJson(Map<String, dynamic> json) {
    return DashboardData(
      balance: (json['balance'] ?? 0).toDouble(),
      portfolioValue: (json['portfolioValue'] ?? 0).toDouble(),
      totalValue: (json['totalValue'] ?? 0).toDouble(),
      dailyProfit: (json['dailyProfit'] ?? 0).toDouble(),
      weeklyProfit: (json['weeklyProfit'] ?? 0).toDouble(),
      monthlyProfit: (json['monthlyProfit'] ?? 0).toDouble(),
      totalProfit: (json['totalProfit'] ?? 0).toDouble(),
      totalTrades: json['totalTrades'] ?? 0,
      winningTrades: json['winningTrades'] ?? 0,
      losingTrades: json['losingTrades'] ?? 0,
      winRate: (json['winRate'] ?? 0).toDouble(),
      todayTrades: json['todayTrades'] ?? 0,
      level: json['level'] ?? 'Beginner',
      xp: json['xp'] ?? 0,
      portfolio: (json['portfolio'] as List?)?.map((h) => HoldingModel.fromJson(h)).toList() ?? [],
      recentTrades: (json['recentTrades'] as List?)?.map((t) => TradeModel.fromJson(t)).toList() ?? [],
    );
  }
}

class AIChatResponse {
  final List<String> responses;
  final List<String> suggestions;
  AIChatResponse({required this.responses, this.suggestions = const []});
  factory AIChatResponse.fromJson(Map<String, dynamic> json) => AIChatResponse(
    responses: List<String>.from(json['responses'] ?? []),
    suggestions: List<String>.from(json['suggestions'] ?? []),
  );
}

class RewardStatus {
  final int streak;
  final bool canClaim;
  final int nextRewardAmount;
  final List<DayReward> rewards;
  final int xp;
  final String level;
  RewardStatus({required this.streak, this.canClaim = false, this.nextRewardAmount = 0, this.rewards = const [], this.xp = 0, this.level = 'Beginner'});
  factory RewardStatus.fromJson(Map<String, dynamic> json) => RewardStatus(
    streak: json['streak'] ?? 0,
    canClaim: json['canClaim'] ?? false,
    nextRewardAmount: json['nextReward']?['amount'] ?? 0,
    rewards: (json['rewards'] as List?)?.map((r) => DayReward.fromJson(r)).toList() ?? [],
    xp: json['xp'] ?? 0,
    level: json['level'] ?? 'Beginner',
  );
}

class DayReward {
  final int day;
  final int amount;
  final bool claimed;
  final bool canClaim;
  DayReward({required this.day, required this.amount, this.claimed = false, this.canClaim = false});
  factory DayReward.fromJson(Map<String, dynamic> json) => DayReward(
    day: json['day'] ?? 0, amount: json['amount'] ?? 0,
    claimed: json['claimed'] ?? false, canClaim: json['canClaim'] ?? false,
  );
}
