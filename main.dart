import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  if (supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty) {
    await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
  }
  runApp(const NokhbaApp());
}

bool get hasSupabase => supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
SupabaseClient? get db => hasSupabase ? Supabase.instance.client : null;

class NokhbaApp extends StatefulWidget {
  const NokhbaApp({super.key});
  @override
  State<NokhbaApp> createState() => _NokhbaAppState();
}

class _NokhbaAppState extends State<NokhbaApp> {
  ThemeMode mode = ThemeMode.light;
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'تطبيق نخبة',
    debugShowCheckedModeBanner: false,
    themeMode: mode,
    theme: _theme(Brightness.light),
    darkTheme: _theme(Brightness.dark),
    home: HomeScreen(onToggleTheme: () => setState(() =>
      mode = mode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light)),
  );
}

ThemeData _theme(Brightness brightness) {
  final dark = brightness == Brightness.dark;
  const navy = Color(0xFF0B2545);
  const blue = Color(0xFF134074);
  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: ColorScheme.fromSeed(seedColor: blue, brightness: brightness),
    scaffoldBackgroundColor: dark ? const Color(0xFF101827) : const Color(0xFFF3F7FC),
    appBarTheme: const AppBarTheme(backgroundColor: navy, foregroundColor: Colors.white, centerTitle: true),
    cardTheme: CardThemeData(elevation: 1, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
      filled: true,
    ),
  );
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.onToggleTheme});
  final VoidCallback onToggleTheme;
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;
  String _name = '';
  String _role = 'student';
  List<Map<String, dynamic>> _announcements = [];
  List<Map<String, dynamic>> _teachers = [];
  bool _loading = false;
  final _username = TextEditingController();
  final _password = TextEditingController();

  static const pages = [
    ('الرئيسية', Icons.home_rounded),
    ('الجدول المدرسي', Icons.calendar_month_rounded),
    ('منظم الدراسة', Icons.task_alt_rounded),
    ('أوراق العمل', Icons.description_rounded),
    ('المعلمون', Icons.school_rounded),
    ('ماذا نعرف؟', Icons.quiz_rounded),
  ];

  @override
  void initState() { super.initState(); _loadAnnouncements(); _loadTeachers(); }
  @override
  void dispose() { _username.dispose(); _password.dispose(); super.dispose(); }

  Future<void> _loadAnnouncements() async {
    if (db == null) return;
    try {
      final rows = await db!.from('announcements').select('id,text,created_at').order('created_at', ascending: false).limit(10);
      if (mounted) setState(() => _announcements = List<Map<String,dynamic>>.from(rows));
    } catch (_) {}
  }

  Future<void> _loadTeachers() async {
    if (db == null) return;
    try {
      final rows = await db!.from('teachers').select('id,username,name,specialty,photo,bio,category,gender,classes,tasks_text,years_experience').order('created_at');
      if (mounted) setState(() => _teachers = List<Map<String,dynamic>>.from(rows));
    } catch (_) {}
  }

  Future<void> _login() async {
    final u = _username.text.trim().toLowerCase();
    final p = _password.text;
    if (u.isEmpty || p.isEmpty) { _message('أدخل اسم المستخدم وكلمة السر'); return; }
    if (db == null) { _message('إعدادات Supabase غير موجودة. راجع README.md.'); return; }
    setState(() => _loading = true);
    try {
      await db!.auth.signInWithPassword(email: '$u@nokhba.school', password: p);
      final prof = await db!.from('profiles').select('role,name').eq('username', u).maybeSingle();
      if (prof == null) {
        await db!.auth.signOut();
        _message('لا يوجد ملف مستخدم مرتبط بهذا الاسم في profiles.');
      } else {
        setState(() { _role = '${prof['role'] ?? 'student'}'; _name = '${prof['name'] ?? u}'; });
        _message('أهلًا $_name');
      }
    } on AuthException {
      _message('اسم المستخدم أو كلمة السر غير صحيحة، أو أن الحساب غير مفعّل.');
    } catch (e) {
      _message('تعذر تسجيل الدخول: $e');
    } finally { if (mounted) setState(() => _loading = false); }
  }

  void _message(String value) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(value), behavior: SnackBarBehavior.floating));
  }

  Future<void> _addAnnouncement() async {
    final c = TextEditingController();
    final text = await showDialog<String>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('إضافة إعلان'),
      content: TextField(controller: c, minLines: 2, maxLines: 5, decoration: const InputDecoration(hintText: 'اكتب نص الإعلان')),
      actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
        FilledButton(onPressed: () => Navigator.pop(ctx, c.text.trim()), child: const Text('نشر'))],
    ));
    if (text == null || text.isEmpty) return;
    if (db == null) { _message('اربط Supabase أولًا لنشر الإعلانات.'); return; }
    try {
      await db!.from('announcements').insert({'text': text, 'by_name': _name.isEmpty ? 'مستخدم التطبيق' : _name});
      await _loadAnnouncements(); _message('تم نشر الإعلان');
    } catch (e) { _message('تعذر نشر الإعلان: $e'); }
  }

  @override
  Widget build(BuildContext context) {
    final current = pages[_index];
    return Directionality(textDirection: TextDirection.rtl, child: Scaffold(
      appBar: AppBar(
        title: Text(current.$1),
        actions: [
          IconButton(tooltip: 'تغيير المظهر', onPressed: widget.onToggleTheme, icon: const Icon(Icons.contrast_rounded)),
          if (_name.isNotEmpty) IconButton(tooltip: 'تسجيل الخروج', onPressed: () async {
            await db?.auth.signOut(); setState(() { _name = ''; _role = 'student'; });
          }, icon: const Icon(Icons.logout_rounded)),
        ],
      ),
      body: IndexedStack(index: _index, children: [
        _homePage(), _schedulePage(), _organizerPage(), _worksheetsPage(), _teachersPage(), _quizPage(),
      ]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (v) => setState(() => _index = v),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'الرئيسية'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), selectedIcon: Icon(Icons.calendar_month), label: 'الجدول'),
          NavigationDestination(icon: Icon(Icons.checklist_outlined), selectedIcon: Icon(Icons.checklist), label: 'الدراسة'),
          NavigationDestination(icon: Icon(Icons.description_outlined), selectedIcon: Icon(Icons.description), label: 'الأوراق'),
          NavigationDestination(icon: Icon(Icons.school_outlined), selectedIcon: Icon(Icons.school), label: 'المعلمون'),
          NavigationDestination(icon: Icon(Icons.quiz_outlined), selectedIcon: Icon(Icons.quiz), label: 'المعرفة'),
        ],
      ),
    ));
  }

  Widget _homePage() => ListView(padding: const EdgeInsets.all(16), children: [
    Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(colors: [Color(0xFF0B2545), Color(0xFF134074), Color(0xFF2962A3)], begin: Alignment.topRight, end: Alignment.bottomLeft),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (AssetImage('assets/images/school-logo.jpg') != null)
          Center(child: Image.asset('assets/images/school-logo.jpg', height: 90, errorBuilder: (_,__,___) => const Icon(Icons.school, color: Colors.white, size: 64))),
        const SizedBox(height: 12),
        const Text('أهلًا بك في تطبيق نخبة', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 8),
        const Text('مدرسة الملك عبدالله الثاني للتميز - الطفيلة', style: TextStyle(color: Colors.white70, fontSize: 14)),
        const SizedBox(height: 14),
        Text(_name.isEmpty ? 'خدمات المدرسة في مكان واحد' : 'مرحبًا $_name', style: const TextStyle(color: Colors.white)),
      ]),
    ),
    const SizedBox(height: 18),
    if (_name.isEmpty) _loginCard(),
    const SizedBox(height: 8),
    const _SectionTitle('الإعلانات المدرسية'),
    if (_role == 'admin') Align(alignment: Alignment.centerLeft, child: FilledButton.icon(onPressed: _addAnnouncement, icon: const Icon(Icons.add), label: const Text('إضافة إعلان'))),
    if (_announcements.isEmpty) const _InfoCard(icon: Icons.campaign_outlined, title: 'لا توجد إعلانات معروضة', subtitle: 'تظهر الإعلانات هنا عند ربط قاعدة البيانات ووجود بيانات.'),
    ..._announcements.map((a) => Card(child: ListTile(leading: const CircleAvatar(child: Icon(Icons.campaign)), title: Text('${a['text'] ?? ''}'), subtitle: Text(_formatDate(a['created_at']))))),
    const SizedBox(height: 12),
    const _SectionTitle('الخدمات'),
    GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, childAspectRatio: 1.45, mainAxisSpacing: 10, crossAxisSpacing: 10,
      children: [
        _MenuCard(title: 'الجدول المدرسي', icon: Icons.calendar_month, onTap: () => setState(() => _index = 1)),
        _MenuCard(title: 'منظم الدراسة', icon: Icons.task_alt, onTap: () => setState(() => _index = 2)),
        _MenuCard(title: 'أوراق العمل', icon: Icons.description, onTap: () => setState(() => _index = 3)),
        _MenuCard(title: 'المعلمون', icon: Icons.school, onTap: () => setState(() => _index = 4)),
        _MenuCard(title: 'ماذا نعرف؟', icon: Icons.quiz, onTap: () => setState(() => _index = 5)),
      ]),
    const SizedBox(height: 16),
    const Center(child: Text('Developed by Ammar Al-Haddar', style: TextStyle(color: Colors.grey, fontSize: 12))),
  ]);

  Widget _loginCard() => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
    const Text('دخول المعلمين والإدارة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
    const SizedBox(height: 12),
    TextField(controller: _username, textInputAction: TextInputAction.next, decoration: const InputDecoration(labelText: 'اسم المستخدم', prefixIcon: Icon(Icons.person_outline))),
    const SizedBox(height: 10),
    TextField(controller: _password, obscureText: true, onSubmitted: (_) => _login(), decoration: const InputDecoration(labelText: 'كلمة المرور', prefixIcon: Icon(Icons.lock_outline))),
    const SizedBox(height: 12),
    FilledButton(onPressed: _loading ? null : _login, child: _loading ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('تسجيل الدخول')),
  ])));

  Widget _schedulePage() => _SchedulePage(message: _message, role: _role);
  Widget _organizerPage() => const _TasksPage();
  Widget _worksheetsPage() => const _PlaceholderPage(icon: Icons.description_outlined, title: 'أوراق العمل', body: 'واجهة القسم جاهزة كبداية. يلزم ربطها بجدول أوراق العمل الفعلي في قاعدة البيانات بعد التأكد من مخططه وصلاحياته.');
  Widget _quizPage() => const _QuizPage();

  Widget _teachersPage() => RefreshIndicator(
    onRefresh: _loadTeachers,
    child: ListView(padding: const EdgeInsets.all(16), children: [
      const _SectionTitle('المعلمون والمعلمات'),
      if (db == null) const _InfoCard(icon: Icons.cloud_off, title: 'قاعدة البيانات غير مربوطة', subtitle: 'أضف إعدادات Supabase حسب ملف README.md.'),
      if (db != null && _teachers.isEmpty) const _InfoCard(icon: Icons.people_outline, title: 'لا توجد بيانات معروضة', subtitle: 'اسحب للأسفل لتحديث القائمة.'),
      ..._teachers.map((t) => Card(child: ListTile(
        leading: CircleAvatar(child: Text(('${t['name'] ?? '?'}').isNotEmpty ? '${t['name']}'.substring(0,1) : '?')),
        title: Text('${t['name'] ?? 'بدون اسم'}'),
        subtitle: Text([t['specialty'], t['category'], t['classes']].where((x) => x != null && '$x'.trim().isNotEmpty).join(' • ')),
        trailing: const Icon(Icons.chevron_left),
        onTap: () => showDialog(context: context, builder: (ctx) => AlertDialog(
          title: Text('${t['name'] ?? 'بطاقة المعلم'}'),
          content: SingleChildScrollView(child: Text([
            if (t['specialty'] != null) 'التخصص: ${t['specialty']}',
            if (t['years_experience'] != null) 'سنوات الخبرة: ${t['years_experience']}',
            if (t['classes'] != null) 'الصفوف: ${t['classes']}',
            if (t['bio'] != null) '${t['bio']}',
          ].join('\\n\\n'))),
          actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إغلاق'))],
        )),
      ))),
    ]),
  );

  String _formatDate(dynamic value) {
    if (value == null) return '';
    try { return DateFormat('yyyy/MM/dd').format(DateTime.parse('$value').toLocal()); } catch (_) { return ''; }
  }
}

