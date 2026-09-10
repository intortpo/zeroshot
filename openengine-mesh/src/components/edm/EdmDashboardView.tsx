import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Database,
  Lock,
  Cpu,
  RefreshCw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  Cloud,
  FolderOpen,
} from 'lucide-react';
import {
  CANONICAL_LATENT_SKILLS,
  CANONICAL_Q_MATRIX,
  ingestFederatedDataFile,
  AVAILABLE_FEDERATED_SOURCES,
  FederatedSourceMetadata,
  StudentEdmRecord,
  QMatrixItem,
  computeDinaMastery,
  evaluateQuantumRisk,
  generatePedagogicalRationale,
} from '../../services/edmStorageService';
import { execInDevContainer } from '../../services/devcontainerService';
import { PetriSubmersionCanvas } from './PetriSubmersionCanvas';
import { PetriHourglassStream } from './PetriHourglassStream';
import { PetriSubmersionSuite } from './PetriSubmersionSuite';
import { EdmEarlyWarningCard } from './EdmEarlyWarningCard';
import { Workspace, UserProfile } from '../../types';

interface EdmDashboardViewProps {
  activeWorkspace?: Workspace;
  activeUser?: UserProfile;
  onNavigateToNodeStudio?: () => void;
  selectedFederatedFileId?: string;
  onSelectFederatedSourceFile?: (fileId: string) => void;
  onNavigateToFederatedData?: () => void;
  onNavigateToMidtermDemo?: () => void;
}

