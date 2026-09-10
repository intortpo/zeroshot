/**
 * Layer 1: Time-Series Normalization Protocol
 * Converts raw points, quiz answers, and daily attendance logs into strictly 0.0 - 1.0 floats.
 * Calculates weekly behavioral velocity: v_t = x_t - x_{t-1}.
 */

export interface RawStudentWeeklyLog {
  week: number;
  attendedDays: number;
  totalDays: number;
  hoursLate: number;
  homeworkPoints: number;
  homeworkMaxPoints: number;
}

export interface NormalizedStudentFrame {
  week: number;
  normAttendance: number; // 0.0 - 1.0
  normTimeliness: number; // 0.0 - 1.0
  normHomework: number;   // 0.0 - 1.0
  velocityAttendance: number; // Δ(attendance) / Δt
  velocityHomework: number;   // Δ(homework) / Δt
  compositeVelocity: number;  // Weighted velocity vector
}

export function normalizeWeeklyLogs(logs: RawStudentWeeklyLog[]): NormalizedStudentFrame[] {
  const frames: NormalizedStudentFrame[] = [];
  let prevAttendance = 1.0;
  let prevHomework = 1.0;

  for (const log of logs) {
    const normAtt = Math.min(1.0, Math.max(0.0, log.attendedDays / Math.max(1, log.totalDays)));
    const normTime = Math.min(1.0, Math.max(0.0, 1.0 - log.hoursLate / 72.0));
    const normHw = Math.min(1.0, Math.max(0.0, log.homeworkPoints / Math.max(1, log.homeworkMaxPoints)));

    const vAtt = Number((normAtt - prevAttendance).toFixed(3));
    const vHw = Number((normHw - prevHomework).toFixed(3));
    const compositeVelocity = Number(((vAtt * 0.4) + (vHw * 0.6)).toFixed(3));

    prevAttendance = normAtt;
    prevHomework = normHw;

    frames.push({
      week: log.week,
      normAttendance: Number(normAtt.toFixed(3)),
      normTimeliness: Number(normTime.toFixed(3)),
      normHomework: Number(normHw.toFixed(3)),
      velocityAttendance: vAtt,
      velocityHomework: vHw,
      compositeVelocity,
    });
  }

  return frames;
}

export function assembleStudentFeatureVector(
  dinaMasteryProbabilities: Record<string, number>,
  lastFrame: NormalizedStudentFrame
): number[] {
  // 7D Feature Vector for Quantum Hilbert Space / Classical Hyperplane:
  // [vocab, grammar, reading_comp, synthesis, norm_attendance, norm_homework, velocity]
  const pVocab = dinaMasteryProbabilities['skill_vocab'] ?? 0.5;
  const pGrammar = dinaMasteryProbabilities['skill_grammar'] ?? 0.5;
  const pReading = dinaMasteryProbabilities['skill_reading_comp'] ?? 0.5;
  const pSynth = dinaMasteryProbabilities['skill_synthesis'] ?? 0.5;

  return [
    pVocab,
    pGrammar,
    pReading,
    pSynth,
    lastFrame.normAttendance,
    lastFrame.normHomework,
    lastFrame.compositeVelocity,
  ];
}