class _SchedulePage extends StatefulWidget {
  const _SchedulePage({required this.message, required this.role});
  final void Function(String) message;
  final String role;
  @override
  State<_SchedulePage> createState() => _SchedulePageState();
}
class _SchedulePageState extends State<_SchedulePage> {
  String grade = '7', section = 'أ';
  bool loading = false;
  List<dynamic> rows = [];
  static const grades = {'7':'السابع','8':'الثامن','9':'التاسع','10':'العاشر','11':'الحادي عشر','12':'الثاني عشر'};
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    setState(() => loading = true);
    try {
      if (db != null) {
        final res = await db!.from('schedules').select('data').eq('key', '${grade}_$section').maybeSingle();
        if (res != null && res['data'] is List) { rows = List<dynamic>.from(res['data']); }
        else { rows = []; }
      } else { rows = []; }
    } catch (e) { widget.message('تعذر تحميل الجدول: $e'); }
    if (mounted) setState(() => loading = false);
  }
  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.all(16), children: [
    const _SectionTitle('الجدول المدرسي'),
    DropdownButtonFormField<String>(value: grade, decoration: const InputDecoration(labelText: 'الصف'), items: grades.entries.map((e) => DropdownMenuItem(value:e.key, child:Text(e.value))).toList(), onChanged: (v) { if (v != null) setState(() => grade = v); load(); }),
    const SizedBox(height: 10),
    SegmentedButton<String>(segments: const [ButtonSegment(value:'أ',label:Text('الشعبة أ')),ButtonSegment(value:'ب',label:Text('الشعبة ب')),ButtonSegment(value:'ج',label:Text('الشعبة ج'))], selected: {section}, onSelectionChanged: (s) { setState(() => section = s.first); load(); }),
    const SizedBox(height: 14),
    if (loading) const Center(child: CircularProgressIndicator()),
    if (!loading && rows.isEmpty) const _InfoCard(icon: Icons.calendar_month, title: 'الجدول غير متاح', subtitle: 'لا توجد بيانات محفوظة لهذا الصف والشعبة، أو أن Supabase غير مربوط.'),
    ...rows.asMap().entries.map((e) {
      final r = e.value is Map ? Map<String,dynamic>.from(e.value as Map) : <String,dynamic>{'المادة':'${e.value}'};
      return Card(child: ListTile(leading: CircleAvatar(child: Text('${e.key + 1}')), title: Text('${r['subject'] ?? r['المادة'] ?? r['name'] ?? 'الحصة ${e.key + 1}'}'), subtitle: Text([r['teacher'], r['time'], r['room']].where((x) => x != null && '$x'.isNotEmpty).join(' • '))));
    }),
    if (widget.role == 'admin' || widget.role == 'staff') const Padding(padding: EdgeInsets.only(top:8), child: Text('ملاحظة: تعديل الجدول من التطبيق يحتاج استكمال محرر الصفوف وربطه بسياسات RLS.')),
  ]);
}