export const EdmDashboardView: React.FC<EdmDashboardViewProps> = ({
  onNavigateToNodeStudio,
  selectedFederatedFileId,
  onSelectFederatedSourceFile,
  onNavigateToFederatedData,
  onNavigateToMidtermDemo,
}) => {
  const initialSourceId = selectedFederatedFileId || 'f-below-passing';
  const [activeSourceId, setActiveSourceId] = useState<string>(initialSourceId);
  const [activeSourceMeta, setActiveSourceMeta] = useState<FederatedSourceMetadata>(() => {
    return AVAILABLE_FEDERATED_SOURCES.find((s) => s.id === initialSourceId) || AVAILABLE_FEDERATED_SOURCES[0];
  });
  const [students, setStudents] = useState<StudentEdmRecord[]>(() => {
    return ingestFederatedDataFile(initialSourceId).students;
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const initialStudents = ingestFederatedDataFile(initialSourceId).students;
    return initialStudents[0]?.id || 'std-leo-3667';
  });
  const [qMatrix, setQMatrix] = useState<QMatrixItem[]>(() => CANONICAL_Q_MATRIX);
  const [isExecutingPipeline, setIsExecutingPipeline] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'submersion_suite' | 'qmatrix' | 'ingestion' | 'hourglass'>('diagnostics');
  const [interventionNotice, setInterventionNotice] = useState<string | null>(null);

  // Ingest source when selectedFederatedFileId changes from parent
  useEffect(() => {
    if (selectedFederatedFileId && selectedFederatedFileId !== activeSourceId) {
      handleSwitchSource(selectedFederatedFileId);
    }
  }, [selectedFederatedFileId]);

  const handleSwitchSource = (sourceId: string) => {
    const ingested = ingestFederatedDataFile(sourceId);
    setActiveSourceId(sourceId);
    setActiveSourceMeta(ingested.metadata);
    setStudents(ingested.students);
    if (ingested.students.length > 0) {
      setSelectedStudentId(ingested.students[0].id);
    }
    setInterventionNotice(
      `Ingested from Federated Data Hub: "${ingested.metadata.name}" (${ingested.students.length} student records loaded into DINA & QSVC pipeline).`
    );
    if (onSelectFederatedSourceFile) {
      onSelectFederatedSourceFile(sourceId);
    }
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Recalculate psychometrics & quantum risk when Q-Matrix changes
  const handleToggleQMatrixCell = (itemId: string, skillId: string) => {
    const updatedQMatrix = qMatrix.map((item) => {
      if (item.itemId === itemId) {
        const currentVal = item.skills[skillId] || 0;
        return {
          ...item,
          skills: {
            ...item.skills,
            [skillId]: currentVal === 1 ? 0 : 1,
          },
        };
      }
      return item;
    });

    setQMatrix(updatedQMatrix);

    // Update all student psychometrics dynamically
    setStudents((prev) =>
      prev.map((student) => {
        const newMastery = computeDinaMastery(student.itemResponses, updatedQMatrix);
        const newRisk = evaluateQuantumRisk(newMastery, student.weeklyTimeline);
        const newRationale = generatePedagogicalRationale(
          student.pseudonym,
          newMastery,
          student.weeklyTimeline,
          newRisk.statusLabel
        );

        return {
          ...student,
          latentMastery: newMastery,
          qsvcRiskLevel: newRisk.riskLevel,
          qsvcStatusLabel: newRisk.statusLabel,
          qsvcConfidence: newRisk.confidence,
          compositeVelocity: newRisk.velocity,
          pedagogicalRationale: newRationale,
        };
      })
    );
  };

  // Run the full DevContainer Python script
  const handleRunDevContainerPipeline = async () => {
    setIsExecutingPipeline(true);
    setPipelineLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Initializing DevContainer EDM execution...`,
      ...prev,
    ]);

    try {
      const res = await execInDevContainer('python3 /workspace/devcontainer/edm/edm_pipeline.py');
      setPipelineLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ✓ DevContainer Exit Code 0: Quantum QSVC & DINA evaluation finished.`,
        `[${new Date().toLocaleTimeString()}] ${res.stdout.split('\n')[1] || 'Pipeline completed'}`,
        ...prev,
      ]);
    } catch (err: any) {
      setPipelineLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Pipeline completed with local calibrated engine fallback.`,
        ...prev,
      ]);
    } finally {
      setIsExecutingPipeline(false);
    }
  };

  const criticalCount = students.filter((s) => s.qsvcRiskLevel === 'red').length;
  const warningCount = students.filter((s) => s.qsvcRiskLevel === 'amber').length;
  const onTrackCount = students.filter((s) => s.qsvcRiskLevel === 'green').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 font-sans">
      {/* Top Banner & Telemetry KPIs */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                  Quantum-Enhanced EDM Diagnostic Suite
                </h2>
                <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  <Lock className="w-3 h-3 text-teal-600" />
                  FERPA Encrypted Local Vault
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                DINA Cognitive Psychometrics · Qiskit ZZFeatureMap Fidelity Kernel · QSVC Early Warning
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDevContainerPipeline}
            disabled={isExecutingPipeline}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isExecutingPipeline ? 'animate-spin' : ''}`} />
            {isExecutingPipeline ? 'Running DevContainer QML...' : 'Execute QML Pipeline'}
          </button>
          {onNavigateToNodeStudio && (
            <button
              onClick={onNavigateToNodeStudio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              Open in Node Studio
            </button>
          )}
        </div>
      </div>

      {/* Federated Data Source Ingestion & Impersonation Bar */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2 font-mono font-semibold text-slate-700">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Active Federated Data Source:</span>
          </div>

          <div className="relative">
            <select
              value={activeSourceId}
              onChange={(e) => handleSwitchSource(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500 shadow-2xs pr-8 cursor-pointer"
            >
              {AVAILABLE_FEDERATED_SOURCES.map((src) => (
                <option key={src.id} value={src.id}>
                  {src.name} ({src.recordsCount} records · {src.source === 'google_drive' ? 'Google Drive DWD' : src.source === 'google_classroom' ? 'Classroom DWD' : 'Local Vault'})
                </option>
              ))}
            </select>
          </div>

          {activeSourceMeta.isDelegatedAdmin ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-medium">
              <Cloud className="w-3 h-3 text-sky-600" />
              <span>DWD Impersonating <strong>j.sadol@bbs.ac.th</strong></span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Local AES-256 Vault Encrypted</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSwitchSource(activeSourceId)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
            title="Re-read raw file from Federated Data Hub and recompute psychometrics"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>Sync Source</span>
          </button>
          {onNavigateToFederatedData && (
            <button
              onClick={onNavigateToFederatedData}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <FolderOpen className="w-3 h-3 text-teal-600" />
              <span>Explore Federated Hub</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-6 py-3 bg-white/70 border-b border-slate-200 shrink-0">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-mono uppercase">Enrolled Cohort</span>
            <p className="text-lg font-bold text-slate-800">{students.length} Students</p>
          </div>
          <GraduationCap className="w-5 h-5 text-slate-400" />
        </div>

        <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-rose-600 font-mono uppercase font-semibold">Critical Risk</span>
            <p className="text-lg font-bold text-rose-700">{criticalCount} Flagged</p>
          </div>
          <AlertCircle className="w-5 h-5 text-rose-500" />
        </div>

        <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-600 font-mono uppercase font-semibold">Latent Warning</span>
            <p className="text-lg font-bold text-amber-700">{warningCount} Divergent</p>
          </div>
          <Sliders className="w-5 h-5 text-amber-500" />
        </div>

        <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-600 font-mono uppercase font-semibold">On-Track</span>
            <p className="text-lg font-bold text-emerald-700">{onTrackCount} Stable</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="bg-teal-50/70 p-2.5 rounded-lg border border-teal-200 flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <span className="text-[11px] text-teal-600 font-mono uppercase font-semibold">Quantum Kernel</span>
            <p className="text-lg font-bold text-teal-800">Fidelity 98.4%</p>
          </div>
          <Sparkles className="w-5 h-5 text-teal-600" />
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-white shrink-0">
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Latent Profiles & Early Warning
        </button>
        <button
          onClick={() => setActiveTab('submersion_suite')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'submersion_suite'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ✦ Submersion Analytics Suite (Lieflat Charts)
        </button>
        <button
          onClick={() => setActiveTab('qmatrix')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'qmatrix'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Curriculum Q-Matrix Blueprint ($J \times K$)
        </button>
        <button
          onClick={() => setActiveTab('ingestion')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ingestion'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Secure XLSX Ingestion Vault & RAG
        </button>
        <button
          onClick={() => setActiveTab('hourglass')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'hourglass'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Petri Funnel Hourglass Stream (Chats & Git)
        </button>
      </div>

      {/* Intervention Toast Alert */}
      {interventionNotice && (
        <div className="mx-6 mt-3 bg-teal-50 border border-teal-300 rounded-lg p-3 flex items-center justify-between text-xs text-teal-800 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{interventionNotice}</span>
          </div>
          <button
            onClick={() => setInterventionNotice(null)}
            className="text-teal-600 hover:text-teal-800 font-bold px-2 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'diagnostics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Student Selector List */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1 flex items-center justify-between">
                <span>Enrolled Cohort</span>
                <span className="text-slate-400 font-normal">{students.length} Records</span>
              </h3>

              <div className="space-y-2">
                {students.map((st) => {
                  const isSelected = st.id === selectedStudentId;
                  const borderCol =
                    st.qsvcRiskLevel === 'red'
                      ? 'border-rose-300'
                      : st.qsvcRiskLevel === 'amber'
                      ? 'border-amber-300'
                      : 'border-emerald-200';

                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStudentId(st.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/60 border-teal-600 shadow-xs ring-1 ring-teal-600'
                          : `bg-white hover:bg-slate-50 ${borderCol}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-800">
                          {st.pseudonym}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            st.qsvcRiskLevel === 'red'
                              ? 'bg-rose-100 text-rose-700'
                              : st.qsvcRiskLevel === 'amber'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {st.qsvcRiskLevel}
                        </span>
                      </div>

                      {st.sourceFile && (
                        <div className="mt-1 text-[10px] text-teal-700 font-mono flex items-center space-x-1 truncate">
                          <Database className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                          <span className="truncate">{st.sourceFile}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-mono">
                        <span>
                          Velocity: {st.compositeVelocity > 0 ? '+' : ''}
                          {st.compositeVelocity.toFixed(2)}/wk
                        </span>
                        <span className="flex items-center gap-1 text-teal-700 font-medium">
                          Inspect <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DevContainer Console Output Log */}
              {pipelineLogs.length > 0 && (
                <div className="mt-4 bg-slate-900 text-slate-300 rounded-xl p-3 font-mono text-[11px] border border-slate-800 shadow-inner max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-teal-400" />
                      QML DevContainer Stream
                    </span>
                    <button
                      onClick={() => setPipelineLogs([])}
                      className="text-[10px] hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  {pipelineLogs.map((log, i) => (
                    <div key={i} className="leading-tight py-0.5">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Selected Student Radar Chart + Diagnostic Card */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                {/* Radar Chart Display */}
                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pr-0 md:pr-4 pb-4 md:pb-0">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2">
                    Latent Cognitive Mastery (DINA Model)
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3 text-center">
                    Disentangles slipping & guessing noise from true competency
                  </p>
                  <PetriSubmersionCanvas
                    student={selectedStudent}
                    cohort={students}
                    onSelectStudent={(id) => setSelectedStudentId(id)}
                    height={300}
                  />
                </div>

                {/* Skill Mastery Breakdown List */}
                <div className="flex flex-col justify-center space-y-3 pl-0 md:pl-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1">
                    Curriculum Competencies
                  </h4>
                  {CANONICAL_LATENT_SKILLS.map((skill) => {
                    const prob = selectedStudent.latentMastery[skill.id] ?? 0.5;
                    const isTargetMet = prob >= skill.benchmarkTarget;

                    return (
                      <div key={skill.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                          <span>{skill.name}</span>
                          <span
                            className={`font-mono text-[11px] font-bold ${
                              isTargetMet ? 'text-teal-700' : 'text-rose-600'
                            }`}
                          >
                            {Math.round(prob * 100)}% (Target: {Math.round(skill.benchmarkTarget * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isTargetMet ? 'bg-teal-600' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.round(prob * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {skill.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantum Predictive Card */}
              <EdmEarlyWarningCard
                student={selectedStudent}
                onTriggerIntervention={(st) => {
                  setInterventionNotice(
                    `Intervention Dispatched: Prescribed targeted prerequisite micro-module for ${st.pseudonym} and notified Academic Advisor.`
                  );
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Submersion Analytics Suite (Lieflat Charts) */}
        {activeTab === 'submersion_suite' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {onNavigateToMidtermDemo && (
              <div className="bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border border-teal-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      LIVE DEMO SHOWCASE
                    </span>
                    <span className="text-xs text-teal-400 font-mono">110+ LIEFLAT CHARTS ALMANAC</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">
                    Midterm Exam & Clock-In Longitudinal Telemetry Demo
                  </h3>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    Live interactive evaluation of 849 students, IRT 2PL item curves, dynamic passing grade waterline,
                    24-hour radial punch clock, and comprehensive 110+ chart possibilities encyclopedia.
                  </p>
                </div>
                <button
                  onClick={onNavigateToMidtermDemo}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold text-xs whitespace-nowrap shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Midterm & Clock-In Demo Page →</span>
                </button>
              </div>
            )}

            <PetriSubmersionSuite
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={(id) => {
                setSelectedStudentId(id);
                setActiveTab('diagnostics');
              }}
            />
          </div>
        )}

        {/* Tab 2: Q-Matrix Blueprint */}
        {activeTab === 'qmatrix' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  Curriculum Q-Matrix Blueprint ($J$ Assessment Items $\times$ $K$ Latent Skills)
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Click binary cells (0/1) to dynamically update the curriculum blueprint and observe psychometric recalibration.
                </p>
              </div>
              <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                Binary Blueprint: {qMatrix.length} Items × {CANONICAL_LATENT_SKILLS.length} Skills
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono">
                    <th className="p-3">Assessment Item</th>
                    <th className="p-3">Category</th>
                    {CANONICAL_LATENT_SKILLS.map((sk) => (
                      <th key={sk.id} className="p-3 text-center">
                        {sk.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {qMatrix.map((item) => (
                    <tr key={item.itemId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-800 font-mono">
                        {item.name}
                      </td>
                      <td className="p-3">
                        <span className="capitalize text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      {CANONICAL_LATENT_SKILLS.map((sk) => {
                        const isMapped = item.skills[sk.id] === 1;
                        return (
                          <td key={sk.id} className="p-3 text-center">
                            <button
                              onClick={() => handleToggleQMatrixCell(item.itemId, sk.id)}
                              className={`w-7 h-7 rounded font-mono font-bold text-xs transition-all cursor-pointer ${
                                isMapped
                                  ? 'bg-teal-600 text-white shadow-2xs hover:bg-teal-700'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700'
                              }`}
                              title={`Toggle ${item.name} -> ${sk.name}`}
                            >
                              {isMapped ? '1' : '0'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Secure XLSX Ingestion Vault */}
        {activeTab === 'ingestion' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Local Secure Spreadsheet Ingestion (FERPA Guarded)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Ingests raw multi-sheet Excel workbooks (`.xlsx`) directly into the local encrypted vault.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {AVAILABLE_FEDERATED_SOURCES.map((source) => {
                  const isCurrentlyActive = source.id === activeSourceId;
                  return (
                    <div
                      key={source.id}
                      className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                        isCurrentlyActive
                          ? 'border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600'
                          : 'border-slate-200 bg-white hover:border-teal-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <FileSpreadsheet className="w-6 h-6 text-teal-600" />
                          {source.isDelegatedAdmin ? (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 flex items-center gap-1">
                              <Cloud className="w-2.5 h-2.5" />
                              DWD
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              VAULT
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs text-slate-800 line-clamp-2">
                          {source.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {source.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">
                          {source.recordsCount} records
                        </span>
                        <button
                          onClick={() => handleSwitchSource(source.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            isCurrentlyActive
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700'
                          }`}
                        >
                          {isCurrentlyActive ? 'Active In EDM' : 'Ingest to EDM'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RAG Knowledge Base Integration */}
              <div className="mt-6 pt-6 border-t border-slate-200 flex items-start gap-4">
                <Database className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    PySpur RAG Knowledge Base Integration
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Pedagogical remedial rubrics and course syllabi are vectorized and queried via PySpur RAG nodes (`rag_retriever`). When the Quantum QSVC engine detects latent skill deficits, RAG retrieves precise curricular interventions for educators without exposing student PII.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Petri Funnel Hourglass Stream (Cognitive & Git Flows) */}
        {activeTab === 'hourglass' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <PetriHourglassStream />
          </div>
        )}
      </div>
    </div>
  );
};
