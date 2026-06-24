// ============================================================
// SCRIPTFORGE — Timeline View
// Historical timeline with era filtering
// ============================================================

export class TimelineView {
  constructor(app) {
    this.app = app;
    this.filterEra = 'all';
  }

  render() {
    const bible = this.app.bible;
    if (!bible) return '<div class="empty-state"><div class="empty-icon">⏳</div><h3 class="empty-title">No World Forged</h3></div>';
    
    const timeline = bible.timeline;
    const eras = [...new Set(timeline.map(e => e.era))];
    
    let filteredEvents = timeline;
    if (this.filterEra !== 'all') {
      filteredEvents = timeline.filter(e => e.era === this.filterEra);
    }
    
    return `
      <div class="view-container view-enter">
        <div class="section-header">
          <h1 class="section-title">Timeline of ${bible.metadata.name}</h1>
          <p class="section-subtitle">From the Arrival to the Present Crisis — a thousand years of triumph, sacrifice, and slow decay.</p>
          <div class="section-divider"></div>
        </div>
        
        <div class="era-filters">
          <span class="era-chip ${this.filterEra === 'all' ? 'active' : ''}" onclick="window.app.views.timeline.setFilter('all')">All Eras</span>
          ${eras.map(era => `
            <span class="era-chip ${this.filterEra === era ? 'active' : ''}" onclick="window.app.views.timeline.setFilter('${era}')">
              ${this._getEraIcon(era)} ${era.charAt(0).toUpperCase() + era.slice(1)}
            </span>
          `).join('')}
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 300px; gap: var(--space-xl);">
          <div class="timeline-container">
            <div class="timeline-line"></div>
            ${filteredEvents.map(event => this._renderTimelineEvent(event, bible)).join('')}
          </div>
          
          <div>
            <div class="glass-panel" style="position: sticky; top: var(--space-xl);">
              <div class="glass-panel-inner">
                <h3 class="section-title" style="font-size: 1.1rem;">Era Legend</h3>
                <div style="margin-top: var(--space-md);">
                  ${this._renderEraLegend()}
                </div>
                
                <div style="margin-top: var(--space-xl);">
                  <h4 class="control-label">World Age</h4>
                  <div style="font-family: var(--font-mono); font-size: 1.5rem; color: var(--accent-gold); margin-top: var(--space-sm);">
                    1,000 years
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-xs);">From the Arrival to Present</p>
                </div>
                
                <div style="margin-top: var(--space-xl);">
                  <h4 class="control-label">Key Events</h4>
                  <div style="font-family: var(--font-mono); font-size: 1.5rem; color: var(--accent-primary); margin-top: var(--space-sm);">
                    ${timeline.length}
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-xs);">
                    ${timeline.filter(e => e.importance === 'pivotal').length} pivotal · 
                    ${timeline.filter(e => e.importance === 'major').length} major · 
                    ${timeline.filter(e => e.importance === 'minor').length} minor
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderTimelineEvent(event, bible) {
    const dotClass = event.importance === 'pivotal' ? 'pivotal' : event.importance === 'major' ? 'major' : '';
    const yearDisplay = event.year < 0 ? `${Math.abs(event.year)} BA` : event.year === 0 ? 'Present' : `${event.year} AA`;
    
    // Get involved entity names
    const involvedNames = (event.involvedEntities || [])
      .map(id => bible.getEntity(id))
      .filter(Boolean)
      .map(e => e.name);
    
    return `
      <div class="timeline-event">
        <div class="timeline-dot ${dotClass}"></div>
        <div class="glass-panel" style="padding: var(--space-lg);">
          <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-sm);">
            <span class="timeline-year">${yearDisplay}</span>
            <span class="timeline-era">${event.era}</span>
            <span class="tag ${event.importance === 'pivotal' ? 'tag-rose' : event.importance === 'major' ? 'tag-gold' : 'tag-cyan'}" style="margin-left: auto;">
              ${event.importance}
            </span>
          </div>
          <h4 class="timeline-event-name">${event.name}</h4>
          <p class="timeline-event-desc">${event.description}</p>
          
          ${involvedNames.length > 0 ? `
            <div style="margin-top: var(--space-md); display: flex; flex-wrap: wrap; gap: var(--space-xs);">
              ${involvedNames.map(n => `<span class="tag tag-primary" style="font-size: 0.6rem;">${n}</span>`).join('')}
            </div>
          ` : ''}
          
          ${event.consequences && event.consequences.length > 0 ? `
            <div style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--glass-border);">
              <div class="control-label" style="margin-bottom: var(--space-xs);">Consequences</div>
              ${event.consequences.map(c => `<div style="font-size: 0.8rem; color: var(--accent-gold);">→ ${c}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderEraLegend() {
    const eras = [
      { name: 'Founding', icon: '🌅', color: '#A78BFA', desc: 'The Arrival and early settlement' },
      { name: 'Ascension', icon: '📈', color: '#10B981', desc: 'Rise of the Priesthood' },
      { name: 'Golden', icon: '✨', color: '#FBBF24', desc: 'Peak of civilization' },
      { name: 'Decline', icon: '📉', color: '#F59E0B', desc: 'Storms begin to weaken' },
      { name: 'Crisis', icon: '🔥', color: '#F43F5E', desc: 'The present emergency' }
    ];
    
    return eras.map(era => `
      <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-md);">
        <span style="font-size: 1.1rem;">${era.icon}</span>
        <div>
          <div style="font-size: 0.85rem; color: ${era.color}; font-weight: 600;">${era.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${era.desc}</div>
        </div>
      </div>
    `).join('');
  }

  _getEraIcon(era) {
    const icons = { founding: '🌅', ascension: '📈', golden: '✨', decline: '📉', crisis: '🔥' };
    return icons[era] || '📌';
  }

  setFilter(era) {
    this.filterEra = era;
    this.app.renderCurrentView();
  }
}