class _TasksPage extends StatefulWidget { const _TasksPage(); @override State<_TasksPage> createState()=>_TasksPageState(); }
class _TasksPageState extends State<_TasksPage> {
  List<String> tasks = [];
  final c = TextEditingController();
  @override void initState() { super.initState(); _load(); }
  @override void dispose() { c.dispose(); super.dispose(); }
  Future<void> _load() async { final p = await SharedPreferences.getInstance(); setState(() => tasks = p.getStringList('nokhba_tasks') ?? []); }
  Future<void> _add() async { final v = c.text.trim(); if (v.isEmpty) return; final p = await SharedPreferences.getInstance(); setState(() { tasks.add(v); c.clear(); }); await p.setStringList('nokhba_tasks', tasks); }
  Future<void> _delete(int i) async { final p = await SharedPreferences.getInstance(); setState(() => tasks.removeAt(i)); await p.setStringList('nokhba_tasks', tasks); }
  @override Widget build(BuildContext context)=>ListView(padding: const EdgeInsets.all(16), children:[
    const _SectionTitle('منظم الدراسة'),
    const Text('أضف المهام الدراسية وحدد ما أنجزته. تحفظ هذه القائمة على الجهاز الحالي.'),
    const SizedBox(height:12),
    Row(children:[Expanded(child:TextField(controller:c, onSubmitted:(_)=>_add(), decoration:const InputDecoration(hintText:'مثال: مراجعة درس العلوم'))), const SizedBox(width:8), IconButton.filled(onPressed:_add, icon:const Icon(Icons.add))]),
    const SizedBox(height:10),
    if(tasks.isEmpty) const _InfoCard(icon:Icons.checklist, title:'لا توجد مهام بعد', subtitle:'أضف أول مهمة دراسية من الحقل أعلاه.'),
    ...tasks.asMap().entries.map((e)=>Card(child:ListTile(leading:const Icon(Icons.radio_button_unchecked), title:Text(e.value), trailing:IconButton(onPressed:()=>_delete(e.key), icon:const Icon(Icons.delete_outline))))),
  ]);
}

