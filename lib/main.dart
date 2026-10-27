
import 'package:flutter/material.dart';

void main() {
  runApp(const NokhbaApp());
}

class NokhbaApp extends StatelessWidget {
  const NokhbaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'نخبة | Nokhba',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF4F7FC),
        fontFamily: 'Roboto',
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text(
            'نخبة',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          backgroundColor: const Color(0xFF102A56),
          foregroundColor: Colors.white,
          actions: [
            IconButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('أهلًا بك في تطبيق نخبة')),
                );
              },
              icon: const Icon(Icons.notifications_none),
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF102A56),
                      Color(0xFF2563EB),
                    ],
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                  ),
                  borderRadius: BorderRadius.circular(22),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'مدرسة الملك عبدالله الثاني للتميز',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 10),
                    Text(
                      'الطفيلة',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 15,
                      ),
                    ),
                    SizedBox(height: 18),
                    Text(
                      'أهلًا بك في نخبة!',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'كل ما تحتاجه لتنظيم دراستك في مكان واحد.',
                      style: TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'الخدمات التعليمية',
                style: TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF102A56),
                ),
              ),
              const SizedBox(height: 14),
              _FeatureCard(
                title: 'الجدول المدرسي',
                subtitle: 'عرض الحصص والمواد الدراسية',
                icon: Icons.calendar_month,
                onTap: () => _showMessage(
                  context,
                  'الجدول المدرسي',
                  'ستتم إضافة جدول الصفوف والشعب والحصص هنا.',
                ),
              ),
              _FeatureCard(
                title: 'منظم الدراسة',
                subtitle: 'نظّم وقتك ومهامك الدراسية',
                icon: Icons.menu_book,
                onTap: () => _showMessage(
                  context,
                  'منظم الدراسة',
                  'ستتم إضافة المهام والموقت والتقويم هنا.',
                ),
              ),
              _FeatureCard(
                title: 'أوراق العمل',
                subtitle: 'الوصول إلى أوراق العمل التعليمية',
                icon: Icons.description_outlined,
                onTap: () => _showMessage(
                  context,
                  'أوراق العمل',
                  'ستتم إضافة أوراق العمل هنا.',
                ),
              ),
              _FeatureCard(
                title: 'الامتحانات',
                subtitle: 'تابع مواعيد امتحاناتك',
                icon: Icons.assignment_outlined,
                onTap: () => _showMessage(
                  context,
                  'الامتحانات',
                  'ستتم إضافة مواعيد الامتحانات هنا.',
                ),
              ),
              _FeatureCard(
                title: 'ماذا نعرف؟',
                subtitle: 'اختبر معلوماتك وتحدّ نفسك',
                icon: Icons.quiz_outlined,
                onTap: () => _showMessage(
                  context,
                  'ماذا نعرف؟',
                  'ستتم إضافة المسابقات والأسئلة هنا.',
                ),
              ),
              const SizedBox(height: 20),
              const Center(
                child: Text(
                  'Developed by Ammar Al-Haddar',
                  style: TextStyle(
                    color: Colors.blueGrey,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  void _showMessage(
    BuildContext context,
    String title,
    String message,
  ) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('حسنًا'),
          ),
        ],
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _FeatureCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 1,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 10,
        ),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: const Color(0xFFE8F0FF),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(
            icon,
            color: const Color(0xFF2563EB),
            size: 27,
          ),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 5),
          child: Text(subtitle),
        ),
        trailing: const Icon(Icons.chevron_left),
        onTap: onTap,
      ),
    );
  }
}
