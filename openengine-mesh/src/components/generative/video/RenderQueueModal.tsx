import React, { useState } from 'react';
import {
  X,
  Clapperboard,
  Download,
  CheckCircle2,
  Clock,
  Loader2,
  Film,
  Sparkles,
} from 'lucide-react';
import {
  RenderJob,
  ExportFormat,
  AspectRatio,
  generateAndDownloadVideo,
} from '../../../services/hyperframeVideoService';

interface RenderQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: RenderJob[];
  onSubmitRender: (
    title: string,
    resolution: RenderJob['resolution'],
    format: ExportFormat,
    aspectRatio: AspectRatio
  ) => void;
  scenesCount: number;
  totalDuration: number;
}

export const RenderQueueModal: React.FC<RenderQueueModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onSubmitRender,
  scenesCount,
  totalDuration,
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [resolution, setResolution] = useState<RenderJob['resolution']>('4K Cinema');
  const [format, setFormat] = useState<ExportFormat>('prores-422');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartRender = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRender(
      jobTitle || `Petri Sequence (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      resolution,
      format,
      aspectRatio
    );
    setJobTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Cloud Batch Render Queue & Multi-Resolution Exporter
              </h3>
              <p className="text-xs text-slate-400">
                Dispatch background cinematic rendering jobs across distributed GPU worker nodes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Dispatch New Render Form */}
          <form onSubmit={handleStartRender} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Configure New Render Job ({scenesCount} Scenes • {totalDuration.toFixed(1)}s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Job Title */}
              <div className="lg:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Submersion Cinematic Trailer (Final Cut)"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Resolution Preset */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Resolution Preset</label>
                <select
                  value={resolution}
                  onChange={e => setResolution(e.target.value as RenderJob['resolution'])}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-teal-300 font-mono focus:outline-none"
                >
                  <option value="4K Cinema">4K UHD (3840x2160)</option>
                  <option value="1080p 60fps">Full HD (1920x1080 60p)</option>
                  <option value="9:16 Reel/Shorts">9:16 Reel (1080x1920)</option>
                  <option value="1:1 Square">1:1 Square (1080x1080)</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={e => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-teal-300 font-mono focus:outline-none"
                >
                  <option value="16:9">16:9 Widescreen</option>
                  <option value="9:16">9:16 Vertical</option>
                  <option value="1:1">1:1 Square</option>
                  <option value="2.39:1">2.39:1 Anamorphic</option>
                </select>
              </div>

              {/* Format / Codec */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Export Format</label>
                <select
                  value={format}
                  onChange={e => setFormat(e.target.value as ExportFormat)}
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-teal-300 font-mono focus:outline-none"
                >
                  <option value="prores-422">Apple ProRes 422 HQ</option>
                  <option value="mp4-h264">MP4 (H.264 Universal)</option>
                  <option value="webm-alpha">WebM (VP9 + Alpha)</option>
                  <option value="animated-gif">High-Res Animated GIF</option>
                  <option value="png-sequence">PNG Frame Sequence (.zip)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20"
              >
                <Film className="w-4 h-4" />
                Dispatch Cloud Batch Render
              </button>
            </div>
          </form>

          {/* Job Queue Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Active & Completed Render Jobs ({jobs.length})
              </h4>
            </div>

            <div className="space-y-3">
              {jobs.map(job => {
                const isDone = job.status === 'completed';
                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-[240px]">
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        <img src={job.thumbnailUrl} alt={job.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">{job.title}</h5>
                        <p className="text-xs text-slate-400 font-mono">
                          {job.resolution} • {job.format} • {job.durationTotal.toFixed(1)}s • {job.createdAt}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Stage Status */}
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                          ) : (
                            <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                          )}
                          {job.currentStageText}
                        </span>
                        <span className="font-mono text-teal-300">{job.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${job.progress}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDone ? 'bg-teal-400' : 'bg-gradient-to-r from-teal-500 to-cyan-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Download / Action */}
                    <div>
                      {isDone ? (
                        <button
                          onClick={() => {
                            setDownloadingJobId(job.id);
                            generateAndDownloadVideo(job.title, job.durationTotal, job.format).finally(() => {
                              setTimeout(() => setDownloadingJobId(null), 1000);
                            });
                          }}
                          disabled={downloadingJobId === job.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {downloadingJobId === job.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>{downloadingJobId === job.id ? 'Exporting...' : 'Download Video'}</span>
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Rendering
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
          <span>Worker Protocol: openengine-cluster-v1 (Accelerated GPU Node)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
