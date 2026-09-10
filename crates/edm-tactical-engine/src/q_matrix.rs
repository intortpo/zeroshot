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
    pub skills: Vec<LatentSkill>,
    pub items: HashMap<String, QMatrixItem>,
}

impl Default for CurriculumQMatrix {
    fn default() -> Self {
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

        Self { skills, items }
    }
}
