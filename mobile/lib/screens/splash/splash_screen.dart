import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/app_provider.dart';
import '../auth/login_screen.dart';
import '../home/home_screen.dart';

class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnim;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: Duration(milliseconds: 2000));
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: _controller, curve: Curves.easeIn));
    _scaleAnim = Tween<double>(begin: 0.8, end: 1).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));
    _controller.forward();
    _navigateAfterDelay();
  }

  Future<void> _navigateAfterDelay() async {
    await Future.delayed(Duration(seconds: 3));
    if (mounted) {
      final provider = context.read<AppProvider>();
      Navigator.pushReplacement(context, MaterialPageRoute(
        builder: (_) => provider.isLoggedIn ? HomeScreen() : LoginScreen(),
      ));
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: ScaleTransition(
            scale: _scaleAnim,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 100, height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(colors: [AppTheme.primary, Color(0xFF8B7FFF)]),
                    boxShadow: [BoxShadow(color: AppTheme.primary.withOpacity(0.4), blurRadius: 30, spreadRadius: 5)],
                  ),
                  child: Icon(Icons.auto_awesome, size: 50, color: Colors.white),
                ),
                SizedBox(height: 24),
                Text('TradeX AI', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1)),
                SizedBox(height: 8),
                Text('AI-Powered Trading Simulator', style: TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
                SizedBox(height: 40),
                SizedBox(
                  width: 40, height: 40,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    valueColor: AlwaysStoppedAnimation(AppTheme.primary),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
