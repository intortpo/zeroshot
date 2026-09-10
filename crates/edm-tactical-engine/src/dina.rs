use crate::q_matrix::CurriculumQMatrix;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DinaLatentProfile {
    pub mastery_vector: Vec<u8>,
    pub mastery_probabilities: HashMap<String, f64>,
    pub slip_parameter: f64,
    pub guess_parameter: f64,
}

pub struct DinaEstimator {
    pub default_slip: f64,
    pub default_guess: f64,
}

impl Default for DinaEstimator {
    fn default() -> Self {
        Self {
            default_slip: 0.10,
            default_guess: 0.15,
        }
    }
}

impl DinaEstimator {
    pub fn new(slip: f64, guess: f64) -> Self {
        Self {
            default_slip: slip,
            default_guess: guess,
        }
    }

    /// Evaluates DINA latent mastery probabilities from item response array
    pub fn estimate_profile(
        &self,
        responses: &HashMap<String, u8>,
        q_matrix: &CurriculumQMatrix,
    ) -> DinaLatentProfile {
        let mut mastery_probabilities = HashMap::new();
        let mut mastery_vector = Vec::new();

        for skill in &q_matrix.skills {
            let mut evidence: f64 = 0.0;
            let mut count: usize = 0;

            for (item_id, item) in &q_matrix.items {
                if let Some(&req) = item.skills.get(&skill.id) {
                    if req == 1 {
                        count += 1;
                        if let Some(&y_ij) = responses.get(item_id) {
                            if y_ij == 1 {
                                evidence += 1.0 - self.default_guess;
                            } else {
                                evidence -= 1.0 - self.default_slip;
                            }
                        } else {
                            // Missing response penalized as non-mastery
                            evidence -= 1.0 - self.default_slip;
                        }
                    }
                }
            }

            let effective_count = count.max(1) as f64;
            let z = evidence / effective_count;
            // Sigmoid activation
            let prob = 1.0 / (1.0 + (-2.5 * z).exp());
            let rounded_prob = (prob * 1000.0).round() / 1000.0;

            mastery_probabilities.insert(skill.id.clone(), rounded_prob);
            mastery_vector.push(if rounded_prob >= 0.55 { 1 } else { 0 });
        }

        DinaLatentProfile {
            mastery_vector,
            mastery_probabilities,
            slip_parameter: self.default_slip,
            guess_parameter: self.default_guess,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dina_estimation_quantum_computing() {
        let q_matrix = CurriculumQMatrix::quantum_computing();
        let estimator = DinaEstimator::default();

        let mut responses = HashMap::new();
        responses.insert("item_q1_bloch".to_string(), 1);
        responses.insert("item_q2_hadamard_z".to_string(), 1);
        responses.insert("item_q3_pauli_basis".to_string(), 1);
        responses.insert("item_hw_bell_state".to_string(), 1);
        responses.insert("item_hw_cnot_parity".to_string(), 1);
        responses.insert("item_midterm_qft".to_string(), 1);
        responses.insert("item_midterm_teleport".to_string(), 1);
        responses.insert("item_final_qpe_shor".to_string(), 1);

        let profile = estimator.estimate_profile(&responses, &q_matrix);
        assert_eq!(profile.mastery_vector, vec![1, 1, 1, 1]);
        assert!(profile.mastery_probabilities["skill_superposition"] > 0.8);
        assert!(profile.mastery_probabilities["skill_qpe"] > 0.8);
    }

    #[test]
    fn test_dina_estimation_classical_discourse() {
        let q_matrix = CurriculumQMatrix::classical_discourse();
        let estimator = DinaEstimator::default();

        let mut responses = HashMap::new();
        responses.insert("item_q1_vocab".to_string(), 1);
        responses.insert("item_q2_cloze".to_string(), 1);
        responses.insert("item_q3_grammar_fix".to_string(), 1);
        responses.insert("item_hw_comprehend".to_string(), 1);
        responses.insert("item_hw_short_synth".to_string(), 1);
        responses.insert("item_midterm_essay".to_string(), 1);
        responses.insert("item_midterm_critique".to_string(), 1);
        responses.insert("item_final_case".to_string(), 1);

        let profile = estimator.estimate_profile(&responses, &q_matrix);
        assert_eq!(profile.mastery_vector, vec![1, 1, 1, 1]);
        assert!(profile.mastery_probabilities["skill_vocab"] > 0.8);
    }
}
