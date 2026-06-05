import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/app_provider.dart';
import '../home/home_screen.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _userCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  final _countryCtrl = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _nameCtrl.dispose(); _userCtrl.dispose(); _emailCtrl.dispose();
    _passCtrl.dispose(); _confirmCtrl.dispose(); _countryCtrl.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    if (_passCtrl.text != _confirmCtrl.text) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Passwords do not match')));
      return;
    }
    final provider = context.read<AppProvider>();
    final success = await provider.register(
      _nameCtrl.text.trim(), _userCtrl.text.trim(),
      _emailCtrl.text.trim(), _passCtrl.text, _countryCtrl.text.trim(),
    );
    if (success && mounted) {
      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => HomeScreen()), (route) => false);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(provider.error ?? 'Registration failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: Text('Create Account')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: 16),
                Text('Join TradeX AI', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
                SizedBox(height: 8),
                Text('Start your trading journey with \$999,999,999 demo balance', style: TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
                SizedBox(height: 32),
                TextFormField(controller: _nameCtrl, decoration: InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person_outline)), validator: (v) => v != null && v.isNotEmpty ? null : 'Required'),
                SizedBox(height: 14),
                TextFormField(controller: _userCtrl, decoration: InputDecoration(labelText: 'Username', prefixIcon: Icon(Icons.alternate_email)), validator: (v) => v != null && v.length >= 3 ? null : 'Min 3 characters'),
                SizedBox(height: 14),
                TextFormField(controller: _emailCtrl, decoration: InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)), keyboardType: TextInputType.emailAddress, validator: (v) => v?.contains('@') == true ? null : 'Valid email required'),
                SizedBox(height: 14),
                TextFormField(controller: _countryCtrl, decoration: InputDecoration(labelText: 'Country', prefixIcon: Icon(Icons.public)), validator: (v) => v != null && v.isNotEmpty ? null : 'Required'),
                SizedBox(height: 14),
                TextFormField(controller: _passCtrl, obscureText: _obscure, decoration: InputDecoration(
                  labelText: 'Password', prefixIcon: Icon(Icons.lock_outlined),
                  suffixIcon: IconButton(icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility), onPressed: () => setState(() => _obscure = !_obscure)),
                ), validator: (v) => v != null && v.length >= 6 ? null : 'Min 6 characters'),
                SizedBox(height: 14),
                TextFormField(controller: _confirmCtrl, obscureText: true, decoration: InputDecoration(labelText: 'Confirm Password', prefixIcon: Icon(Icons.lock_outlined)), validator: (v) => v != null && v.length >= 6 ? null : 'Min 6 characters'),
                SizedBox(height: 24),
                Consumer<AppProvider>(builder: (_, provider, __) => ElevatedButton(
                  onPressed: provider.loading ? null : _register,
                  child: provider.loading ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Text('Create Account'),
                  style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 16)),
                )),
                SizedBox(height: 20),
                Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Text('Already have an account?', style: TextStyle(color: AppTheme.textSecondary)),
                  TextButton(onPressed: () => Navigator.pop(context), child: Text('Sign In')),
                ]),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
