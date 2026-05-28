use std::collections::HashMap;
use ovvy_core::game::GameState;
use uuid::Uuid;

pub struct StateTracker {
    states: HashMap<Uuid, GameState>,
}

impl StateTracker {
    pub fn new() -> Self {
        Self { states: HashMap::new() }
    }

    pub fn update(&mut self, account_id: Uuid, state: GameState) -> bool {
        let prev = self.states.insert(account_id, state.clone());
        prev.as_ref() != Some(&state)
    }

    pub fn get(&self, account_id: &Uuid) -> Option<&GameState> {
        self.states.get(account_id)
    }
}

impl Default for StateTracker {
    fn default() -> Self { Self::new() }
}
