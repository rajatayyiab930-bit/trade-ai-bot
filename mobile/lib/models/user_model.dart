class UserModel {
  final String id;
  final String fullName;
  final String username;
  final String email;
  final String? country;
  final String? profilePicture;
  final bool isVerified;
  final bool isActive;
  final String role;
  final double demoBalance;
  final double totalDeposited;
  final double portfolioValue;
  final double totalProfit;
  final double dailyProfit;
  final double weeklyProfit;
  final double monthlyProfit;
  final int xp;
  final String level;
  final List<String> badges;
  final int totalTrades;
  final int winningTrades;
  final int losingTrades;
  final int loginStreak;
  final String? referralCode;
  final int referralCount;
  final DateTime createdAt;

  UserModel({
    required this.id, required this.fullName, required this.username,
    required this.email, this.country, this.profilePicture,
    this.isVerified = false, this.isActive = true, this.role = 'user',
    this.demoBalance = 999999999, this.totalDeposited = 999999999,
    this.portfolioValue = 0, this.totalProfit = 0,
    this.dailyProfit = 0, this.weeklyProfit = 0, this.monthlyProfit = 0,
    this.xp = 0, this.level = 'Beginner', this.badges = const [],
    this.totalTrades = 0, this.winningTrades = 0, this.losingTrades = 0,
    this.loginStreak = 0, this.referralCode, this.referralCount = 0,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      fullName: json['fullName'] ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      country: json['country'],
      profilePicture: json['profilePicture'],
      isVerified: json['isVerified'] ?? false,
      isActive: json['isActive'] ?? true,
      role: json['role'] ?? 'user',
      demoBalance: (json['demoBalance'] ?? 999999999).toDouble(),
      totalDeposited: (json['totalDeposited'] ?? 999999999).toDouble(),
      portfolioValue: (json['portfolioValue'] ?? 0).toDouble(),
      totalProfit: (json['totalProfit'] ?? 0).toDouble(),
      dailyProfit: (json['dailyProfit'] ?? 0).toDouble(),
      weeklyProfit: (json['weeklyProfit'] ?? 0).toDouble(),
      monthlyProfit: (json['monthlyProfit'] ?? 0).toDouble(),
      xp: json['xp'] ?? 0,
      level: json['level'] ?? 'Beginner',
      badges: List<String>.from(json['badges'] ?? []),
      totalTrades: json['totalTrades'] ?? 0,
      winningTrades: json['winningTrades'] ?? 0,
      losingTrades: json['losingTrades'] ?? 0,
      loginStreak: json['loginStreak'] ?? 0,
      referralCode: json['referralCode'],
      referralCount: json['referralCount'] ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id, 'fullName': fullName, 'username': username, 'email': email,
    'country': country, 'profilePicture': profilePicture,
    'isVerified': isVerified, 'role': role,
    'demoBalance': demoBalance, 'xp': xp, 'level': level,
  };
}