class _QuizPage extends StatefulWidget { const _QuizPage(); @override State<_QuizPage> createState()=>_QuizPageState(); }
class _QuizPageState extends State<_QuizPage> {
  int q=0, score=0; bool answered=false;
  final questions = const [
    ('ما عاصمة الأردن؟',['إربد','عمّان','الطفيلة','العقبة'],1),
    ('كم عدد أيام الأسبوع؟',['5','6','7','8'],2),
    ('أي كوكب يُعرف بالكوكب الأحمر؟',['المريخ','الزهرة','زحل','عطارد'],0),
  ];
  @override Widget build(BuildContext context) {
    final item=questions[q];
    return ListView(padding:const EdgeInsets.all(16),children:[
      const _SectionTitle('ماذا نعرف؟'),
      const Text('اختبر معلوماتك في مسابقة قصيرة.'),
      const SizedBox(height:16),
      Card(child:Padding(padding:const EdgeInsets.all(18),child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:[
        Text('السؤال ${q+1} من ${questions.length}',style:Theme.of(context).textTheme.labelLarge),
        const SizedBox(height:12), Text(item.$1,style:Theme.of(context).textTheme.titleLarge),
        const SizedBox(height:12),
        ...item.$2.asMap().entries.map((a)=>Padding(padding:const EdgeInsets.only(bottom:8),child:OutlinedButton(onPressed:answered?null:(){setState(()=>answered=true); if(a.key==item.$3) score++;},child:Text(a.value)))),
        if(answered) Text('الإجابة الصحيحة: ${item.$2[item.$3]}',style:const TextStyle(fontWeight:FontWeight.bold)),
        const SizedBox(height:12),
        FilledButton(onPressed:!answered?null:(){setState((){if(q<questions.length-1){q++;answered=false;}else{q=0;score=0;answered=false;}});},child:Text(q==questions.length-1?'إعادة المسابقة':'السؤال التالي')),
        if(answered && q==questions.length-1) Text('نتيجتك: $score من ${questions.length}',textAlign:TextAlign.center),
      ]))),
    ]);
  }
}

