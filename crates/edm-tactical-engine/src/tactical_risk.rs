use crate::dina::DinaLatentProfile;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TacticalRiskAlert {
    pub risk_level: String, // "green" | "amber" | "red"
    pub status_label: String,
    pub risk_probability: f64,
    pub confidence_score: f64,
    pub low_confidence_trigger: bool,
    pub composite_velocity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelHyperplane {
    // Feature vector: [vocab, grammar, reading, synth, norm_attendance, norm_homework, velocity]
    pub weights: Vec<f64>,
    pub bias: f64,
    pub source: String, // "classical_baseline" or "quantum_recalibrated"
}

impl Default for ModelHyperplane {
    fn default() -> Self {
        Self {
            // Negative weights reduce risk, positive increase risk
            weights: vec![-1.8, -2.4, -1.5, -2.0, -2.5, -1.8, -3.2],
            bias: 3.5,
            source: "classical_baseline".to_string(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct TacticalRiskInput<'a> {
    pub dina_profile: &'a DinaLatentProfile,
    pub norm_attendance: f64,
    pub norm_homework: f64,
    pub velocity: f64,
}

#[derive(Debug, Clone, Default)]
pub struct TacticalRiskClassifier {
    pub hyperplane: ModelHyperplane,
}

impl TacticalRiskClassifier {
    pub fn new(hyperplane: ModelHyperplane) -> Self {
        Self { hyperplane }
    }

    pub fn update_weights(&mut self, weights: Vec<f64>, bias: f64, source: String) {
        self.hyperplane = ModelHyperplane {
            weights,
            bias,
            source,
        };
    }

    pub fn evaluate(&self, input: &TacticalRiskInput) -> TacticalRiskAlert {
        // Support both Quantum Computing skills and Classical Discourse skills
        let p_k1 = input
            .dina_profile
            .mastery_probabilities
            .get("skill_superposition")
            .or_else(|| input.dina_profile.mastery_probabilities.get("skill_vocab"))
            .copied()
            .unwrap_or(0.5);
        let p_k2 = input
            .dina_profile
            .mastery_probabilities
            .get("skill_pauli_measurement")
            .or_else(|| {
                input
                    .dina_profile
                    .mastery_probabilities
                    .get("skill_grammar")
            })
            .copied()
            .unwrap_or(0.5);
        let p_k3 = input
            .dina_profile
            .mastery_probabilities
            .get("skill_entanglement")
            .or_else(|| {
                input
                    .dina_profile
                    .mastery_probabilities
                    .get("skill_reading_comp")
            })
            .copied()
            .unwrap_or(0.5);
        let p_k4 = input
            .dina_profile
            .mastery_probabilities
            .get("skill_qpe")
            .or_else(|| {
                input
                    .dina_profile
                    .mastery_probabilities
                    .get("skill_synthesis")
            })
            .copied()
            .unwrap_or(0.5);

        let features = [
            p_k1,
            p_k2,
            p_k3,
            p_k4,
            input.norm_attendance,
            input.norm_homework,
            input.velocity,
        ];

        let mut z = self.hyperplane.bias;
        for (i, &f) in features.iter().enumerate() {
            if let Some(&w) = self.hyperplane.weights.get(i) {
                z += w * f;
            }
        }

        // Logistic sigmoid: P(Risk) = 1 / (1 + e^(-z))
        let risk_prob = 1.0 / (1.0 + (-z).exp());
        let rounded_prob = (risk_prob * 1000.0).round() / 1000.0;

        // Low confidence occurs when the probability hovers close to the decision boundary (0.50)
        let distance_from_margin = (rounded_prob - 0.5).abs();
        let confidence = (0.5 + distance_from_margin).min(0.99);
        let low_confidence_trigger = distance_from_margin < 0.12;

        let (risk_level, status_label) =
            if rounded_prob > 0.55 || input.velocity < -0.15 || input.norm_homework < 0.55 {
                (
                    "red".to_string(),
                    "High-Risk (Urgent Intervention Required)".to_string(),
                )
            } else if rounded_prob > 0.35 || input.velocity < -0.05 || input.norm_homework < 0.70 {
                (
                    "amber".to_string(),
                    "Moderate Risk (Latent Divergence)".to_string(),
                )
            } else {
                (
                    "green".to_string(),
                    "On-Track (Mastery Trajectory Stable)".to_string(),
                )
            };

        TacticalRiskAlert {
            risk_level,
            status_label,
            risk_probability: rounded_prob,
            confidence_score: (confidence * 1000.0).round() / 1000.0,
            low_confidence_trigger,
            composite_velocity: input.velocity,
        }
    }
}
