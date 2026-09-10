import { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught subsystem fault:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'SUBSYSTEM ISOLATION BOUNDARY';
      return (
        <div className="flex-1 w-full h-full min-h-[420px] flex items-center justify-center p-6 bg-[#F6F3EC] text-[#1A1D1A] font-mono select-none">
          <div className="w-full max-w-xl border border-[#1A1D1A] bg-[#FAF8F3] p-6 shadow-[3px_3px_0px_#1A1D1A] relative">
            {/* 1960s Technical Header Plaque */}
            <div className="flex items-center justify-between border-b border-[#1A1D1A] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#1A1D1A]" strokeWidth={1.5} />
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  {title}
                </span>
              </div>
              <span className="text-[9px] border border-[#1A1D1A] px-2 py-0.5 tracking-wider bg-[#EDE8DC]">
                STATUS: FAULT CONTAINED
              </span>
            </div>

            {/* Wireframe Diagram Box */}
            <div className="relative border border-dashed border-[#1A1D1A]/40 p-4 mb-4 bg-[#F2EFE9] text-center">
              <svg
                viewBox="0 0 240 60"
                className="w-full h-14 mx-auto stroke-[#1A1D1A] fill-none"
                strokeWidth="1"
              >
                {/* 1960s Technical schematic circuit breaker */}
                <line x1="20" y1="30" x2="70" y2="30" />
                <rect x="70" y="20" width="30" height="20" strokeDasharray="2,2" />
                <line x1="100" y1="30" x2="130" y2="15" />
                <circle cx="100" cy="30" r="2.5" fill="#1A1D1A" />
                <circle cx="140" cy="30" r="2.5" fill="#1A1D1A" />
                <line x1="140" y1="30" x2="190" y2="30" />
                <rect x="190" y="20" width="30" height="20" />
                <text x="73" y="34" fontSize="7" fill="#1A1D1A" fontFamily="monospace">ISO</text>
                <text x="193" y="34" fontSize="7" fill="#1A1D1A" fontFamily="monospace">GATE</text>
              </svg>
              <div className="text-[10px] tracking-wider text-[#1A1D1A]/80 uppercase mt-1">
                EXECUTION SUSPENDED · REVERSIBLE STATE PRESERVED
              </div>
            </div>

            {/* Fault Diagnostic Readout */}
            <div className="space-y-2 mb-5">
              <div className="text-[10px] uppercase font-bold text-[#1A1D1A]/70">
                Diagnostic Trace:
              </div>
              <div className="p-3 bg-white border border-[#1A1D1A] text-[11px] font-mono text-[#8B0000] overflow-x-auto whitespace-pre-wrap max-h-36">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unexpected subsystem halt'}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1A1D1A]">
              <span className="text-[9px] text-[#1A1D1A]/60">
                PETRI-CORE V8 · CALIBRATION SPEC 1964-B
              </span>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 border border-[#1A1D1A] bg-[#EDE8DC] hover:bg-[#1A1D1A] hover:text-[#FAF8F3] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-[2px_2px_0px_#1A1D1A]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Engage Subsystem</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
