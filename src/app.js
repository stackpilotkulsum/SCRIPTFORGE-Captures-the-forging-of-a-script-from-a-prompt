// ============================================================
// SCRIPTFORGE — Main Application Controller
// Ties all views and engines together
// ============================================================

import { WorldBible } from './engine/world-bible.js';
import { WorldGenesisEngine } from './engine/world-genesis.js';
import { StoryEngine } from './engine/story-engine.js';
import { ConsistencyChecker } from './engine/consistency-checker.js';

import { GenesisView } from './ui/genesis-view.js';
import { WorldMapView } from './ui/world-map-view.js';
import { CharactersView } from './ui/characters-view.js';
import { FactionsView } from './ui/factions-view.js';
import { TimelineView } from './ui/timeline-view.js';
import { StoryView } from './ui/story-view.js';
import { ConsistencyView } from './ui/consistency-view.js';

class ScriptForgeApp {
  constructor() {
    this.bible = null;
    this.storyEngine = null;
    this.consistencyChecker = null;
    this.currentView = 'genesis';
    this.worldGenerated = false;

    this.views = {
      genesis: new GenesisView(this),
      map: new WorldMapView(this),
      characters: new CharactersView(this),
      factions: new FactionsView(this),
      timeline: new TimelineView(this),
      stories: new StoryView(this),
      consistency: new ConsistencyView(this)
    };

    // Make app globally accessible for onclick handlers
    window.app = this;
  }

  init() {
    this.renderApp();
    this.initParticles();
  }

  // ── Rendering ─────────────────────────────────────────────

  renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div id="background-effects">
        <div class="nebula nebula-1"></div>
        <div class="nebula nebula-2"></div>
        <div class="nebula nebula-3"></div>
      </div>
      <canvas id="particles-canvas"></canvas>
      
      ${this._renderHeader()}
      
      <main class="app-content" id="main-content">
        ${this._renderView()}
      </main>
    `;

    this._afterRender();
  }

  _renderHeader() {
    const navItems = [
      { id: 'map', icon: '🗺️', label: 'World Map' },
      { id: 'characters', icon: '👥', label: 'Characters' },
      { id: 'factions', icon: '⚔️', label: 'Factions' },
      { id: 'timeline', icon: '⏳', label: 'Timeline' },
      { id: 'stories', icon: '📜', label: 'Stories' },
      { id: 'consistency', icon: '🛡️', label: 'Integrity' }
    ];

    return `
      <header class="app-header">
        <div class="logo" onclick="window.app.navigateTo('genesis')">
          <div class="logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2L35 12V28L20 38L5 28V12L20 2Z" stroke="url(#logoGrad)" stroke-width="1.5" fill="none"/>
              <path d="M20 8L29 14V26L20 32L11 26V14L20 8Z" stroke="url(#logoGrad)" stroke-width="1" fill="rgba(139,92,246,0.1)"/>
              <path d="M20 14L24 17V23L20 26L16 23V17L20 14Z" fill="url(#logoGrad)"/>
              <circle cx="20" cy="20" r="2" fill="#F59E0B"/>
              <defs>
                <linearGradient id="logoGrad" x1="5" y1="2" x2="35" y2="38">
                  <stop stop-color="#8B5CF6"/>
                  <stop offset="0.5" stop-color="#F59E0B"/>
                  <stop offset="1" stop-color="#06B6D4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div class="logo-text">SCRIPTFORGE</div>
            <div class="logo-subtitle">Infinite Worldbuilding</div>
          </div>
        </div>
        
