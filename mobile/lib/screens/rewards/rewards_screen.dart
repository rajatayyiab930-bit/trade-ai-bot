import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/app_provider.dart';

class RewardsScreen extends StatefulWidget {
  @override
  _RewardsScreenState createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AppProvider>().getRewardStatus();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: Text('Rewards & Achievements')),
      body: Consumer<AppProvider>(
        builder: (_, provider, __) {
          final reward = provider.rewardStatus;
          return SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Level Card
                Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [AppTheme.warning.withOpacity(0.15), AppTheme.surface]),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppTheme.warning.withOpacity(0.15)),
                  ),
                  child: Row(children: [
                    Container(
                      width: 56, height: 56,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(colors: [AppTheme.warning, Colors.orange]),
                        boxShadow: [BoxShadow(color: AppTheme.warning.withOpacity(0.3), blurRadius: 12)],
                      ),
                      child: Icon(Icons.emoji_events, color: Colors.white, size: 28),
                    ),
                    SizedBox(width: 16),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(provider.user?.level ?? 'Beginner', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          value: (provider.user?.xp ?? 0) / 5000,
                          backgroundColor: AppTheme.surfaceLight,
                          valueColor: AlwaysStoppedAnimation(AppTheme.warning),
                          minHeight: 8,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text('${provider.user?.xp ?? 0} XP', style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                    ])),
                  ]),
                ),
                SizedBox(height: 20),

                // Daily Rewards
                Text('Daily Login Rewards', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                SizedBox(height: 12),
                SizedBox(
                  height: 110,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: 7,
                    itemBuilder: (_, i) {
                      final day = i + 1;
                      final isToday = day == (reward?.streak ?? 0) + 1;
                      final claimed = day <= (reward?.streak ?? 0);
                      final amounts = [0, 1000, 2000, 5000, 10000, 25000, 50000, 100000];
                      final amount = amounts[day];

                      return Container(
                        width: 80,
                        margin: EdgeInsets.only(right: 10),
                        padding: EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isToday
                            ? AppTheme.primary.withOpacity(0.2)
                            : claimed ? AppTheme.success.withOpacity(0.1) : AppTheme.surfaceLight,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isToday ? AppTheme.primary : claimed ? AppTheme.success.withOpacity(0.3) : AppTheme.surfaceLight,
                          ),
                        ),
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(
                            claimed ? Icons.check_circle : isToday ? Icons.radio_button_checked : Icons.radio_button_off,
                            color: claimed ? AppTheme.success : isToday ? AppTheme.primary : AppTheme.textMuted,
                            size: 22,
                          ),
                          SizedBox(height: 6),
                          Text('Day $day', style: TextStyle(fontSize: 11, color: claimed ? AppTheme.success : AppTheme.textSecondary, fontWeight: FontWeight.w600)),
                          SizedBox(height: 2),
                          Text('\$${_formatAmount(amount.toDouble())}', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                        ]),
                      );
                    },
                  ),
                ),
                SizedBox(height: 16),

                // Claim Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: reward?.canClaim == true ? () => provider.claimDailyReward() : null,
                    icon: Icon(Icons.card_giftcard),
                    label: Text(reward?.canClaim == true ? 'Claim Daily Reward' : 'Come back tomorrow!'),
                    style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 14)),
                  ),
                ),
                SizedBox(height: 20),

                // Referral
                Text('Referral Program', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                SizedBox(height: 12),
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: AppTheme.cardGradient,
                  child: Row(children: [
                    Icon(Icons.group_add, color: AppTheme.primary, size: 40),
                    SizedBox(width: 16),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Invite Friends', style: TextStyle(fontWeight: FontWeight.w600)),
                      Text('Earn \$50,000 per referral', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                    ])),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                      child: Text('${provider.user?.referralCount ?? 0}', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                    ),
                  ]),
                ),
                SizedBox(height: 20),

                // Achievements
                Text('Achievements', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                SizedBox(height: 12),
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: AppTheme.cardGradient,
                  child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                    _achieveItem(Icons.local_fire_department, 'First Trade', false),
                    _achieveItem(Icons.trending_up, '10 Trades', false),
                    _achieveItem(Icons.star, 'Profit Maker', true),
                    _achieveItem(Icons.diamond, 'Diamond', false),
                  ]),
                ),
                SizedBox(height: 80),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _achieveItem(IconData icon, String label, bool unlocked) => Column(children: [
    Container(
      width: 44, height: 44,
      decoration: BoxDecoration(
        color: unlocked ? AppTheme.warning.withOpacity(0.2) : AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, color: unlocked ? AppTheme.warning : AppTheme.textMuted, size: 22),
    ),
    SizedBox(height: 6),
    Text(label, style: TextStyle(fontSize: 11, color: unlocked ? AppTheme.textPrimary : AppTheme.textMuted)),
  ]);

  String _formatAmount(double amount) {
    if (amount >= 1e6) return '${(amount / 1e6).toStringAsFixed(1)}M';
    if (amount >= 1e3) return '${(amount / 1e3).toStringAsFixed(1)}K';
    return amount.toStringAsFixed(0);
  }
}