class _PlaceholderPage extends StatelessWidget {
  const _PlaceholderPage({required this.icon, required this.title, required this.body});
  final IconData icon; final String title; final String body;
  @override Widget build(BuildContext context)=>ListView(padding:const EdgeInsets.all(16),children:[
    _SectionTitle(title), _InfoCard(icon:icon,title:title,subtitle:body),
  ]);
}
class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text,{super.key}); final String text;
  @override Widget build(BuildContext context)=>Padding(padding:const EdgeInsets.only(bottom:10,top:6),child:Text(text,style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.bold)));
}
class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.icon,required this.title,required this.subtitle});
  final IconData icon; final String title; final String subtitle;
  @override Widget build(BuildContext context)=>Card(child:Padding(padding:const EdgeInsets.all(18),child:Row(crossAxisAlignment:CrossAxisAlignment.start,children:[Icon(icon,size:30),const SizedBox(width:12),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(title,style:const TextStyle(fontWeight:FontWeight.bold)),const SizedBox(height:6),Text(subtitle)]))])));
}
class _MenuCard extends StatelessWidget {
  const _MenuCard({required this.title,required this.icon,required this.onTap});
  final String title; final IconData icon; final VoidCallback onTap;
  @override Widget build(BuildContext context)=>Card(child:InkWell(borderRadius:BorderRadius.circular(18),onTap:onTap,child:Padding(padding:const EdgeInsets.all(14),child:Column(mainAxisAlignment:MainAxisAlignment.center,children:[Icon(icon,size:30,color:Theme.of(context).colorScheme.primary),const SizedBox(height:8),Text(title,textAlign:TextAlign.center,style:const TextStyle(fontWeight:FontWeight.w600))]))));
}