        ${this.worldGenerated ? `
          <nav class="header-nav">
            ${navItems.map(item => `
              <button class="nav-btn ${this.currentView === item.id ? 'active' : ''}" 
                      onclick="window.app.navigateTo('${item.id}')"
                      id="nav-${item.id}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
              </button>
            `).join('')}
          </nav>
          
          <div class="header-stats">
            ${this.bible ? `
              <div class="stat-item">
                <span class="stat-value">${this.bible.getStats().totalEntities}</span>
                <span class="stat-label">Entities</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${this.bible.getStats().generationCount}</span>
                <span class="stat-label">Stories</span>
              </div>
              <div class="stat-item tooltip" data-tooltip="World consistency score">
                <span class="stat-value" style="color: ${this.bible.metadata.consistencyScore >= 90 ? 'var(--accent-emerald)' : 'var(--accent-gold)'}">
                  ${this.bible.metadata.consistencyScore}%
                </span>
                <span class="stat-label">Health</span>
              </div>
            ` : ''}
          </div>
        ` : `
          <div class="header-stats">
            <span style="font-size: 0.8rem; color: var(--text-muted); letter-spacing: 1px;">⚒️ Forge a world to begin</span>
          </div>
        `}
      </header>
    `;
  }

  _renderView() {
    const view = this.views[this.currentView];
    if (!view) return '';
    return view.render();
  }

  renderCurrentView() {
    const main = document.getElementById('main-content');
    if (main) {
      main.innerHTML = this._renderView();
      this._afterRender();
    }
  }

  _afterRender() {
    // Initialize map canvas if we're on the map view
    if (this.currentView === 'map' && this.views.map) {
      requestAnimationFrame(() => {
        this.views.map.initMapCanvas();
      });
    }
  }

  // ── Navigation ────────────────────────────────────────────

  navigateTo(viewId, entityId) {
    if (viewId !== 'genesis' && !this.worldGenerated) return;
    
    this.currentView = viewId;
    this.renderApp();
    
    // Handle entity-specific navigation
    if (entityId) {
      requestAnimationFrame(() => {
        if (viewId === 'characters' && this.views.characters) {
          this.views.characters.showDetail(entityId);
        }
      });
    }
  }

  // ── World Genesis ─────────────────────────────────────────

  async startGenesis() {
    const promptEl = document.getElementById('genesis-prompt');
    const prompt = promptEl ? promptEl.value.trim() : '';
    
    if (!prompt) {
      // Use default demo prompt
      this.quickStart('dying empire');
      return;
    }

    await this._runGenesis(prompt);
  }

  async quickStart(type) {
    const prompts = {
      'dying empire': 'A dying empire on a gas giant, ruled by wind priests who harvest the breath of storms to fuel their civilization. As the great tempests weaken, so does their power — and the factions below begin to rise.',
      'underwater': 'An ancient underwater civilization in the Mariana Trench, where bioluminescent coral cities are powered by geothermal vents. A mysterious darkness rises from the deepest abyss.',
      'crystal': 'Nomadic tribes crossing an endless crystal desert, where the shattered remains of a dead god form the landscape. Each crystal shard contains a memory of the divine.'
    };
    
    const prompt = prompts[type] || prompts['dying empire'];
    
    // Set the prompt in the input
    const promptEl = document.getElementById('genesis-prompt');
    if (promptEl) promptEl.value = prompt;
    
    await this._runGenesis(prompt);
  }

  async _runGenesis(prompt) {
    const genesisView = this.views.genesis;
    genesisView.showProgress();

    try {
      this.bible = await WorldGenesisEngine.generate(prompt, {
        useDemo: true,
        onProgress: (phase, detail) => {
          genesisView.updateProgress(phase, detail);
        }
      });

      this.storyEngine = new StoryEngine(this.bible);
      this.consistencyChecker = new ConsistencyChecker(this.bible);
      this.worldGenerated = true;

      // Brief pause to show completion
      await new Promise(r => setTimeout(r, 800));

      // Navigate to the world map
      this.navigateTo('map');

    } catch (error) {
      console.error('Genesis failed:', error);
    }
  }

  // ── Story Generation Actions ──────────────────────────────

  generateStoryFor(characterId) {
    // Close any modals
    if (this.views.characters) this.views.characters.hideDetail();
    
    // Navigate to stories view and generate
    this.currentView = 'stories';
    this.views.stories.selectedChars = [characterId];
    this.views.stories.storyType = 'chronicle';
    this.views.stories.generate();
    this.renderApp();
  }

  generateArcFor(characterId) {
    if (this.views.characters) this.views.characters.hideDetail();
    
    this.currentView = 'stories';
    this.views.stories.selectedChars = [characterId];
    this.views.stories.storyType = 'character_arc';
    this.views.stories.generate();
    this.renderApp();
  }

  selectLocation(locationId) {
    if (this.views.map) {
      this.views.map.selectedLocation = locationId;
      this.renderCurrentView();
    }
  }

  // ── Particle System ───────────────────────────────────────

  initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3 - 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.7 
        ? `rgba(139, 92, 246, ${Math.random() * 0.3})`
        : Math.random() > 0.5 
          ? `rgba(245, 158, 11, ${Math.random() * 0.2})`
          : `rgba(6, 182, 212, ${Math.random() * 0.2})`,
      life: Math.random() * 200 + 100,
      maxLife: 300
    });

    const init = () => {
      resize();
      particles = Array.from({ length: 60 }, createParticle);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;

        if (p.life <= 0 || p.x < -10 || p.x > canvas.width + 10 || p.y < -10 || p.y > canvas.height + 10) {
          particles[i] = createParticle();
          particles[i].y = canvas.height + 10;
          continue;
        }

        const fadeRatio = Math.min(p.life / 50, 1);
        ctx.globalAlpha = p.opacity * fadeRatio;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    init();
    animate();

    // Cleanup reference
    this._particleCleanup = () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }
}

// ── Bootstrap ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const app = new ScriptForgeApp();
  app.init();
});
