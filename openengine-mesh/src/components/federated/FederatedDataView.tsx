import React, { useState, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Presentation,
  Cloud,
  Lock,
  Search,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  ChevronRight,
  Database,
} from 'lucide-react';
import { documentRag, RagAnswerResponse } from '../../services/documentRagService';
import { googleClassroom } from '../../services/googleClassroomService';

interface FederatedFileItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'slide' | 'sheet';
  size: string;
  encrypted: boolean;
  term: string;
  updatedAt: string;
  tags: string[];
  snippet?: string;
  source: 'local_vault' | 'google_drive' | 'google_classroom';
}

export const FederatedDataView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'media' | 'slides' | 'google' | 'rag'>('all');
  const [activeTerm, setActiveTerm] = useState<string>('AY2026 Sem 1');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Google Classroom Filter State
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // RAG Query State
  const [ragQuery, setRagQuery] = useState('Which students failed Mandarin in Grade 1 Section 2?');
  const [ragResponse, setRagResponse] = useState<RagAnswerResponse | null>(null);
  const [isQueryingRag, setIsQueryingRag] = useState(false);

  // Initial Federated Files
  const [files] = useState<FederatedFileItem[]>([
    {
      id: 'f-midterms',
      name: 'Midterms 1-2026.xlsx',
      type: 'sheet',
      size: '852 KB',
      encrypted: true,
      term: 'AY2026 Sem 1',
      updatedAt: '2026-05-20',
      tags: ['midterms', 'grades', 'curriculum'],
      source: 'local_vault',
      snippet: '849 student records across 16 core curriculum subjects with DINA Q-Matrix mapping.',
    },
    {
      id: 'f-below-passing',
      name: '2026 Summary of Students with Below Passing Marks.xlsx',
      type: 'sheet',
      size: '412 KB',
      encrypted: true,
      term: 'AY2026 Sem 1',
      updatedAt: '2026-05-22',
      tags: ['remediation', 'at_risk', 'fails'],
      source: 'local_vault',
      snippet: '324 student below-passing failure records including Leo (#3667) and Star (#3068).',
    },
    {
      id: 'f-att-w1',
      name: 'Check In&Out Record 18-22 May 2026 Admin Report.xlsx',
      type: 'sheet',
      size: '640 KB',
      encrypted: true,
      term: 'AY2026 Sem 1',
      updatedAt: '2026-05-23',
      tags: ['attendance', 'w1', 'punctuality'],
      source: 'local_vault',
      snippet: '838 students tracked across 37 grade sections with arrival timestamps.',
    },
    {
      id: 'f-att-w2',
      name: 'Check In&Out Record 25-29 May 2026 Raw Data.xlsx',
      type: 'sheet',
      size: '720 KB',
      encrypted: true,
      term: 'AY2026 Sem 1',
      updatedAt: '2026-05-30',
      tags: ['attendance', 'w2', 'velocity'],
      source: 'local_vault',
      snippet: '836 students tracked for longitudinal velocity and momentum drift analysis.',
    },
    {
      id: 'f-sem2-blueprint',
      name: 'AY2026 Semester 2 Strategic Remediation Plan.pdf',
      type: 'document',
      size: '1.2 MB',
      encrypted: true,
      term: 'AY2026 Sem 2',
      updatedAt: '2026-09-08',
      tags: ['sem2', 'quantum_weights', 'strategy'],
      source: 'local_vault',
      snippet: 'Staged framework deploying quantum-recalibrated boundary weights for Sem 2.',
    },
    {
      id: 'f-curriculum-slides',
      name: 'Grade 1-3 Bilingual Curriculum Framework.pptx',
      type: 'slide',
      size: '4.8 MB',
      encrypted: true,
      term: 'AY2026 Sem 1',
      updatedAt: '2026-05-15',
      tags: ['slides', 'pedagogy', 'bilingual'],
      source: 'google_drive',
      snippet: 'English, Mandarin, and Integrated Mathematics competency progression standards.',
    },
    {
      id: 'f-campus-overview',
      name: 'BBS Primary Campus Learning Lab.mp4',
      type: 'video',
      size: '18.4 MB',
      encrypted: true,
      term: 'AY2026 Sem 1',
      updatedAt: '2026-05-10',
      tags: ['video', 'campus', 'lab'],
      source: 'google_drive',
      snippet: 'Encrypted operational recording of Primary STEM lab learning sessions.',
    },
    {
      id: 'f-dina-qmatrix-diagram',
      name: 'DINA Cognitive Diagnosis Q-Matrix Architecture.png',
      type: 'image',
      size: '940 KB',
      encrypted: true,
      term: 'AY2026 Sem 1',
      updatedAt: '2026-05-18',
      tags: ['image', 'architecture', 'dina'],
      source: 'local_vault',
      snippet: 'Latent skills projection diagram: Vocabulary, Syntax, Reading, and Synthesis.',
    },
  ]);

  const classroomScores = useMemo(() => {
    return googleClassroom.searchStudentScores({
      grade: selectedGrade,
      section: selectedSection,
      name: studentSearch,
      term: activeTerm,
    });
  }, [selectedGrade, selectedSection, studentSearch, activeTerm]);

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchTerm = f.term === activeTerm;
      const matchSearch =
        searchQuery.trim() === '' ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchTab =
        activeTab === 'all' ||
        (activeTab === 'documents' && (f.type === 'document' || f.type === 'sheet')) ||
        (activeTab === 'media' && (f.type === 'image' || f.type === 'video')) ||
        (activeTab === 'slides' && f.type === 'slide') ||
        (activeTab === 'google' && f.source === 'google_drive');

      return matchTerm && matchSearch && matchTab;
    });
  }, [files, activeTerm, searchQuery, activeTab]);

  const handleRunRagQuery = () => {
    if (!ragQuery.trim()) return;
    setIsQueryingRag(true);
    setTimeout(() => {
      const result = documentRag.queryRag(ragQuery);
      setRagResponse(result);
      setIsQueryingRag(false);
    }, 250);
  };

  const handleCreateSem2 = () => {
    if (activeTerm === 'AY2026 Sem 2') return;
    setActiveTerm('AY2026 Sem 2');
    documentRag.setActiveTerm('AY2026 Sem 2');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] text-stone-900 overflow-hidden font-sans">
      {/* Top Header: Title, Encryption Badge & Academic Term Switcher */}
      <div className="bg-white/90 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center space-x-2">
                <span>Federated Data Hub</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  AES-256 Encrypted
                </span>
              </h1>
              <p className="text-xs text-stone-500">
                Explore saved docs, images, videos, slides, and Company Google Drive with Full File Doc RAG.
              </p>
            </div>
          </div>
        </div>

        {/* Academic Term & Semester Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-semibold text-stone-500 uppercase tracking-wider">
            Academic Term:
          </span>
          <div className="inline-flex rounded-xl border border-stone-200 bg-stone-100/70 p-1">
            <button
              onClick={() => {
                setActiveTerm('AY2026 Sem 1');
                documentRag.setActiveTerm('AY2026 Sem 1');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTerm === 'AY2026 Sem 1'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              AY2026 · Sem 1
            </button>

            <button
              onClick={() => {
                setActiveTerm('AY2026 Sem 2');
                documentRag.setActiveTerm('AY2026 Sem 2');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTerm === 'AY2026 Sem 2'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              AY2026 · Sem 2
            </button>
          </div>

          {activeTerm !== 'AY2026 Sem 2' && (
            <button
              onClick={handleCreateSem2}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-all flex items-center space-x-1"
              title="Initialize and stage Academic Year 2026 Semester 2"
            >
              <span>+ Create Sem 2</span>
            </button>
          )}
        </div>
      </div>

      {/* Security & Google DWD Status Banner */}
      <div className="bg-white border-b border-stone-100 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted At Rest: AES-256-GCM authenticated storage</span>
          </div>
          <span className="text-stone-300">|</span>
          <div className="flex items-center space-x-1.5 text-stone-600">
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>Google DWD Active: <strong>bbs-momentum@appspot.gserviceaccount.com</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[11px] text-stone-500">
          <span>Active Term: <strong className="text-stone-800">{activeTerm}</strong></span>
          <span>·</span>
          <span>Indexed RAG Documents: <strong>{documentRag.getAllDocuments().length}</strong></span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border-b border-stone-200 px-6 flex items-center space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 border-b-2 font-medium transition-all ${
            activeTab === 'all'
              ? 'border-teal-600 text-teal-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          All Files ({filteredFiles.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`py-3 border-b-2 font-medium transition-all ${
            activeTab === 'documents'
              ? 'border-teal-600 text-teal-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Documents & Sheets
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`py-3 border-b-2 font-medium transition-all ${
            activeTab === 'media'
              ? 'border-teal-600 text-teal-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Images & Videos
        </button>

        <button
          onClick={() => setActiveTab('slides')}
          className={`py-3 border-b-2 font-medium transition-all ${
            activeTab === 'slides'
              ? 'border-teal-600 text-teal-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Slides & Presentations
        </button>

        <button
          onClick={() => setActiveTab('google')}
          className={`py-3 border-b-2 font-medium transition-all flex items-center space-x-1.5 ${
            activeTab === 'google'
              ? 'border-sky-600 text-sky-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Cloud className="w-4 h-4 text-sky-600" />
          <span>Google Drive & Classroom</span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`py-3 border-b-2 font-medium transition-all flex items-center space-x-1.5 ${
            activeTab === 'rag'
              ? 'border-indigo-600 text-indigo-900 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Full File Doc RAG</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1, 2, 3, 4: Files, Media, Slides */}
        {(activeTab === 'all' || activeTab === 'documents' || activeTab === 'media' || activeTab === 'slides') && (
          <div className="space-y-4">
            {/* Search Filter Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search federated files by name or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('rag')}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Doc RAG</span>
                </button>
              </div>
            </div>

            {/* Grid of Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                          {file.type === 'sheet' && <Database className="w-4 h-4 text-emerald-600" />}
                          {file.type === 'document' && <FileText className="w-4 h-4 text-blue-600" />}
                          {file.type === 'image' && <ImageIcon className="w-4 h-4 text-amber-600" />}
                          {file.type === 'video' && <Video className="w-4 h-4 text-rose-600" />}
                          {file.type === 'slide' && <Presentation className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-stone-900 group-hover:text-teal-900 transition-colors line-clamp-1">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {file.size} · {file.updatedAt}
                          </div>
                        </div>
                      </div>

                      <span className="p-1 rounded-md bg-stone-50 border border-stone-100 text-stone-400" title="Encrypted at Rest with AES-256-GCM">
                        <Lock className="w-3 h-3 text-emerald-600" />
                      </span>
                    </div>

                    {file.snippet && (
                      <p className="text-[11px] text-stone-600 line-clamp-2 my-2 leading-relaxed">
                        {file.snippet}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {file.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-mono text-[9px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-3 mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400 font-mono">{file.source.replace('_', ' ')}</span>
                    <button
                      onClick={() => {
                        setRagQuery(`What information is in ${file.name}?`);
                        setActiveTab('rag');
                        handleRunRagQuery();
                      }}
                      className="text-teal-700 hover:text-teal-900 font-medium flex items-center space-x-1"
                    >
                      <span>Query in RAG</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Google Drive & Google Classroom Scores Explorer */}
        {activeTab === 'google' && (
          <div className="space-y-6">
            {/* Google Classroom Live Filter & Scores Explorer */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-sky-600" />
                  <div>
                    <h2 className="text-sm font-bold text-stone-900">Google Classroom Scores Explorer</h2>
                    <p className="text-xs text-stone-500">
                      Query real-time Google Classroom scores for any student by Grade, Section, or Name using DWD key.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DWD Key Verified: bbs-momentum-e0d7efc9c9e5.json</span>
                </div>
              </div>

              {/* Filter Controls: Grade, Section, Student Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1 uppercase font-mono">
                    Grade Filter
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
                  >
                    <option value="all">All Grades</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 9">Grade 9 (IGCSE)</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1 uppercase font-mono">
                    Section Filter
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
                  >
                    <option value="all">All Sections</option>
                    <option value="G1.1">G 1-1 / G1.1</option>
                    <option value="G1.2">G 1-2 / G1.2</option>
                    <option value="G9-2">G 9-2 / G9-2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1 uppercase font-mono">
                    Student Search (Name / ID)
                  </label>
                  <input
                    type="text"
                    placeholder="Search Leo, Star, Fairy, Alice, 3667..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Classroom Scores Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden mt-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-mono">
                      <th className="py-2.5 px-4">Student ID & Name</th>
                      <th className="py-2.5 px-4">Class</th>
                      <th className="py-2.5 px-4">Course</th>
                      <th className="py-2.5 px-4">Classroom Assignment</th>
                      <th className="py-2.5 px-4">Points Earned</th>
                      <th className="py-2.5 px-4">Score (%)</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {classroomScores.map((row, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-stone-900">
                          <div>{row.studentName}</div>
                          <div className="text-[10px] text-stone-400 font-mono">ID: {row.studentId}</div>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-stone-600">{row.section}</td>
                        <td className="py-2.5 px-4 text-stone-700">{row.courseName}</td>
                        <td className="py-2.5 px-4 text-stone-800">{row.assignmentTitle}</td>
                        <td className="py-2.5 px-4 font-mono font-medium text-stone-800">
                          {row.assignedPoints} / {row.maxPoints}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold">
                          <span
                            className={
                              row.percentage < 50
                                ? 'text-red-600'
                                : row.percentage < 70
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }
                          >
                            {row.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            {row.state}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {classroomScores.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-stone-400">
                          No Google Classroom records found matching the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Full File Document RAG Query Interface */}
        {activeTab === 'rag' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Full File Document RAG Query Engine</h2>
                  <p className="text-xs text-stone-500">
                    Ask questions across all indexed school datasets, midterms, attendance logs, and curriculum documents.
                  </p>
                </div>
              </div>

              {/* RAG Query Input */}
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunRagQuery()}
                  placeholder="Ask any question across curriculum files (e.g. Which students failed Mandarin in G1.2?)..."
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleRunRagQuery}
                  disabled={isQueryingRag}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  {isQueryingRag ? <span>Retrieving...</span> : <span>Ask RAG</span>}
                </button>
              </div>

              {/* Quick Sample Queries */}
              <div className="flex flex-wrap gap-2 text-[11px] text-stone-500">
                <span className="font-mono uppercase text-[10px] font-semibold text-stone-400 py-1">Try asking:</span>
                <button
                  onClick={() => {
                    setRagQuery('Which students failed Mandarin in Grade 1 Section 2?');
                    handleRunRagQuery();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  "Which students failed Mandarin in Grade 1 Section 2?"
                </button>
                <button
                  onClick={() => {
                    setRagQuery('What was the late attendance threshold for May 2026?');
                    handleRunRagQuery();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  "What was the late attendance threshold for May 2026?"
                </button>
                <button
                  onClick={() => {
                    setRagQuery('What are the key objectives for AY2026 Semester 2?');
                    handleRunRagQuery();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                >
                  "What are the key objectives for AY2026 Semester 2?"
                </button>
              </div>

              {/* RAG Answer Output */}
              {ragResponse && (
                <div className="mt-6 border-t border-stone-100 pt-5 space-y-4 animate-in fade-in duration-200">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-950 mb-2">
                      <span className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Synthesized RAG Answer</span>
                      </span>
                      <span className="font-mono text-[10px] text-indigo-700">
                        Retrieved in {ragResponse.executionTimeMs}ms
                      </span>
                    </div>
                    <p className="text-xs text-stone-800 whitespace-pre-line leading-relaxed font-sans">
                      {ragResponse.answer}
                    </p>
                  </div>

                  {/* Sources & Verified Citations */}
                  <div>
                    <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono mb-2">
                      Verified Document Citations ({ragResponse.sources.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {ragResponse.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-stone-200 rounded-xl p-3 shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-900 truncate">
                              {src.documentTitle}
                            </span>
                            <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {src.score}% match
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            Section: {src.section}
                          </div>
                          <p className="text-[11px] text-stone-600 line-clamp-3 italic">
                            "{src.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
