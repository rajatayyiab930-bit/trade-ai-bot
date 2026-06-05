import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/app_provider.dart';
import '../auth/login_screen.dart';
import '../rewards/rewards_screen.dart';

class MoreScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: Text('More')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Card
            Container(
              padding: EdgeInsets.all(16),
              decoration: AppTheme.cardGradient,
              child: Row(children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppTheme.primary,
                  child: Text(provider.user?.fullName?[0]?.toUpperCase() ?? 'U', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
                SizedBox(width: 16),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(provider.user?.fullName ?? 'User', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                  Text('@${provider.user?.username ?? 'username'}', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                  SizedBox(height: 4),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                    child: Text(provider.user?.level ?? 'Beginner', style: TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.w600)),
                  ),
                ])),
                Icon(Icons.chevron_right, color: AppTheme.textMuted),
              ]),
            ),
            SizedBox(height: 20),

            _menuSection('Trading', [
              _menuItem(Icons.receipt_long, 'Trade History', () => {}),
              _menuItem(Icons.emoji_events, 'Rewards & Achievements', () => Navigator.push(context, MaterialPageRoute(builder: (_) => RewardsScreen()))),
              _menuItem(Icons.leaderboard, 'Leaderboard', () => {}),
              _menuItem(Icons.assignment, 'Challenges', () => {}),
            ]),
            _menuSection('Account', [
              _menuItem(Icons.person_outline, 'Edit Profile', () => {}),
              _menuItem(Icons.settings_outlined, 'Settings', () => {}),
              _menuItem(Icons.security, 'Security', () => {}),
              _menuItem(Icons.notifications_outlined, 'Notifications', () => {}),
            ]),
            _menuSection('Support', [
              _menuItem(Icons.help_outline, 'Help Center', () => {}),
              _menuItem(Icons.message_outlined, 'Support Tickets', () => {}),
              _menuItem(Icons.info_outline, 'About TradeX AI', () => {}),
            ]),

            SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await provider.logout();
                  Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => LoginScreen()), (route) => false);
                },
                icon: Icon(Icons.logout, color: AppTheme.danger),
                label: Text('Sign Out', style: TextStyle(color: AppTheme.danger)),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppTheme.danger.withOpacity(0.3)),
                  padding: EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
            SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _menuSection(String title, List<Widget> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(padding: EdgeInsets.only(left: 4, bottom: 8, top: 8),
          child: Text(title, style: TextStyle(color: AppTheme.textMuted, fontSize: 13, fontWeight: FontWeight.w600, letterSpacing: 0.5))),
        Container(
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.surfaceLight),
          ),
          child: Column(children: items),
        ),
        SizedBox(height: 8),
      ],
    );
  }

  Widget _menuItem(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(children: [
          Icon(icon, color: AppTheme.textSecondary, size: 22),
          SizedBox(width: 14),
          Expanded(child: Text(label, style: TextStyle(fontSize: 15))),
          Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 20),
        ]),
      ),
    );
  }
}
