// ============================================================
// SCRIPTFORGE — Story View
// Story reader + generator with consistency dashboard
// ============================================================

export class StoryView {
  constructor(app) {
    this.app = app;
    this.currentStory = null;
    this.storyType = 'chronicle';
    this.selectedChars = [];
  }

  render() {
    const bible = this.app.bible;
    if (!bible) return '<div class="empty-state"><div class="empty-icon">📜</div><h3 class="empty-title">No World Forged</h3></div>';
    
    const storyEngine = this.app.storyEngine;
    const storyTypes = storyEngine.getStoryTypes();
    const characters = bible.getCharacters();
    const stories = storyEngine.generatedStories;
    
    return `
      <div class="view-container view-enter">
        <div class="section-header">
          <h1 class="section-title">Story Forge</h1>
          <p class="section-subtitle">Generate lore-consistent stories, dialogues, and prophecies. Every tale is checked against the World Bible.</p>
          <div class="section-divider"></div>
        </div>
        
        <div class="story-layout">
          <div class="story-reader">
            ${this.currentStory ? this._renderStory(this.currentStory) : this._renderStoryList(stories)}
          </div>
          
          <div class="story-controls">
            <div class="glass-panel">
              <div class="glass-panel-inner">
                <h3 class="section-title" style="font-size: 1.1rem;">Generate Story</h3>
                
                <div class="control-group">
                  <div class="control-label">Story Type</div>
                  <div style="display: flex; flex-wrap: wrap; gap: var(--space-xs);">
                    ${storyTypes.map(type => `
                      <span class="era-chip ${this.storyType === type.id ? 'active' : ''}" 
                            onclick="window.app.views.stories.setType('${type.id}')"
                            title="${type.description}">
                        ${type.icon} ${type.name}
                      </span>
                    `).join('')}
                  </div>
                </div>
                
                <div class="control-group">
                  <div class="control-label">Characters (optional)</div>
                  <div style="display: flex; flex-wrap: wrap; gap: var(--space-xs);">
                    ${characters.slice(0, 8).map(c => `
                      <span class="era-chip ${this.selectedChars.includes(c.id) ? 'active' : ''}" 
                            onclick="window.app.views.stories.toggleChar('${c.id}')"
                            style="font-size: 0.75rem;">
                        ${c.name.split(' ')[0]}
                      </span>
                    `).join('')}
                  </div>
                </div>
                
                <button class="btn btn-primary w-full mt-lg" onclick="window.app.views.stories.generate()">
                  ⚒️ Forge Story
                </button>
                
                ${stories.length > 0 ? `
                  <div style="margin-top: var(--space-xl); padding-top: var(--space-lg); border-top: 1px solid var(--glass-border);">
                    <div class="control-label">Generated Stories (${stories.length})</div>
                    <div style="margin-top: var(--space-sm); max-height: 200px; overflow-y: auto;">
                      ${stories.slice().reverse().map(s => `
                        <div class="card" style="padding: var(--space-sm) var(--space-md); margin-bottom: var(--space-xs); font-size: 0.8rem;" 
                             onclick="window.app.views.stories.showStory('${s.id}')">
                          <div style="color: var(--text-primary);">${s.title}</div>
                          <div style="color: var(--text-muted); font-size: 0.7rem;">${s.type} · ${s.wordCount} words</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderStory(story) {
    // Format the content - convert markdown-like formatting to HTML
    let formattedContent = story.content
      .split('\n\n')
      .map(p => {
        // Handle headings
        if (p.startsWith('# ')) return `<h1>${p.slice(2)}</h1>`;
        if (p.startsWith('## ')) return `<h2>${p.slice(3)}</h2>`;
        // Handle blockquotes
        if (p.startsWith('>')) {
          const lines = p.split('\n').map(l => l.replace(/^>\s?/, '')).join('<br>');
          return `<blockquote>${lines}</blockquote>`;
        }
        // Handle horizontal rules
        if (p.trim() === '---') return '<hr>';
        // Handle bold and italic
        let processed = p
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
        return `<p>${processed}</p>`;
      })
      .join('\n');
    
    // Get consistency report
    const checker = this.app.consistencyChecker;
    const report = checker.check(story);
    
    return `
      <div>
        <button class="btn btn-ghost mb-lg" onclick="window.app.views.stories.clearStory()">← Back to stories</button>
        
        <h1 class="story-title">${story.title}</h1>
        
        <div class="story-meta">
          <div class="story-meta-item">
            <span>📜</span>
            <span>${story.type}</span>
          </div>
          <div class="story-meta-item">
            <span>📊</span>
            <span>${story.wordCount} words</span>
          </div>
          ${story.tone ? `
            <div class="story-meta-item">
              <span>🎭</span>
              <span>${story.tone}</span>
            </div>
          ` : ''}
          ${story.characters && story.characters.length > 0 ? `
            <div class="story-meta-item">
              <span>👥</span>
              <span>${story.characters.map(c => c.name).join(', ')}</span>
            </div>
          ` : ''}
        </div>
        
        ${report ? this._renderConsistencyBadge(report) : ''}
        
        <div class="story-content glass-panel" style="padding: var(--space-2xl);">
          ${formattedContent}
        </div>
        
        ${report && report.issues.length > 0 ? `
          <div class="glass-panel mt-xl">
            <div class="glass-panel-inner">
              <h3 class="section-title" style="font-size: 1.1rem;">Consistency Report</h3>
              <p class="text-muted mb-lg" style="font-size: 0.85rem;">${report.summary}</p>
              ${report.issues.map(issue => `
                <div class="issue-item">
                  <div class="issue-severity ${issue.severity.toLowerCase()}">${this._getSeverityIcon(issue.severity)} ${issue.severity}</div>
                  <div class="issue-message">${issue.message}</div>
                  ${issue.suggestion ? `<div class="issue-suggestion">💡 ${issue.suggestion}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderStoryList(stories) {
    if (stories.length === 0) {
      return `
        <div class="empty-state" style="min-height: 400px;">
          <div class="empty-icon">📜</div>
          <h3 class="empty-title">No Stories Yet</h3>
          <p class="empty-desc">Choose a story type and characters, then forge your first tale. Every story is checked against the World Bible for consistency.</p>
        </div>
      `;
    }
    
    return `
      <div class="grid-2">
        ${stories.slice().reverse().map(story => `
          <div class="card" onclick="window.app.views.stories.showStory('${story.id}')">
            <div class="card-header">
              <div class="card-icon">${this._getTypeIcon(story.type)}</div>
              <div>
                <div class="card-title">${story.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${story.type} · ${story.wordCount} words</div>
              </div>
            </div>
            <p class="card-description">${story.content.slice(0, 200).replace(/[#*_>]/g, '')}...</p>
            <div class="card-tags">
              ${story.tone ? `<span class="tag tag-primary">${story.tone}</span>` : ''}
              ${(story.characters || []).map(c => `<span class="tag tag-gold">${c.name.split(' ')[0]}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  _renderConsistencyBadge(report) {
    const color = report.score >= 90 ? 'var(--accent-emerald)' : 
                  report.score >= 70 ? 'var(--accent-gold)' : 'var(--accent-rose)';
    const icon = report.score >= 90 ? '✅' : report.score >= 70 ? '⚡' : '⚠️';
    
    return `
      <div style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: ${color}11; border: 1px solid ${color}33; border-radius: var(--radius-md); margin-bottom: var(--space-xl);">
        <span style="font-size: 1.2rem;">${icon}</span>
        <div>
          <div style="font-size: 0.85rem; color: ${color}; font-weight: 600;">Consistency Score: ${report.score}/100</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${report.summary}</div>
        </div>
      </div>
    `;
  }

  _getSeverityIcon(severity) {
    const icons = { CONTRADICTION: '🔴', WARNING: '🟡', INFO: '🔵' };
    return icons[severity] || '⚪';
  }

  _getTypeIcon(type) {
    const icons = { chronicle: '📜', dialogue: '💬', character_arc: '🎭', battle: '⚔️', prophecy: '🔮' };
    return icons[type] || '📝';
  }

  // ── Actions ──────────────────────────────────────────────

  setType(type) {
    this.storyType = type;
    this.app.renderCurrentView();
  }

  toggleChar(charId) {
    const idx = this.selectedChars.indexOf(charId);
    if (idx > -1) {
      this.selectedChars.splice(idx, 1);
    } else {
      this.selectedChars.push(charId);
    }
    this.app.renderCurrentView();
  }

  generate() {
    const storyEngine = this.app.storyEngine;
    const story = storyEngine.generate({
      type: this.storyType,
      characters: this.selectedChars.length > 0 ? this.selectedChars : undefined
    });
    
    this.currentStory = story;
    this.app.renderCurrentView();
  }

  showStory(storyId) {
    const story = this.app.storyEngine.generatedStories.find(s => s.id === storyId);
    if (story) {
      this.currentStory = story;
      this.app.renderCurrentView();
    }
  }

  clearStory() {
    this.currentStory = null;
    this.app.renderCurrentView();
  }
}
