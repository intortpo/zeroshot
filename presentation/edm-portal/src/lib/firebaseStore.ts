/**
 * Layer 4: Zero-Latency Reactive Firebase Store
 * Consumes pre-computed diagnostic_profile and risk_alert fields directly.
 * The Svelte UI never waits for an ML model to execute.
 */

export interface StudentProfile {
  studentId: string;
  name: string;
  cohort: string;
  itemResponses: Record<string, number>;
  rawWeeklyLogs: Array<{
    week: number;
    attendedDays: number;
    totalDays: number;
    hoursLate: number;
    homeworkPoints: number;
    homeworkMaxPoints: number;
  }>;
  normalizedTimeline?: Array<{
    week: number;
    normAttendance: number;
    normTimeliness: number;
    normHomework: number;
    velocityAttendance: number;
    velocityHomework: number;
    compositeVelocity: number;
  }>;
  diagnostic_profile?: {
    mastery_vector: number[];
    mastery_probabilities: Record<string, number>;
    slip_parameter: number;
    guess_parameter: number;
  };
  risk_alert?: {
    risk_level: string; // "green" | "amber" | "red"
    status_label: string;
    risk_probability: number;
    confidence_score: number;
    composite_velocity: number;
    low_confidence_trigger: boolean;
  };
}

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    studentId: 'std_402_october_dip',
    name: 'Student #402 (Cohort Fall 2026)',
    cohort: 'Linguistics Core A',
    itemResponses: {
      item_q1_vocab: 1,
      item_q2_cloze: 0,
      item_q3_grammar_fix: 0,
      item_hw_comprehend: 1,
      item_hw_short_synth: 0,
      item_midterm_essay: 0,
      item_midterm_critique: 0,
      item_final_case: 0,
    },
    rawWeeklyLogs: [
      { week: 1, attendedDays: 4, totalDays: 4, hoursLate: 0, homeworkPoints: 95, homeworkMaxPoints: 100 },
      { week: 2, attendedDays: 4, totalDays: 4, hoursLate: 1, homeworkPoints: 90, homeworkMaxPoints: 100 },
      { week: 3, attendedDays: 3, totalDays: 4, hoursLate: 8, homeworkPoints: 80, homeworkMaxPoints: 100 },
      { week: 4, attendedDays: 2, totalDays: 4, hoursLate: 28, homeworkPoints: 60, homeworkMaxPoints: 100 },
      { week: 5, attendedDays: 2, totalDays: 4, hoursLate: 44, homeworkPoints: 50, homeworkMaxPoints: 100 },
    ],
    normalizedTimeline: [
      { week: 1, normAttendance: 1.0, normTimeliness: 1.0, normHomework: 0.95, velocityAttendance: 0.0, velocityHomework: -0.05, compositeVelocity: -0.03 },
      { week: 2, normAttendance: 1.0, normTimeliness: 0.98, normHomework: 0.90, velocityAttendance: 0.0, velocityHomework: -0.05, compositeVelocity: -0.03 },
      { week: 3, normAttendance: 0.75, normTimeliness: 0.89, normHomework: 0.80, velocityAttendance: -0.25, velocityHomework: -0.10, compositeVelocity: -0.16 },
      { week: 4, normAttendance: 0.50, normTimeliness: 0.61, normHomework: 0.60, velocityAttendance: -0.25, velocityHomework: -0.20, compositeVelocity: -0.22 },
      { week: 5, normAttendance: 0.50, normTimeliness: 0.39, normHomework: 0.50, velocityAttendance: 0.0, velocityHomework: -0.10, compositeVelocity: -0.06 },
    ],
    diagnostic_profile: {
      mastery_vector: [1, 0, 0, 0],
      mastery_probabilities: {
        skill_vocab: 0.82,
        skill_grammar: 0.12,
        skill_reading_comp: 0.28,
        skill_synthesis: 0.15,
      },
      slip_parameter: 0.10,
      guess_parameter: 0.15,
    },
    risk_alert: {
      risk_level: 'red',
      status_label: 'High-Risk (Urgent Intervention Required)',
      risk_probability: 0.89,
      confidence_score: 0.92,
      composite_velocity: -0.06,
      low_confidence_trigger: false,
    },
  },
  {
    studentId: 'std_108_stable_high',
    name: 'Student #108 (Cohort Fall 2026)',
    cohort: 'Linguistics Core A',
    itemResponses: {
      item_q1_vocab: 1,
      item_q2_cloze: 1,
      item_q3_grammar_fix: 1,
      item_hw_comprehend: 1,
      item_hw_short_synth: 1,
      item_midterm_essay: 1,
      item_midterm_critique: 1,
      item_final_case: 1,
    },
    rawWeeklyLogs: [
      { week: 1, attendedDays: 4, totalDays: 4, hoursLate: 0, homeworkPoints: 98, homeworkMaxPoints: 100 },
      { week: 2, attendedDays: 4, totalDays: 4, hoursLate: 0, homeworkPoints: 96, homeworkMaxPoints: 100 },
      { week: 3, attendedDays: 4, totalDays: 4, hoursLate: 0, homeworkPoints: 95, homeworkMaxPoints: 100 },
      { week: 4, attendedDays: 4, totalDays: 4, hoursLate: 1, homeworkPoints: 94, homeworkMaxPoints: 100 },
      { week: 5, attendedDays: 4, totalDays: 4, hoursLate: 0, homeworkPoints: 97, homeworkMaxPoints: 100 },
    ],
    normalizedTimeline: [
      { week: 1, normAttendance: 1.0, normTimeliness: 1.0, normHomework: 0.98, velocityAttendance: 0.0, velocityHomework: -0.02, compositeVelocity: -0.01 },
      { week: 2, normAttendance: 1.0, normTimeliness: 1.0, normHomework: 0.96, velocityAttendance: 0.0, velocityHomework: -0.02, compositeVelocity: -0.01 },
      { week: 3, normAttendance: 1.0, normTimeliness: 1.0, normHomework: 0.95, velocityAttendance: 0.0, velocityHomework: -0.01, compositeVelocity: -0.01 },
      { week: 4, normAttendance: 1.0, normTimeliness: 0.98, normHomework: 0.94, velocityAttendance: 0.0, velocityHomework: -0.01, compositeVelocity: -0.01 },
      { week: 5, normAttendance: 1.0, normTimeliness: 1.0, normHomework: 0.97, velocityAttendance: 0.0, velocityHomework: 0.03, compositeVelocity: 0.02 },
    ],
    diagnostic_profile: {
      mastery_vector: [1, 1, 1, 1],
      mastery_probabilities: {
        skill_vocab: 0.96,
        skill_grammar: 0.92,
        skill_reading_comp: 0.94,
        skill_synthesis: 0.88,
      },
      slip_parameter: 0.10,
      guess_parameter: 0.15,
    },
    risk_alert: {
      risk_level: 'green',
      status_label: 'On-Track (Mastery Trajectory Stable)',
      risk_probability: 0.08,
      confidence_score: 0.95,
      composite_velocity: 0.02,
      low_confidence_trigger: false,
    },
  },
  {
    studentId: 'std_215_syntax_divergent',
    name: 'Student #215 (Cohort Fall 2026)',
    cohort: 'Linguistics Core A',
    itemResponses: {
      item_q1_vocab: 1,
      item_q2_cloze: 1,
      item_q3_grammar_fix: 1,
      item_hw_comprehend: 1,
      item_hw_short_synth: 0,
      item_midterm_essay: 0,
      item_midterm_critique: 1,
      item_final_case: 0,
    },
    rawWeeklyLogs: [
      { week: 1, attendedDays: 4, totalDays: 4, hoursLate: 0, homeworkPoints: 92, homeworkMaxPoints: 100 },
      { week: 2, attendedDays: 3, totalDays: 4, hoursLate: 4, homeworkPoints: 85, homeworkMaxPoints: 100 },
      { week: 3, attendedDays: 3, totalDays: 4, hoursLate: 6, homeworkPoints: 84, homeworkMaxPoints: 100 },
      { week: 4, attendedDays: 3, totalDays: 4, hoursLate: 10, homeworkPoints: 78, homeworkMaxPoints: 100 },
      { week: 5, attendedDays: 3, totalDays: 4, hoursLate: 12, homeworkPoints: 75, homeworkMaxPoints: 100 },
    ],
    normalizedTimeline: [
      { week: 1, normAttendance: 1.0, normTimeliness: 1.0, normHomework: 0.92, velocityAttendance: 0.0, velocityHomework: -0.08, compositeVelocity: -0.05 },
      { week: 2, normAttendance: 0.75, normTimeliness: 0.94, normHomework: 0.85, velocityAttendance: -0.25, velocityHomework: -0.07, compositeVelocity: -0.14 },
      { week: 3, normAttendance: 0.75, normTimeliness: 0.92, normHomework: 0.84, velocityAttendance: 0.0, velocityHomework: -0.01, compositeVelocity: -0.01 },
      { week: 4, normAttendance: 0.75, normTimeliness: 0.86, normHomework: 0.78, velocityAttendance: 0.0, velocityHomework: -0.06, compositeVelocity: -0.04 },
      { week: 5, normAttendance: 0.75, normTimeliness: 0.83, normHomework: 0.75, velocityAttendance: 0.0, velocityHomework: -0.03, compositeVelocity: -0.02 },
    ],
    diagnostic_profile: {
      mastery_vector: [1, 1, 1, 0],
      mastery_probabilities: {
        skill_vocab: 0.89,
        skill_grammar: 0.74,
        skill_reading_comp: 0.81,
        skill_synthesis: 0.44,
      },
      slip_parameter: 0.10,
      guess_parameter: 0.15,
    },
    risk_alert: {
      risk_level: 'amber',
      status_label: 'Moderate Risk (Latent Synthesis Divergence)',
      risk_probability: 0.46,
      confidence_score: 0.84,
      composite_velocity: -0.02,
      low_confidence_trigger: true,
    },
  },
];

export async function fetchLiveFirebaseStudents(
  trafficControllerUrl: string = 'http://127.0.0.1:8087'
): Promise<StudentProfile[]> {
  try {
    const res = await fetch(`${trafficControllerUrl}/firebase/students`);
    if (res.ok) {
      return await res.json();
    }
  } catch (_e) {
    // Offline / direct cached store fallback
  }
  return INITIAL_STUDENTS;
}
