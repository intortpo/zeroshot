use crate::dina::{DinaEstimator, DinaLatentProfile};
use crate::q_matrix::CurriculumQMatrix;
use crate::tactical_risk::{ModelHyperplane, TacticalRiskAlert, TacticalRiskClassifier};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TacticalEvaluationRequest {
    pub student_id: String,
    pub responses: HashMap<String, u8>,
    pub norm_attendance: f64,
    pub norm_homework: f64,
    pub velocity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TacticalEvaluationResponse {
    pub student_id: String,
    pub diagnostic_profile: DinaLatentProfile,
    pub risk_alert: TacticalRiskAlert,
    pub model_source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeightUpdateRequest {
    pub weights: Vec<f64>,
    pub bias: f64,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeightUpdateResponse {
    pub status: String,
    pub previous_source: String,
    pub active_hyperplane: ModelHyperplane,
}

pub struct TacticalEngineState {
    pub q_matrix: CurriculumQMatrix,
    pub dina_estimator: DinaEstimator,
    pub classifier: Arc<RwLock<TacticalRiskClassifier>>,
}

impl Default for TacticalEngineState {
    fn default() -> Self {
        Self {
            q_matrix: CurriculumQMatrix::default(),
            dina_estimator: DinaEstimator::default(),
            classifier: Arc::new(RwLock::new(TacticalRiskClassifier::default())),
        }
    }
}

impl TacticalEngineState {
    pub fn evaluate_student(&self, req: &TacticalEvaluationRequest) -> TacticalEvaluationResponse {
        let profile = self
            .dina_estimator
            .estimate_profile(&req.responses, &self.q_matrix);

        let classifier = self.classifier.read();
        let risk = classifier.evaluate(
            &profile,
            req.norm_attendance,
            req.norm_homework,
            req.velocity,
        );
        let model_source = classifier.hyperplane.source.clone();

        TacticalEvaluationResponse {
            student_id: req.student_id.clone(),
            diagnostic_profile: profile,
            risk_alert: risk,
            model_source,
        }
    }

    pub fn update_weights(&self, req: &WeightUpdateRequest) -> WeightUpdateResponse {
        let mut classifier = self.classifier.write();
        let previous_source = classifier.hyperplane.source.clone();
        classifier.update_weights(req.weights.clone(), req.bias, req.source.clone());

        WeightUpdateResponse {
            status: "weights_updated".to_string(),
            previous_source,
            active_hyperplane: classifier.hyperplane.clone(),
        }
    }
}
