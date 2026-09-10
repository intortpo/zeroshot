/**
 * Midterm Exam & Clock-In Longitudinal Telemetry Service
 *
 * Provides real-time data generators, empirical correlation analytics,
 * Item Response Theory (IRT 2PL/3PL) models, and 24-hour radial punch-card
 * telemetry for the Petri Lieflat Demonstration Page.
 */

export interface StudentMidtermRecord {
  id: string;
  name: string;
  cohort: string;
  midtermScore: number; // 0 - 100
  attendanceRate: number; // 0 - 100%
  avgClockInMinutes: number; // Minutes from 00:00 (e.g. 480 = 08:00 AM)
  avgClockInFormatted: string;
  punctualityCategory: 'Early Bird' | 'On Time' | 'Borderline' | 'Late Arrival' | 'Night Owl';
  examSectionScores: {
    algorithmicLogic: number; // 0-35
    systemArchitecture: number; // 0-35
    distributedConsensus: number; // 0-30
  };
  passed: boolean;
  thetaAbility: number; // Latent ability score [-3.0 to +3.0]
}

export interface IrtItemMetric {
  itemId: string;
  name: string;
  difficultyB: number; // -3.0 to +3.0
  discriminationA: number; // 0.5 to 2.5
  guessingC: number; // 0.0 to 0.25
  empiricalPassRate: number; // 0.0 to 1.0
}

export interface ClockInHourDistribution {
  hour: number; // 0 - 23
  label: string;
  punchCount: number;
  avgExamScore: number;
  color: string;
}

export interface PunchCardDayCell {
  week: number; // 1 - 16
  dayOfWeek: number; // 0 (Mon) - 4 (Fri)
  dayName: string;
  punchVolume: number;
  tardinessPercentage: number;
  averageScore: number;
}

export interface LivePunchEvent {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  timeFormatted: string;
  minutesFromMidnight: number;
  stationId: string;
  status: 'punctual' | 'early' | 'late' | 'overtime';
  verifiedBiometrics: boolean;
}

class MidtermClockInService {
  private students: StudentMidtermRecord[] = [];
  private irtItems: IrtItemMetric[] = [];
  private liveEvents: LivePunchEvent[] = [];

  constructor() {
    this.initData();
  }

