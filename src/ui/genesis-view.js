// ============================================================
// SCRIPTFORGE — Genesis View
// The "Create World" experience with dramatic animations
// ============================================================

export class GenesisView {
  constructor(app) {
    this.app = app;
    this.isGenerating = false;
    this.phases = [
      { key: 'lore', icon: '📜', label: 'Forging world rules & lore' },
      { key: 'geography', icon: '🗺️', label: 'Mapping the realms' },
      { key: 'factions', icon: '⚔️', label: 'Weaving threads of power' },
      { key: 'characters', icon: '👤', label: 'Breathing life into souls' },
      { key: 'relationships', icon: '🔗', label: 'Connecting fates & bonds' },
      { key: 'timeline', icon: '⏳', label: 'Inscribing history' },
      { key: 'artifacts', icon: '💎', label: 'Unearthing ancient relics' },
      { key: 'complete', icon: '✨', label: 'World forged!' }
    ];
  }

  render() {
    return `
      <div class="genesis-container" id="genesis-view">
        <div class="genesis-card glass-panel">
          <div class="glass-panel-inner">
            <div id="genesis-input-section">
              <h1 class="genesis-title">Forge Your World</h1>
              <p class="genesis-subtitle">
                Describe a world, and SCRIPTFORGE will build a living universe — 
                complete with lore, characters, factions, history, and consistent stories 
                that never contradict themselves.
              </p>
              
              <div class="genesis-input-wrapper">
                <textarea 
                  class="genesis-input" 
                  id="genesis-prompt"
                  placeholder="A dying empire on a gas giant, ruled by wind priests who harvest the breath of storms..."
                  spellcheck="false"
                ></textarea>
              </div>
              
              <button class="btn btn-primary btn-lg genesis-forge-btn" id="genesis-forge-btn" onclick="window.app.startGenesis()">
                ⚒️ FORGE THIS WORLD
              </button>
              
              <div class="genesis-quickstart">
                <span class="quickstart-chip" onclick="window.app.quickStart('dying empire')">🌪️ Dying Empire on a Gas Giant</span>
                <span class="quickstart-chip" onclick="window.app.quickStart('underwater')">🌊 Underwater Kingdom</span>
                <span class="quickstart-chip" onclick="window.app.quickStart('crystal')">💎 Crystal Desert Nomads</span>
              </div>
            </div>
            
            <div id="genesis-progress-section" class="hidden">
              <h2 class="genesis-title" style="font-size: 2rem;">Forging World...</h2>
              <p class="genesis-subtitle" id="genesis-status-text">Initializing the forge...</p>
              
              <div class="genesis-progress">
                ${this.phases.map(phase => `
                  <div class="progress-phase" id="phase-${phase.key}">
                    <span class="phase-icon">${phase.icon}</span>
                    <span class="phase-text">${phase.label}</span>
                  </div>
                `).join('')}
              </div>
              
              <div class="progress-bar-container mt-lg">
                <div class="progress-bar-fill" id="genesis-progress-bar" style="width: 0%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showProgress() {
    const inputSection = document.getElementById('genesis-input-section');
    const progressSection = document.getElementById('genesis-progress-section');
    if (inputSection) inputSection.classList.add('hidden');
    if (progressSection) progressSection.classList.remove('hidden');
  }

  updateProgress(phaseKey, detail) {
    const phaseIdx = this.phases.findIndex(p => p.key === phaseKey);
    if (phaseIdx === -1) return;
    
    // Update status text
    const statusText = document.getElementById('genesis-status-text');
    if (statusText) statusText.textContent = detail;
    
    // Mark previous phases as complete
    this.phases.forEach((phase, idx) => {
      const el = document.getElementById(`phase-${phase.key}`);
      if (!el) return;
      
      if (idx < phaseIdx) {
        el.classList.remove('active');
        el.classList.add('complete');
      } else if (idx === phaseIdx) {
        el.classList.add('active');
        el.classList.remove('complete');
      } else {
        el.classList.remove('active', 'complete');
      }
    });
    
    // Update progress bar
    const progress = ((phaseIdx + 1) / this.phases.length) * 100;
    const bar = document.getElementById('genesis-progress-bar');
    if (bar) bar.style.width = `${progress}%`;
  }
}
