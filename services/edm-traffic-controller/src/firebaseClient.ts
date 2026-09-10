/**
 * Layer 1: Firebase Source of Truth Connector
 * Stores the raw, chaotic reality—authentication, real-time Google Classroom syncs,
 * item-level quiz answers, and daily attendance logs.
 * Also stores pre-computed diagnostic_profile and risk_alert for zero-latency presentation.
 */

import { RawStudentWeeklyLog, NormalizedStudentFrame } from './normalizer';

export interface FirebaseStudentDoc {
  studentId: string;
  name: string; // Tokenized pseudonym in production
  cohort: string;
  itemResponses: Record<string, number>; // item_id -> binary 0/1
  rawWeeklyLogs: RawStudentWeeklyLog[];
  normalizedTimeline?: NormalizedStudentFrame[];
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
  lastEvaluatedAt?: number;
}

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export class FirebaseSourceOfTruth {
  private students: Map<string, FirebaseStudentDoc> = new Map();

  constructor() {
    this.seedInitialCohort();
  }

  private seedInitialCohort() {
    const potentialPaths = [
      process.env.EDM_DATA_PATH,
      join(__dirname, '../data/real_students.json'),
      join(process.cwd(), 'data/real_students.json'),
      join(process.cwd(), 'services/edm-traffic-controller/data/real_students.json'),
    ].filter(Boolean) as string[];

    for (const p of potentialPaths) {
      if (existsSync(p)) {
        try {
          const raw = readFileSync(p, 'utf-8');
          const data: FirebaseStudentDoc[] = JSON.parse(raw);
          for (const s of data) {
            this.students.set(s.studentId, s);
          }
          console.log(`[layer-1:firebase] Loaded ${this.students.size} production student records from ${p}`);
          return;
        } catch (err) {
          console.error(`[layer-1:firebase] Error parsing ${p}:`, err);
        }
      }
    }

    // Fallback seed realistic student records
    this.students.set('std_402_october_dip', {
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
    });

    this.students.set('std_108_stable_high', {
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
    });

    this.students.set('std_215_syntax_divergent', {
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
    });
  }

  public async getAllStudents(): Promise<FirebaseStudentDoc[]> {
    return Array.from(this.students.values());
  }

  public async getStudent(studentId: string): Promise<FirebaseStudentDoc | null> {
    return this.students.get(studentId) || null;
  }

  public async updateStudentTacticalOutputs(
    studentId: string,
    normalizedTimeline: NormalizedStudentFrame[],
    diagnostic_profile: any,
    risk_alert: any
  ): Promise<void> {
    const student = this.students.get(studentId);
    if (!student) return;

    student.normalizedTimeline = normalizedTimeline;
    student.diagnostic_profile = diagnostic_profile;
    student.risk_alert = risk_alert;
    student.lastEvaluatedAt = Date.now();
  }

  public async logStudentAttendance(studentId: string, attended: boolean): Promise<void> {
    const student = this.students.get(studentId);
    if (!student) return;
    const currentWeek = student.rawWeeklyLogs[student.rawWeeklyLogs.length - 1];
    if (currentWeek) {
      if (attended) currentWeek.attendedDays += 1;
      currentWeek.totalDays += 1;
    }
  }
}

export const firebaseSource = new FirebaseSourceOfTruth();