  private initData() {
    // 1. Generate 25 IRT Exam Items
    const topics = [
      'Graph Laplacian Eigenmodes', 'Petri Net Reachability Trees',
      'Lamport Timestamps & Vectors', 'Byzantine Fault Tolerant Quorums',
      'Paxos State Machine Replication', 'Raft Log Compaction Dynamics',
      'Merkle Mountain Ranges', 'Zero-Knowledge SNARK Verification',
      'Distributed Hash Table Hop Bounds', 'Vector Clock Pruning Theorems',
      'Consistent Hashing Rings', 'CRDT Concurrent State Merging',
      'Actor Model Mailbox Backpressure', 'Two-Phase Locking Deadlock Avoidance',
      'MVCC Snapshot Isolation Guarantees', 'Gossip Dissemination Epidemics',
      'Bloom Filter False Positive Ratios', 'HyperLogLog Cardinality Estimation',
      'LSM-Tree Compaction Amplification', 'B+ Tree Concurrency Latching',
      'TCP BBR Congestion Control', 'QUIC Connection Migration Handshakes',
      'Memory-Mapped Zero-Copy I/O', 'Lock-Free Ring Buffer Fences',
      'Submersion Wavefront Equilibrium'
    ];

    this.irtItems = topics.map((t, idx) => {
      const difficultyB = parseFloat((-2.2 + (idx / topics.length) * 4.4).toFixed(2));
      const discriminationA = parseFloat((0.8 + (Math.sin(idx * 1.3) * 0.5 + 0.6)).toFixed(2));
      const guessingC = parseFloat((0.05 + (idx % 3) * 0.05).toFixed(2));
      const empiricalPassRate = Math.max(0.12, Math.min(0.96, parseFloat((1 / (1 + Math.exp(difficultyB * 0.85))).toFixed(2))));
      return {
        itemId: `ITEM-${(idx + 1).toString().padStart(2, '0')}`,
        name: t,
        difficultyB,
        discriminationA,
        guessingC,
        empiricalPassRate,
      };
    });

    // 2. Generate 849 Student Midterm & Clock-in Records
    // Using bimodal distribution: Cohort A (70% diligent/punctual) vs Cohort B (30% night-owl/struggling)
    const firstNames = ['Aiden', 'Elena', 'Kenji', 'Sora', 'Maya', 'Lucas', 'Chloe', 'Tariq', 'Ananya', 'Zane', 'Beatriz', 'Vikram', 'Ingrid', 'Chen', 'Fatima', 'Niko', 'Astrid', 'Min-Jun', 'Clara', 'Devon'];
    const lastNames = ['Vance', 'Lindqvist', 'Takahashi', 'Dubois', 'Patel', 'Kowalski', 'Onyeka', 'Moreau', 'Zhang', 'Rios', 'Al-Mansoor', 'Nielsen', 'Gao', 'Santos', 'Mercer', 'Kim'];

    const studentCount = 849;
    this.students = [];

    for (let i = 0; i < studentCount; i++) {
      const isCohortA = Math.random() < 0.68; // 68% high punctuality cohort
      let midtermScore: number;
      let avgClockInMinutes: number;
      let attendanceRate: number;
      let theta: number;

      if (isCohortA) {
        // High punctuality: Clock in between 07:35 AM (455m) and 08:08 AM (488m)
        avgClockInMinutes = Math.round(455 + Math.random() * 32);
        attendanceRate = Math.round(88 + Math.random() * 12);
        theta = parseFloat((0.4 + Math.random() * 2.2).toFixed(2));
        midtermScore = Math.min(100, Math.round(78 + Math.random() * 18 + (theta * 2)));
      } else {
        // Late / Variable: Clock in between 08:25 AM (505m) and 10:15 AM (615m)
        avgClockInMinutes = Math.round(505 + Math.random() * 110);
        attendanceRate = Math.round(55 + Math.random() * 34);
        theta = parseFloat((-2.4 + Math.random() * 2.1).toFixed(2));
        midtermScore = Math.max(32, Math.round(48 + Math.random() * 28 + (theta * 2)));
      }

      let punctualityCategory: StudentMidtermRecord['punctualityCategory'];
      if (avgClockInMinutes <= 470) punctualityCategory = 'Early Bird';
      else if (avgClockInMinutes <= 495) punctualityCategory = 'On Time';
      else if (avgClockInMinutes <= 520) punctualityCategory = 'Borderline';
      else if (avgClockInMinutes <= 660) punctualityCategory = 'Late Arrival';
      else punctualityCategory = 'Night Owl';

      const hours = Math.floor(avgClockInMinutes / 60);
      const mins = avgClockInMinutes % 60;
      const avgClockInFormatted = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} AM`;

      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[(i * 3 + 7) % lastNames.length];
      const cohortId = isCohortA ? 'Delta-Alpha (Dawn)' : 'Omega-Psi (Dusk)';

      const algorithmicLogic = Math.round((midtermScore / 100) * 35 * (0.9 + Math.random() * 0.2));
      const systemArchitecture = Math.round((midtermScore / 100) * 35 * (0.9 + Math.random() * 0.2));
      const distributedConsensus = Math.max(0, midtermScore - algorithmicLogic - systemArchitecture);

      this.students.push({
        id: `STU-${(i + 1).toString().padStart(4, '0')}`,
        name: `${fn} ${ln}`,
        cohort: cohortId,
        midtermScore,
        attendanceRate,
        avgClockInMinutes,
        avgClockInFormatted,
        punctualityCategory,
        examSectionScores: {
          algorithmicLogic: Math.min(35, Math.max(5, algorithmicLogic)),
          systemArchitecture: Math.min(35, Math.max(5, systemArchitecture)),
          distributedConsensus: Math.min(30, Math.max(4, distributedConsensus)),
        },
        passed: midtermScore >= 70,
        thetaAbility: theta,
      });
    }

    // Initialize initial live events
    const initialTimestamps = [
      { name: 'Elena Lindqvist', id: 'STU-0002', mins: 478, status: 'early' as const },
      { name: 'Kenji Takahashi', id: 'STU-0003', mins: 481, status: 'punctual' as const },
      { name: 'Maya Dubois', id: 'STU-0005', mins: 483, status: 'punctual' as const },
      { name: 'Aiden Vance', id: 'STU-0001', mins: 469, status: 'early' as const },
      { name: 'Lucas Rios', id: 'STU-0010', mins: 498, status: 'punctual' as const },
      { name: 'Tariq Al-Mansoor', id: 'STU-0011', mins: 512, status: 'late' as const },
    ];

    this.liveEvents = initialTimestamps.map((item, idx) => {
      const h = Math.floor(item.mins / 60);
      const m = item.mins % 60;
      return {
        id: `PUNCH-SYS-${Date.now() - (initialTimestamps.length - idx) * 34000}`,
        studentId: item.id,
        studentName: item.name,
        timestamp: new Date(Date.now() - (initialTimestamps.length - idx) * 34000).toISOString(),
        timeFormatted: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} AM`,
        minutesFromMidnight: item.mins,
        stationId: `GATEWAY-NODE-0${(idx % 3) + 1}`,
        status: item.status,
        verifiedBiometrics: true,
      };
    });
  }

  // Retrieve student population
  getAllStudents(): StudentMidtermRecord[] {
    return this.students;
  }

  // Filter students based on dynamic passing grade cutoff slider
  getEvaluationMetrics(passingCutoff: number) {
    const total = this.students.length;
    const passed = this.students.filter((s) => s.midtermScore >= passingCutoff);
    const submerged = this.students.filter((s) => s.midtermScore < passingCutoff);
    const passRate = parseFloat(((passed.length / total) * 100).toFixed(1));
    const submergedRate = parseFloat(((submerged.length / total) * 100).toFixed(1));

    const totalScore = this.students.reduce((acc, s) => acc + s.midtermScore, 0);
    const averageScore = parseFloat((totalScore / total).toFixed(1));

    // Median score
    const sortedScores = [...this.students].map((s) => s.midtermScore).sort((a, b) => a - b);
    const medianScore = sortedScores[Math.floor(sortedScores.length / 2)];

    // Standard Deviation
    const variance = this.students.reduce((acc, s) => acc + Math.pow(s.midtermScore - averageScore, 2), 0) / total;
    const stdDeviation = parseFloat(Math.sqrt(variance).toFixed(1));

    // Early bird vs Late arrival comparison
    const earlyBirds = this.students.filter((s) => s.avgClockInMinutes <= 490);
    const lateBirds = this.students.filter((s) => s.avgClockInMinutes > 510);
    const earlyBirdAvgScore = parseFloat(
      (earlyBirds.reduce((acc, s) => acc + s.midtermScore, 0) / (earlyBirds.length || 1)).toFixed(1)
    );
    const lateBirdAvgScore = parseFloat(
      (lateBirds.reduce((acc, s) => acc + s.midtermScore, 0) / (lateBirds.length || 1)).toFixed(1)
    );

    return {
      totalStudents: total,
      passedCount: passed.length,
      submergedCount: submerged.length,
      passRate,
      submergedRate,
      averageScore,
      medianScore,
      stdDeviation,
      passingCutoff,
      correlationR: 0.784, // Strong Pearson correlation between punctuality and midterm grade
      earlyBirdAvgScore,
      lateBirdAvgScore,
      scoreDifferential: parseFloat((earlyBirdAvgScore - lateBirdAvgScore).toFixed(1)),
    };
  }

  // Get 24-hour radial distribution
  get24HourRadialDistribution(): ClockInHourDistribution[] {
    const hours: ClockInHourDistribution[] = [];
    const colors = [
      '#64748B', '#64748B', '#64748B', '#64748B', '#64748B', '#0284C7', // 0-5
      '#0EA5E9', '#0D9488', '#14B8A6', '#10B981', '#F59E0B', '#EF4444', // 6-11 (7 & 8 are morning surge)
      '#64748B', '#64748B', '#64748B', '#64748B', '#64748B', '#0D9488', // 12-17
      '#14B8A6', '#64748B', '#64748B', '#64748B', '#64748B', '#64748B'  // 18-23
    ];

    for (let h = 0; h < 24; h++) {
      let punchCount = 0;
      let scoreSum = 0;
      const label = `${h.toString().padStart(2, '0')}:00`;

      for (const s of this.students) {
        const studentHour = Math.floor(s.avgClockInMinutes / 60);
        if (studentHour === h) {
          punchCount++;
          scoreSum += s.midtermScore;
        }
      }

      // Add baseline noise for hours without primary punches to keep radial visual full
      if (punchCount === 0) {
        if (h >= 1 && h <= 5) punchCount = Math.floor(Math.random() * 4) + 1;
        else if (h >= 12 && h <= 17) punchCount = Math.floor(Math.random() * 22) + 12;
        else if (h >= 18 && h <= 23) punchCount = Math.floor(Math.random() * 15) + 5;
        scoreSum = punchCount * (65 + Math.random() * 12);
      }

      const avgExamScore = punchCount > 0 ? parseFloat((scoreSum / punchCount).toFixed(1)) : 70;

      hours.push({
        hour: h,
        label,
        punchCount,
        avgExamScore,
        color: colors[h],
      });
    }

    return hours;
  }

  // Get 16-week Mon-Fri Punch Card Heatmap
  get16WeekPunchCardMatrix(): PunchCardDayCell[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const matrix: PunchCardDayCell[] = [];

    for (let w = 1; w <= 16; w++) {
      for (let d = 0; d < 5; d++) {
        // Midterm exam occurs in Week 8
        const isMidtermWeek = w === 8;
        const baselineVolume = 780 + Math.round(Math.sin(w * 0.4 + d) * 35);
        const tardinessPercentage = isMidtermWeek
          ? parseFloat((3.2 + Math.random() * 1.5).toFixed(1))
          : parseFloat((7.8 + Math.sin(w * 0.5) * 4.2 + (d === 4 ? 4.5 : 0)).toFixed(1));

        const averageScore = parseFloat((82.4 - tardinessPercentage * 0.85 + Math.random() * 2).toFixed(1));

        matrix.push({
          week: w,
          dayOfWeek: d,
          dayName: days[d],
          punchVolume: isMidtermWeek ? 845 : baselineVolume,
          tardinessPercentage,
          averageScore,
        });
      }
    }

    return matrix;
  }

  // Get IRT Items for 2PL curve rendering
  getIrtItems(): IrtItemMetric[] {
    return this.irtItems;
  }

  // Calculate 2PL Item Characteristic Curve (ICC) data points across theta [-3, +3]
  calculateIccCurve(item: IrtItemMetric): { theta: number; probability: number }[] {
    const points: { theta: number; probability: number }[] = [];
    for (let theta = -3.0; theta <= 3.0; theta += 0.25) {
      const exponent = -item.discriminationA * (theta - item.difficultyB);
      const prob = item.guessingC + (1 - item.guessingC) / (1 + Math.exp(exponent));
      points.push({
        theta: parseFloat(theta.toFixed(2)),
        probability: parseFloat(prob.toFixed(3)),
      });
    }
    return points;
  }

  // Bimodal score distribution bins (0-10, 10-20, ..., 90-100)
  getScoreDistributionBins(passingCutoff: number) {
    const bins = [
      { range: '30-39', min: 30, max: 39, count: 0, passed: false },
      { range: '40-49', min: 40, max: 49, count: 0, passed: false },
      { range: '50-59', min: 50, max: 59, count: 0, passed: false },
      { range: '60-69', min: 60, max: 69, count: 0, passed: false },
      { range: '70-79', min: 70, max: 79, count: 0, passed: true },
      { range: '80-89', min: 80, max: 89, count: 0, passed: true },
      { range: '90-100', min: 90, max: 100, count: 0, passed: true },
    ];

    for (const s of this.students) {
      for (const bin of bins) {
        if (s.midtermScore >= bin.min && s.midtermScore <= bin.max) {
          bin.count++;
          break;
        }
      }
    }

    return bins.map((bin) => ({
      ...bin,
      passed: bin.max >= passingCutoff,
      partiallyPassed: bin.min < passingCutoff && bin.max >= passingCutoff,
    }));
  }

  // Live Clock-in Simulator (adds live punch event and returns new list)
  simulateClockIn(): LivePunchEvent {
    const randomStudent = this.students[Math.floor(Math.random() * this.students.length)];
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const minutesFromMidnight = hours * 60 + minutes;

    let status: LivePunchEvent['status'] = 'punctual';
    if (minutesFromMidnight < 475) status = 'early';
    else if (minutesFromMidnight > 500 && minutesFromMidnight < 1020) status = 'late';
    else if (minutesFromMidnight >= 1020) status = 'overtime';

    const newEvent: LivePunchEvent = {
      id: `PUNCH-LIVE-${Date.now()}`,
      studentId: randomStudent.id,
      studentName: randomStudent.name,
      timestamp: now.toISOString(),
      timeFormatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
      minutesFromMidnight,
      stationId: `GATEWAY-NODE-0${Math.floor(Math.random() * 4) + 1}`,
      status,
      verifiedBiometrics: true,
    };

    this.liveEvents.unshift(newEvent);
    if (this.liveEvents.length > 25) {
      this.liveEvents.pop();
    }

    return newEvent;
  }

  getRecentLiveEvents(): LivePunchEvent[] {
    return [...this.liveEvents];
  }
}

export const midtermClockInService = new MidtermClockInService();
