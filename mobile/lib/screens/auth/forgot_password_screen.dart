import 'package:flutter/material.dart';
import '../../config/theme.dart';

class ForgotPasswordScreen extends StatefulWidget {
  @override
  _ForgotPasswordScreenState createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  int _step = 0;

  @override
  void dispose() {
    _emailCtrl.dispose(); _otpCtrl.dispose(); _passCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: Text('Reset Password')),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(height: 16),
                Text(_step == 0 ? 'Forgot Password' : _step == 1 ? 'Enter OTP' : 'New Password',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                SizedBox(height: 8),
                Text(_step == 0 ? 'Enter your email to receive OTP' : _step == 1 ? 'Check your email for the OTP' : 'Create your new password',
                  style: TextStyle(color: AppTheme.textSecondary)),
                SizedBox(height: 32),
                if (_step == 0)
                  TextFormField(controller: _emailCtrl, decoration: InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)), keyboardType: TextInputType.emailAddress, validator: (v) => v?.contains('@') == true ? null : 'Valid email required'),
                if (_step == 1)
                  TextFormField(controller: _otpCtrl, decoration: InputDecoration(labelText: 'OTP Code', prefixIcon: Icon(Icons.pin)), keyboardType: TextInputType.number, maxLength: 6, validator: (v) => v != null && v.length == 6 ? null : 'Enter 6-digit OTP'),
                if (_step == 2)
                  TextFormField(controller: _passCtrl, obscureText: true, decoration: InputDecoration(labelText: 'New Password', prefixIcon: Icon(Icons.lock_outlined)), validator: (v) => v != null && v.length >= 6 ? null : 'Min 6 characters'),
                SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      if (_step < 2) setState(() => _step++);
                      else Navigator.pop(context);
                    }
                  },
                  child: Text(_step == 2 ? 'Reset Password' : 'Continue'),
                  style: ElevatedButton.styleFrom(padding: EdgeInsets.symmetric(vertical: 16)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
