import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const MedAiApp());
}

class MedAiApp extends StatelessWidget {
  const MedAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MedAi',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF58D7C2)),
        useMaterial3: true,
      ),
      home: const ReportScreen(),
    );
  }
}

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  String selectedFileName = 'No file selected';
  String selectedPath = '';
  String language = 'english';
  String? analysisMessage;
  bool isMedical = false;
  bool isAnalyzing = false;
  String? resultTitle;
  String? resultCategory;
  String? doctorSuggestion;
  String? plainSummary;
  String? concern;
  String? safetyNote;
  List<String> findings = [];

  Future<void> pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['txt', 'json', 'pdf', 'png', 'jpg', 'jpeg'],
      allowMultiple: false,
    );

    if (result == null || result.files.isEmpty) {
      return;
    }

    final file = result.files.first;
    setState(() {
      selectedFileName = file.name;
      selectedPath = file.path ?? '';
      analysisMessage = null;
      isMedical = false;
      resultTitle = null;
      resultCategory = null;
      doctorSuggestion = null;
      plainSummary = null;
      concern = null;
      safetyNote = null;
      findings = [];
    });
  }

  Future<void> analyzeReport() async {
    if (selectedPath.isEmpty) {
      setState(() {
        analysisMessage = 'Please upload a report first to analyze it.';
        isMedical = false;
      });
      return;
    }

    setState(() {
      isAnalyzing = true;
      analysisMessage = null;
    });

    final text = await _readFileText(selectedPath, selectedFileName);
    final medical = _isMedicalReport(text, selectedFileName);

    await Future<void>.delayed(const Duration(milliseconds: 500));

    if (!mounted) {
      return;
    }

    setState(() {
      isAnalyzing = false;
      if (!medical) {
        analysisMessage = 'This file does not look like a medical report.';
        isMedical = false;
        resultTitle = 'Not a medical report';
        resultCategory = null;
        doctorSuggestion = null;
        plainSummary = 'We can only explain medical reports. Please upload a medical document.';
        concern = 'This file was not accepted because it does not appear to be medical.';
        safetyNote = 'This demo is for explanation only and not for diagnosis.';
        findings = [];
      } else {
        analysisMessage = null;
        isMedical = true;
        resultTitle = 'Medical report detected';
        resultCategory = 'Complete blood count';
        doctorSuggestion = 'General physician';
        plainSummary = 'This looks like a blood test. It suggests there is no major blood-cell problem.';
        concern = 'This is not a diagnosis. Please discuss any concerns with a doctor.';
        safetyNote = 'Safety note: this demo explains the report in simple language and should not replace medical advice.';
        findings = [
          'Hemoglobin looks normal.',
          'White blood cells are slightly high.',
          'Platelets look normal.'
        ];
      }
    });
  }

  Future<String> _readFileText(String path, String name) async {
    final lower = name.toLowerCase();
    if (lower.endsWith('.txt') || lower.endsWith('.json')) {
      return File(path).readAsString();
    }
    return 'Uploaded file: $name\nFile type: unknown\nThis preview uses the filename and metadata.';
  }

  bool _isMedicalReport(String text, String fileName) {
    final combined = '${text.toLowerCase()} ${fileName.toLowerCase()}';
    final strongTerms = [
      'hemoglobin',
      'platelet',
      'wbc',
      'rbc',
      'cbc',
      'glucose',
      'creatinine',
      'urine',
      'cholesterol'
    ];
    final hasStrongTerm = strongTerms.any(combined.contains);
    final hasReportStructure = RegExp(r'(patient|date|report type|reference range|lab|test|doctor)').hasMatch(combined);
    final hasUnits = RegExp(r'(g/dl|mg/dl|mmhg|bpm|u/l|million/ul|cells/ul|%|ml)').hasMatch(combined);
    return hasStrongTerm && (hasReportStructure || hasUnits);
  }

  void resetFlow() {
    setState(() {
      selectedFileName = 'No file selected';
      selectedPath = '';
      language = 'english';
      analysisMessage = null;
      isMedical = false;
      isAnalyzing = false;
      resultTitle = null;
      resultCategory = null;
      doctorSuggestion = null;
      plainSummary = null;
      concern = null;
      safetyNote = null;
      findings = [];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF07131F), Color(0xFF0E1F33)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 430),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                  color: const Color(0xFF0A1422),
                  elevation: 12,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.add_circle_outline, color: Color(0xFF58D7C2)),
                            SizedBox(width: 10),
                            Text('MedAi', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Text('Upload a report and get a simple explanation', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                        const SizedBox(height: 8),
                        const Text('This Flutter app mirrors the SDK-style flow and adds a reset button for a clean start.', style: TextStyle(color: Color(0xFFA7B7CA))),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: pickFile,
                          icon: const Icon(Icons.upload_file),
                          label: const Text('Pick report file'),
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF58D7C2), foregroundColor: Colors.black),
                        ),
                        const SizedBox(height: 10),
                        Text('Selected file: $selectedFileName', style: const TextStyle(color: Color(0xFFA7B7CA))),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          value: language,
                          decoration: const InputDecoration(labelText: 'Language', labelStyle: TextStyle(color: Color(0xFFA7B7CA))),
                          dropdownColor: const Color(0xFF0F1C2E),
                          items: const [
                            DropdownMenuItem(value: 'english', child: Text('English')),
                            DropdownMenuItem(value: 'hindi', child: Text('Hindi')),
                            DropdownMenuItem(value: 'punjabi', child: Text('Punjabi')),
                          ],
                          onChanged: (value) {
                            if (value != null) {
                              setState(() => language = value);
                            }
                          },
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: isAnalyzing ? null : analyzeReport,
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF58D7C2), foregroundColor: Colors.black),
                                child: isAnalyzing ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Analyze report'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            ElevatedButton(
                              onPressed: resetFlow,
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.white12, foregroundColor: Colors.white),
                              child: const Text('Reset'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (analysisMessage != null)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.redAccent.withOpacity(0.16),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.redAccent.withOpacity(0.35)),
                            ),
                            child: Text(analysisMessage!, style: const TextStyle(color: Color(0xFFFECACA))),
                          ),
                        if (isMedical && resultTitle != null) ...[
                          const SizedBox(height: 16),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white24),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(resultTitle!, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
                                const SizedBox(height: 8),
                                Text(resultCategory ?? '', style: const TextStyle(color: Color(0xFF58D7C2))),
                                const SizedBox(height: 8),
                                Text('Doctor to consult: $doctorSuggestion', style: const TextStyle(color: Color(0xFFA7B7CA))),
                                const SizedBox(height: 12),
                                const Text('What it means', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
                                const SizedBox(height: 6),
                                ...findings.map((item) => Padding(padding: const EdgeInsets.only(bottom: 4), child: Text('• $item', style: const TextStyle(color: Color(0xFFA7B7CA))))),
                                const SizedBox(height: 10),
                                Text(plainSummary ?? '', style: const TextStyle(color: Color(0xFFA7B7CA))),
                                const SizedBox(height: 10),
                                Text(concern ?? '', style: const TextStyle(color: Color(0xFFA7B7CA))),
                                const SizedBox(height: 10),
                                Text(safetyNote ?? '', style: const TextStyle(color: Color(0xFF7C6BFF))),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
