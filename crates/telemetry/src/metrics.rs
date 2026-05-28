use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::Mutex;

const MAX_SAMPLES: usize = 1000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricSample {
    pub timestamp: DateTime<Utc>,
    pub name: String,
    pub value: f64,
    pub labels: std::collections::HashMap<String, String>,
}

pub struct MetricsCollector {
    samples: Mutex<VecDeque<MetricSample>>,
}

impl MetricsCollector {
    pub fn new() -> Self {
        Self {
            samples: Mutex::new(VecDeque::with_capacity(MAX_SAMPLES)),
        }
    }

    pub fn record(&self, name: impl Into<String>, value: f64) {
        self.record_with_labels(name, value, Default::default());
    }

    pub fn record_with_labels(
        &self,
        name: impl Into<String>,
        value: f64,
        labels: std::collections::HashMap<String, String>,
    ) {
        let sample = MetricSample {
            timestamp: Utc::now(),
            name: name.into(),
            value,
            labels,
        };

        let mut samples = self.samples.lock().unwrap();
        if samples.len() >= MAX_SAMPLES {
            samples.pop_front();
        }
        samples.push_back(sample);
    }

    pub fn recent(&self, n: usize) -> Vec<MetricSample> {
        self.samples
            .lock()
            .unwrap()
            .iter()
            .rev()
            .take(n)
            .cloned()
            .collect()
    }

    pub fn by_name(&self, name: &str) -> Vec<MetricSample> {
        self.samples
            .lock()
            .unwrap()
            .iter()
            .filter(|s| s.name == name)
            .cloned()
            .collect()
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}
