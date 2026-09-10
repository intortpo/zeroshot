use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct LatentSkill {
    pub id: String,
    pub name: String,
    pub benchmark_target: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QMatrixItem {
    pub item_id: String,
    pub name: String,
    pub category: String,
    pub skills: HashMap<String, u8>, // 0 or 1
}

#[derive(Debug, Clone)]
pub struct CurriculumQMatrix {
    pub domain_id: String,
    pub domain_name: String,
    pub skills: Vec<LatentSkill>,
    pub items: HashMap<String, QMatrixItem>,
}

impl CurriculumQMatrix {
    pub fn new(
        domain_id: impl Into<String>,
        domain_name: impl Into<String>,
        skills: Vec<LatentSkill>,
        items: HashMap<String, QMatrixItem>,
    ) -> Self {
        Self {
            domain_id: domain_id.into(),
            domain_name: domain_name.into(),
            skills,
            items,
        }
    }

    /// Quantum Computing & Qiskit Fundamentals authoritative Q-Matrix
    pub fn quantum_computing() -> Self {
        let skills = vec![
            LatentSkill {
                id: "skill_superposition".to_string(),
                name: "Superposition & State Prep".to_string(),
                benchmark_target: 0.85,
            },
            LatentSkill {
                id: "skill_pauli_measurement".to_string(),
                name: "Pauli Operators & Measurement".to_string(),
                benchmark_target: 0.80,
            },
            LatentSkill {
                id: "skill_entanglement".to_string(),
                name: "Quantum Entanglement & Bell States".to_string(),
                benchmark_target: 0.85,
            },
            LatentSkill {
                id: "skill_qpe".to_string(),
                name: "Quantum Phase Estimation".to_string(),
                benchmark_target: 0.75,
            },
        ];

        let mut items = HashMap::new();
        let raw_items = vec![
            (
                "item_q1_bloch",
                "Quiz 1 · Bloch Sphere Rotation Angle",
                "quiz",
                [1, 0, 0, 0],
            ),
            (
                "item_q2_hadamard_z",
                "Quiz 2 · Hadamard to Pauli-Z Expectation",
                "quiz",
                [1, 1, 0, 0],
            ),
            (
                "item_q3_pauli_basis",
                "Quiz 3 · Eigenbasis Measurement Operators",
                "quiz",
                [0, 1, 0, 0],
            ),
            (
                "item_hw_bell_state",
                "Homework 1 · Bell State Circuit Synthesis",
                "homework",
                [1, 0, 1, 0],
            ),
            (
                "item_hw_cnot_parity",
                "Homework 2 · CNOT Phase Kickback & Parity",
                "homework",
                [0, 1, 1, 0],
            ),
            (
                "item_midterm_qft",
                "Midterm · 3-Qubit Quantum Fourier Transform",
                "midterm",
                [1, 1, 1, 1],
            ),
            (
                "item_midterm_teleport",
                "Midterm · Quantum Teleportation Protocol",
                "midterm",
                [0, 1, 1, 0],
            ),
            (
                "item_final_qpe_shor",
                "Project · Unitary Eigenvalue Phase Extraction",
                "final",
                [1, 0, 1, 1],
            ),
        ];

        for (id, name, cat, q_row) in raw_items {
            let mut skill_map = HashMap::new();
            skill_map.insert("skill_superposition".to_string(), q_row[0]);
            skill_map.insert("skill_pauli_measurement".to_string(), q_row[1]);
            skill_map.insert("skill_entanglement".to_string(), q_row[2]);
            skill_map.insert("skill_qpe".to_string(), q_row[3]);

            items.insert(
                id.to_string(),
                QMatrixItem {
                    item_id: id.to_string(),
                    name: name.to_string(),
                    category: cat.to_string(),
                    skills: skill_map,
                },
            );
        }

        Self {
            domain_id: "quantum_computing".to_string(),
            domain_name: "Quantum Computing & Qiskit Fundamentals".to_string(),
            skills,
            items,
        }
    }

    /// Academic Discourse & Analysis (Legacy placeholder)
    pub fn classical_discourse() -> Self {
        let skills = vec![
            LatentSkill {
                id: "skill_vocab".to_string(),
                name: "Vocabulary Acquisition".to_string(),
                benchmark_target: 0.85,
            },
            LatentSkill {
                id: "skill_grammar".to_string(),
                name: "Syntax & Grammar".to_string(),
                benchmark_target: 0.80,
            },
            LatentSkill {
                id: "skill_reading_comp".to_string(),
                name: "Reading Comprehension".to_string(),
                benchmark_target: 0.85,
            },
            LatentSkill {
                id: "skill_synthesis".to_string(),
                name: "Analytical Synthesis".to_string(),
                benchmark_target: 0.75,
            },
        ];

        let mut items = HashMap::new();

        let raw_items = vec![
            (
                "item_q1_vocab",
                "Quiz 1 · Vocabulary Matching",
                "quiz",
                [1, 0, 0, 0],
            ),
            (
                "item_q2_cloze",
                "Quiz 2 · Syntactic Cloze Item",
                "quiz",
                [1, 1, 0, 0],
            ),
            (
                "item_q3_grammar_fix",
                "Quiz 3 · Grammar Correction",
                "quiz",
                [0, 1, 0, 0],
            ),
            (
                "item_hw_comprehend",
                "Homework 2 · Passage Inference",
                "homework",
                [0, 0, 1, 0],
            ),
            (
                "item_hw_short_synth",
                "Homework 4 · Analytical Summary",
                "homework",
                [0, 0, 1, 1],
            ),
            (
                "item_midterm_essay",
                "Midterm · Argumentative Essay",
                "midterm",
                [1, 1, 1, 1],
            ),
            (
                "item_midterm_critique",
                "Midterm · Textual Critique",
                "midterm",
                [0, 1, 0, 1],
            ),
            (
                "item_final_case",
                "Project · Final Case Study",
                "final",
                [0, 0, 1, 1],
            ),
        ];

        for (id, name, cat, q_row) in raw_items {
            let mut skill_map = HashMap::new();
            skill_map.insert("skill_vocab".to_string(), q_row[0]);
            skill_map.insert("skill_grammar".to_string(), q_row[1]);
            skill_map.insert("skill_reading_comp".to_string(), q_row[2]);
            skill_map.insert("skill_synthesis".to_string(), q_row[3]);

            items.insert(
                id.to_string(),
                QMatrixItem {
                    item_id: id.to_string(),
                    name: name.to_string(),
                    category: cat.to_string(),
                    skills: skill_map,
                },
            );
        }

        Self {
            domain_id: "classical_discourse".to_string(),
            domain_name: "Academic Discourse & Rhetorical Analysis".to_string(),
            skills,
            items,
        }
    }

    /// Cognitive & Thailand 4.0 Competencies, ESL Acquisition & MANOVA Orientations Q-Matrix
    pub fn thailand_4_0() -> Self {
        let skills = vec![
            LatentSkill {
                id: "skill_comp_thinking".to_string(),
                name: "Computational Thinking & Algorithmic Reasoning".to_string(),
                benchmark_target: 0.85,
            },
            LatentSkill {
                id: "skill_critical_inquiry".to_string(),
                name: "Critical Inquiry & Deductive Verification".to_string(),
                benchmark_target: 0.80,
            },
            LatentSkill {
                id: "skill_esl_receptive_productive".to_string(),
                name: "ESL Receptive/Productive Balance".to_string(),
                benchmark_target: 0.85,
            },
            LatentSkill {
                id: "skill_esl_syntactic_latency".to_string(),
                name: "Syntactic Accuracy & Real-Time Latency".to_string(),
                benchmark_target: 0.75,
            },
            LatentSkill {
                id: "skill_manova_activity_orientation".to_string(),
                name: "Activity Orientation (GAO / IAO / PO)".to_string(),
                benchmark_target: 0.70,
            },
            LatentSkill {
                id: "skill_bigfive_conscientiousness".to_string(),
                name: "Conscientiousness & Engagement Velocity".to_string(),
                benchmark_target: 0.80,
            },
        ];

        let mut items = HashMap::new();
        let raw_items = vec![
            (
                "item_t4_algo_decomp",
                "T4.0 Algorithmic Decomposition & Abstraction Challenge",
                "quiz",
                [1, 1, 0, 0, 0, 1],
            ),
            (
                "item_t4_deductive_eval",
                "Critical Inquiry: Source Credibility & Fallacy Deduction",
                "quiz",
                [0, 1, 0, 0, 0, 1],
            ),
            (
                "item_esl_audio_retention",
                "ESL Diagnostic: Listening Retention vs Productive Speech",
                "quiz",
                [0, 0, 1, 1, 0, 0],
            ),
            (
                "item_esl_cloze_latency",
                "ESL Speed: Interactive Gamified Syntactic Cloze",
                "homework",
                [1, 0, 1, 1, 0, 1],
            ),
            (
                "item_manova_group_project",
                "MANOVA: Group Activity vs Project Orientation Sprint",
                "homework",
                [1, 1, 0, 0, 1, 1],
            ),
            (
                "item_onet_benchmark_exam",
                "National O-NET Benchmark: Mathematics & English Velocity",
                "midterm",
                [1, 1, 1, 1, 0, 1],
            ),
            (
                "item_gpa_velocity_tracking",
                "Longitudinal GPA Velocity & Mission Completion Audit",
                "midterm",
                [1, 0, 0, 1, 1, 1],
            ),
            (
                "item_multiplayer_solution",
                "Capstone: Multiplayer Digital Sandbox Solution Rate",
                "final",
                [1, 1, 1, 0, 1, 1],
            ),
        ];

        for (id, name, cat, q_row) in raw_items {
            let mut skill_map = HashMap::new();
            skill_map.insert("skill_comp_thinking".to_string(), q_row[0]);
            skill_map.insert("skill_critical_inquiry".to_string(), q_row[1]);
            skill_map.insert("skill_esl_receptive_productive".to_string(), q_row[2]);
            skill_map.insert("skill_esl_syntactic_latency".to_string(), q_row[3]);
            skill_map.insert("skill_manova_activity_orientation".to_string(), q_row[4]);
            skill_map.insert("skill_bigfive_conscientiousness".to_string(), q_row[5]);

            items.insert(
                id.to_string(),
                QMatrixItem {
                    item_id: id.to_string(),
                    name: name.to_string(),
                    category: cat.to_string(),
                    skills: skill_map,
                },
            );
        }

        Self {
            domain_id: "thailand_4_0".to_string(),
            domain_name: "Cognitive, Thailand 4.0 & ESL MANOVA Psychometrics".to_string(),
            skills,
            items,
        }
    }
}

impl Default for CurriculumQMatrix {
    fn default() -> Self {
        Self::thailand_4_0()
    }
}

