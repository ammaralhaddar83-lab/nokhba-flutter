import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const NokhbaApp());
}

class NokhbaApp extends StatelessWidget {
  const NokhbaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'نخبة | Nokhba',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2563EB)),
        useMaterial3: true,
      ),
      home: const NokhbaWebPage(),
    );
  }
}

class NokhbaWebPage extends StatefulWidget {
  const NokhbaWebPage({super.key});

  @override
  State<NokhbaWebPage> createState() => _NokhbaWebPageState();
}

class _NokhbaWebPageState extends State<NokhbaWebPage> {
  late final WebViewController controller;
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFF1F5F9))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() { loading = true; error = null; }),
          onPageFinished: (_) => setState(() { loading = false; }),
          onWebResourceError: (e) {
            if (e.isForMainFrame == true) {
              setState(() { loading = false; error = e.description; });
            }
          },
        ),
      )
      ..loadFlutterAsset('assets/site/index.html');
  }

  Future<bool> _back() async {
    if (await controller.canGoBack()) {
      await controller.goBack();
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _back,
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: controller),
              if (loading)
                const Align(
                  alignment: Alignment.topCenter,
                  child: LinearProgressIndicator(minHeight: 2),
                ),
              if (error != null)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.wifi_off, size: 48),
                        const SizedBox(height: 12),
                        const Text('تعذّر تحميل التطبيق'),
                        const SizedBox(height: 8),
                        Text(error!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => controller.loadFlutterAsset('assets/site/index.html'),
                          child: const Text('إعادة المحاولة'),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
