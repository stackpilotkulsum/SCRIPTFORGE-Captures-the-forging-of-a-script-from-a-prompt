// ============================================================
// SCRIPTFORGE — Consistency View
// Lore health dashboard and contradiction log
// ============================================================

export class ConsistencyView {
  constructor(app) {
    this.app = app;
  }

  render() {
    const bible = this.app.bible;
    const checker = this.app.consistencyChecker;
    
    if (!bible) return '<div class="empty-state"><div class="empty-icon">🛡️</div><h3 class="empty-title">No World Forged</h3></div>';
    
    const health = checker.getWorldHealth();
    const recentIssues = checker.getRecentIssues(15);
    const stats = bible.getStats();
    
    return `
      <div class="view-container view-enter">
        <div class="section-header">
          <h1 class="section-title">World Integrity</h1>
          <p class="section-subtitle">Monitor the consistency and health of ${bible.metadata.name}'s lore. Every generation is checked.</p>
          <div class="section-divider"></div>
        </div>
        
        <div class="grid-3" style="margin-bottom: var(--space-2xl);">
          <div class="glass-panel">
            <div class="glass-panel-inner text-center">
              <div class="health-score-ring">
                <svg viewBox="0 0 120 120">
                  <circle class="ring-bg" cx="60" cy="60" r="54" />
                  <circle class="ring-fill" cx="60" cy="60" r="54" 
                    style="stroke: ${this._getScoreColor(health.averageScore)}; stroke-dashoffset: ${339.292 - (339.292 * health.averageScore / 100)};" />
                </svg>
                <div class="health-score-value">${health.averageScore}%</div>
              </div>
              <div style="font-family: var(--font-display); font-size: 1.1rem; color: var(--text-primary);">Consistency Score</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-xs);">${health.statusEmoji} ${health.status}</div>
            </div>
          </div>
          
          <div class="glass-panel">
            <div class="glass-panel-inner">
              <div class="control-label">Checks Performed</div>
              <div style="font-family: var(--font-mono); font-size: 2rem; color: var(--accent-primary); margin: var(--space-md) 0;">${health.totalChecks}</div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-top: var(--space-lg);">
                <div>
                  <div style="font-family: var(--font-mono); font-size: 1.3rem; color: var(--severity-contradiction);">${health.totalContradictions}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Contradictions</div>
                </div>
                <div>
                  <div style="font-family: var(--font-mono); font-size: 1.3rem; color: var(--severity-warning);">${health.totalWarnings}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">Warnings</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="glass-panel">
            <div class="glass-panel-inner">
              <div class="control-label">World Bible Size</div>
              <div style="margin-top: var(--space-md);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Entities</span>
                  <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary);">${stats.totalEntities}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Relationships</span>
                  <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary);">${stats.relationships}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Timeline Events</span>
                  <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary);">${stats.timelineEvents}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">World Rules</span>
                  <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary);">${stats.rules}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Stories Generated</span>
                  <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary);">${stats.generationCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="glass-panel" style="margin-bottom: var(--space-2xl);">
          <div class="glass-panel-inner">
            <h3 class="section-title" style="font-size: 1.2rem;">World Rules</h3>
            <p class="text-muted mb-lg" style="font-size: 0.85rem;">The laws that govern ${bible.metadata.name}. Every story is checked against these.</p>
            
            <div class="grid-2">
              ${bible.rules.map(rule => `
                <div class="card" style="cursor: default;">
                  <div class="card-header">
                    <div class="card-icon">${this._getRuleCategoryIcon(rule.category)}</div>
                    <div>
                      <div class="card-title" style="font-size: 0.95rem;">${rule.name}</div>
                      <span class="tag tag-primary">${rule.category}</span>
                    </div>
                  </div>
                  <p class="card-description">${rule.description}</p>
                  ${rule.constraints && rule.constraints.length > 0 ? `
                    <div style="margin-top: var(--space-md);">
                      <div class="control-label" style="font-size: 0.65rem;">Constraints</div>
                      ${rule.constraints.map(c => `<div style="font-size: 0.8rem; color: var(--accent-rose); margin-top: 2px;">⚠ ${c}</div>`).join('')}
                    </div>
                  ` : ''}
                  ${rule.exceptions && rule.exceptions.length > 0 ? `
                    <div style="margin-top: var(--space-sm);">
                      <div class="control-label" style="font-size: 0.65rem;">Exceptions</div>
                      ${rule.exceptions.map(e => `<div style="font-size: 0.8rem; color: var(--accent-emerald); margin-top: 2px;">✦ ${e}</div>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="glass-panel">
          <div class="glass-panel-inner">
            <h3 class="section-title" style="font-size: 1.2rem;">Issue Log</h3>
            <p class="text-muted mb-lg" style="font-size: 0.85rem;">
              ${recentIssues.length > 0 
                ? `Showing ${recentIssues.length} most recent issues from consistency checks.`
                : 'No issues found yet. Generate stories to see consistency checks in action.'}
            </p>
            
            ${recentIssues.length > 0 
              ? recentIssues.map(issue => `
                  <div class="issue-item">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xs);">
                      <div class="issue-severity ${issue.severity.toLowerCase()}">
                        ${this._getSeverityIcon(issue.severity)} ${issue.severity} · ${issue.type.replace(/_/g, ' ')}
                      </div>
                      <span style="font-size: 0.7rem; color: var(--text-muted);">${issue.storyTitle || ''}</span>
                    </div>
                    <div class="issue-message">${issue.message}</div>
                    ${issue.suggestion ? `<div class="issue-suggestion">💡 ${issue.suggestion}</div>` : ''}
                  </div>
                `).join('')
              : `
                <div class="empty-state" style="padding: var(--space-xl);">
                  <div class="empty-icon" style="font-size: 2.5rem;">🛡️</div>
                  <h3 class="empty-title" style="font-size: 1.1rem;">All Clear</h3>
                  <p class="empty-desc" style="font-size: 0.85rem;">Generate stories from the Story Forge to see the Consistency Checker in action.</p>
                </div>
              `
            }
          </div>
        </div>
      </div>
    `;
  }

  _getScoreColor(score) {
    if (score >= 90) return 'var(--accent-emerald)';
    if (score >= 70) return 'var(--accent-gold)';
    if (score >= 50) return '#F97316';
    return 'var(--accent-rose)';
  }

  _getSeverityIcon(severity) {
    const icons = { CONTRADICTION: '🔴', WARNING: '🟡', INFO: '🔵' };
    return icons[severity] || '⚪';
  }

  _getRuleCategoryIcon(category) {
    const icons = { magic: '✨', physics: '🌌', social: '👥', biological: '🧬' };
    return icons[category] || '📋';
  }
}
