import { expect, test, describe } from 'bun:test';
import { normalizeWeeklyLogs, assembleStudentFeatureVector } from '../src/normalizer';
import { executeFridayTacticalRun } from '../src/tacticalCron';
import { executeStrategicTermRun } from '../src/strategicCron';
import { firebaseSource } from '../src/firebaseClient';

describe('Layer 1: Bun Traffic Controller & Normalization', () => {
  test('normalizeWeeklyLogs bounds values strictly in [0.0, 1.0]', () => {
    const raw = [
      { week: 1, attendedDays: 5, totalDays: 5, hoursLate: 0, homeworkPoints: 100, homeworkMaxPoints: 100 },
      { week: 2, attendedDays: 3, totalDays: 5, hoursLate: 12, homeworkPoints: 80, homeworkMaxPoints: 100 },
      { week: 3, attendedDays: 0, totalDays: 5, hoursLate: 80, homeworkPoints: 0, homeworkMaxPoints: 100 },
    ];

    const normalized = normalizeWeeklyLogs(raw);
    expect(normalized).toHaveLength(3);

    for (const frame of normalized) {
      expect(frame.normAttendance).toBeGreaterThanOrEqual(0.0);
      expect(frame.normAttendance).toBeLessThanOrEqual(1.0);
      expect(frame.normTimeliness).toBeGreaterThanOrEqual(0.0);
      expect(frame.normTimeliness).toBeLessThanOrEqual(1.0);
      expect(frame.normHomework).toBeGreaterThanOrEqual(0.0);
      expect(frame.normHomework).toBeLessThanOrEqual(1.0);
    }

    // Week 1 attendance is 1.0, Week 2 is 0.6 -> velocity is -0.4
    expect(normalized[1].velocityAttendance).toBeCloseTo(-0.4, 2);
  });

  test('assembleStudentFeatureVector produces 7-dimensional vector', () => {
    const probs = { skill_vocab: 0.9, skill_grammar: 0.4, skill_reading_comp: 0.85, skill_synthesis: 0.5 };
    const frame = {
      week: 1,
      normAttendance: 0.95,
      normTimeliness: 0.90,
      normHomework: 0.88,
      velocityAttendance: 0.0,
      velocityHomework: -0.05,
      compositeVelocity: -0.03,
    };

    const vector = assembleStudentFeatureVector(probs, frame);
    expect(vector).toHaveLength(7);
    expect(vector[0]).toBe(0.9); // vocab
    expect(vector[1]).toBe(0.4); // grammar
    expect(vector[4]).toBe(0.95); // normAttendance
  });

  test('Friday Tactical Run updates Firebase state', async () => {
    const result = await executeFridayTacticalRun();
    expect(result.studentsProcessed).toBeGreaterThanOrEqual(3);
    expect(result.results.length).toBeGreaterThanOrEqual(3);

    const students = await firebaseSource.getAllStudents();
    const student402 = students.find((s) => s.studentId === 'std_402_october_dip');
    expect(student402?.diagnostic_profile).toBeDefined();
    expect(student402?.risk_alert).toBeDefined();
  });

  test('Strategic Term Run triggers quantum boundary discovery and closes feedback loop', async () => {
    const result = await executeStrategicTermRun();
    expect(result.anonymizedRecordsCount).toBeGreaterThanOrEqual(3);
    expect(result.injectedHyperplane.weights).toHaveLength(7);
    expect(result.correlationsDiscovered.length).toBeGreaterThan(0);
  });
});
