import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../models/trade_models.dart';
import '../services/api_service.dart';
import '../config/constants.dart';

class AppProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  UserModel? _user;
  DashboardData? _dashboard;
  List<AssetModel> _assets = [];
  List<TradeModel> _trades = [];
  PortfolioModel? _portfolio;
  RewardStatus? _rewardStatus;
  List<Map<String, dynamic>> _news = [];
  bool _loading = false;
  String? _error;

  UserModel? get user => _user;
  DashboardData? get dashboard => _dashboard;
  List<AssetModel> get assets => _assets;
  List<TradeModel> get trades => _trades;
  PortfolioModel? get portfolio => _portfolio;
  RewardStatus? get rewardStatus => _rewardStatus;
  List<Map<String, dynamic>> get news => _news;
  bool get loading => _loading;
  String? get error => _error;
  bool get isLoggedIn => _api.hasToken;

  Future<void> init() async {
    await _api.init();
    if (_api.hasToken) {
      await getProfile();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      _loading = true; notifyListeners();
      final res = await _api.post('/auth/login', {
        'email': email, 'password': password,
      });
      await _api.setToken(res['token']);
      _user = UserModel.fromJson(res['user']);
      _loading = false; notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString(); _loading = false; notifyListeners();
      return false;
    }
  }

  Future<bool> register(String fullName, String username, String email, String password, String country) async {
    try {
      _loading = true; notifyListeners();
      final res = await _api.post('/auth/register', {
        'fullName': fullName, 'username': username,
        'email': email, 'password': password, 'country': country,
      });
      await _api.setToken(res['token']);
      _user = UserModel.fromJson(res['user']);
      _loading = false; notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString(); _loading = false; notifyListeners();
      return false;
    }
  }

  Future<bool> googleLogin(String email, String fullName, String googleId) async {
    try {
      _loading = true; notifyListeners();
      final res = await _api.post('/auth/google', {
        'email': email, 'fullName': fullName, 'googleId': googleId,
      });
      await _api.setToken(res['token']);
      _user = UserModel.fromJson(res['user']);
      _loading = false; notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString(); _loading = false; notifyListeners();
      return false;
    }
  }

  Future<void> getProfile() async {
    try {
      final res = await _api.get('/auth/profile');
      _user = UserModel.fromJson(res['user']);
      notifyListeners();
    } catch (e) {
      _error = e.toString(); notifyListeners();
    }
  }

  Future<void> getDashboard() async {
    try {
      _loading = true; notifyListeners();
      final res = await _api.get('/trading/dashboard');
      _dashboard = DashboardData.fromJson(res);
      _loading = false; notifyListeners();
    } catch (e) {
      _error = e.toString(); _loading = false; notifyListeners();
    }
  }

  Future<void> getAssets() async {
    try {
      final res = await _api.get('/trading/assets');
      _assets = (res['assets'] as List).map((a) => AssetModel.fromJson(a)).toList();
      notifyListeners();
    } catch (e) {
      _error = e.toString(); notifyListeners();
    }
  }

  Future<void> getTrades() async {
    try {
      final res = await _api.get('/trading/trades');
      _trades = (res['trades'] as List).map((t) => TradeModel.fromJson(t)).toList();
      notifyListeners();
    } catch (e) {
      _error = e.toString(); notifyListeners();
    }
  }

  Future<void> getPortfolio() async {
    try {
      final res = await _api.get('/trading/portfolio');
      _portfolio = PortfolioModel.fromJson(res['portfolio']);
      notifyListeners();
    } catch (e) {
      _error = e.toString(); notifyListeners();
    }
  }

  Future<Map<String, dynamic>?> placeOrder(String symbol, String assetName, String assetType, String tradeType, double quantity, double price, {String orderType = 'market', double? stopLoss, double? takeProfit}) async {
    try {
      _loading = true; notifyListeners();
      final res = await _api.post('/trading/orders', {
        'symbol': symbol, 'assetName': assetName, 'assetType': assetType,
        'tradeType': tradeType, 'quantity': quantity, 'price': price,
        'orderType': orderType, 'stopLoss': stopLoss, 'takeProfit': takeProfit,
      });
      _loading = false; notifyListeners();
      await getPortfolio();
      await getDashboard();
      return res;
    } catch (e) {
      _error = e.toString(); _loading = false; notifyListeners();
      return null;
    }
  }

  Future<void> getRewardStatus() async {
    try {
      final res = await _api.get('/rewards/status');
      _rewardStatus = RewardStatus.fromJson(res);
      notifyListeners();
    } catch (e) {
      _error = e.toString(); notifyListeners();
    }
  }

  Future<bool> claimDailyReward() async {
    try {
      await _api.post('/rewards/daily-claim', {});
      await getRewardStatus();
      await getProfile();
      return true;
    } catch (e) {
      _error = e.toString(); notifyListeners();
      return false;
    }
  }

  Future<AIChatResponse> chatWithAI(String message) async {
    try {
      final res = await _api.post('/ai/chat', {'message': message});
      return AIChatResponse.fromJson(res);
    } catch (e) {
      return AIChatResponse(responses: ['Sorry, I encountered an error. Please try again.']);
    }
  }

  Future<Map<String, dynamic>?> getMarketAnalysis() async {
    try {
      return await _api.get('/ai/market-analysis');
    } catch (e) {
      return null;
    }
  }

  Future<void> logout() async {
    await _api.clearToken();
    _user = null;
    _dashboard = null;
    _portfolio = null;
    _trades = [];
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
