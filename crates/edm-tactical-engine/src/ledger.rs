use crate::feedback::TacticalEvaluationResponse;
use rusqlite::{params, Connection, Result};
use std::path::Path;
use std::sync::Mutex;

#[derive(Debug, Clone)]
pub struct SessionRecord<'a> {
    pub session_id: &'a str,
    pub student_id: &'a str,
    pub subject_domain: &'a str,
    pub timestamp: i64,
}

#[derive(Debug, Clone)]
pub struct RemediationRecord<'a> {
    pub session_id: &'a str,
    pub student_id: &'a str,
    pub iteration: i32,
    pub tutor_prescription: &'a str,
    pub assessor_verdict: &'a str,
    pub mastery_verified: bool,
    pub timestamp: i64,
}

pub struct DurableLedger {
    conn: Mutex<Connection>,
}

impl DurableLedger {
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        let ledger = Self {
            conn: Mutex::new(conn),
        };
        ledger.init_tables()?;
        Ok(ledger)
    }

    pub fn open_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let ledger = Self {
            conn: Mutex::new(conn),
        };
        ledger.init_tables()?;
        Ok(ledger)
    }

    fn init_tables(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS student_sessions (
                session_id TEXT PRIMARY KEY,
                student_id TEXT NOT NULL,
                subject_domain TEXT NOT NULL,
                started_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS longitudinal_vectors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                week INTEGER NOT NULL,
                norm_attendance REAL NOT NULL,
                norm_homework REAL NOT NULL,
                velocity REAL NOT NULL,
                recorded_at INTEGER NOT NULL,
                FOREIGN KEY (session_id) REFERENCES student_sessions (session_id)
            );

            CREATE TABLE IF NOT EXISTS dina_evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                student_id TEXT NOT NULL,
                mastery_vector_json TEXT NOT NULL,
                mastery_probabilities_json TEXT NOT NULL,
                slip_param REAL NOT NULL,
                guess_param REAL NOT NULL,
                risk_level TEXT NOT NULL,
                risk_probability REAL NOT NULL,
                confidence_score REAL NOT NULL,
                model_source TEXT NOT NULL,
                recorded_at INTEGER NOT NULL,
                FOREIGN KEY (session_id) REFERENCES student_sessions (session_id)
            );

            CREATE TABLE IF NOT EXISTS remediation_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                student_id TEXT NOT NULL,
                iteration INTEGER NOT NULL,
                tutor_prescription TEXT NOT NULL,
                assessor_verdict TEXT NOT NULL,
                mastery_verified INTEGER NOT NULL,
                recorded_at INTEGER NOT NULL,
                FOREIGN KEY (session_id) REFERENCES student_sessions (session_id)
            );
            ",
        )?;
        Ok(())
    }

    pub fn record_session(&self, record: &SessionRecord) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT OR REPLACE INTO student_sessions (session_id, student_id, subject_domain, started_at) VALUES (?1, ?2, ?3, ?4)",
            params![record.session_id, record.student_id, record.subject_domain, record.timestamp],
        )?;
        Ok(())
    }

    pub fn record_evaluation(
        &self,
        session_id: &str,
        res: &TacticalEvaluationResponse,
        timestamp: i64,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let mastery_vec_json = serde_json::to_string(&res.diagnostic_profile.mastery_vector)
            .unwrap_or_else(|_| "[]".to_string());
        let mastery_prob_json =
            serde_json::to_string(&res.diagnostic_profile.mastery_probabilities)
                .unwrap_or_else(|_| "{}".to_string());

        conn.execute(
            "INSERT INTO dina_evaluations (
                session_id, student_id, mastery_vector_json, mastery_probabilities_json,
                slip_param, guess_param, risk_level, risk_probability,
                confidence_score, model_source, recorded_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                session_id,
                res.student_id,
                mastery_vec_json,
                mastery_prob_json,
                res.diagnostic_profile.slip_parameter,
                res.diagnostic_profile.guess_parameter,
                res.risk_alert.risk_level,
                res.risk_alert.risk_probability,
                res.risk_alert.confidence_score,
                res.model_source,
                timestamp,
            ],
        )?;
        Ok(())
    }

    pub fn record_remediation(&self, record: &RemediationRecord) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO remediation_events (
                session_id, student_id, iteration, tutor_prescription, assessor_verdict, mastery_verified, recorded_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                record.session_id,
                record.student_id,
                record.iteration,
                record.tutor_prescription,
                record.assessor_verdict,
                if record.mastery_verified { 1 } else { 0 },
                record.timestamp,
            ],
        )?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dina::DinaLatentProfile;
    use crate::tactical_risk::TacticalRiskAlert;
    use std::collections::HashMap;

    #[test]
    fn test_durable_ledger_lifecycle() {
        let ledger = DurableLedger::open_in_memory().expect("open ledger in memory");
        ledger
            .record_session(&SessionRecord {
                session_id: "sess_001",
                student_id: "std_quantum_01",
                subject_domain: "quantum_computing",
                timestamp: 1789000000,
            })
            .unwrap();

        let mut probs = HashMap::new();
        probs.insert("skill_superposition".to_string(), 0.88);
        probs.insert("skill_pauli_measurement".to_string(), 0.76);
        probs.insert("skill_entanglement".to_string(), 0.42);
        probs.insert("skill_qpe".to_string(), 0.25);

        let eval_res = TacticalEvaluationResponse {
            student_id: "std_quantum_01".to_string(),
            diagnostic_profile: DinaLatentProfile {
                mastery_vector: vec![1, 1, 0, 0],
                mastery_probabilities: probs,
                slip_parameter: 0.10,
                guess_parameter: 0.15,
            },
            risk_alert: TacticalRiskAlert {
                risk_level: "amber".to_string(),
                status_label: "Moderate Risk (Latent Divergence)".to_string(),
                risk_probability: 0.48,
                confidence_score: 0.82,
                low_confidence_trigger: false,
                composite_velocity: -0.08,
            },
            model_source: "quantum_recalibrated".to_string(),
        };

        ledger
            .record_evaluation("sess_001", &eval_res, 1789000010)
            .unwrap();
        ledger
            .record_remediation(&RemediationRecord {
                session_id: "sess_001",
                student_id: "std_quantum_01",
                iteration: 1,
                tutor_prescription: "Targeted Bell state parity exercise with CNOT visualization",
                assessor_verdict: "Partial mastery: Parity correct, phase kickback error",
                mastery_verified: false,
                timestamp: 1789000020,
            })
            .unwrap();
    }
}
