// ============================================================
// SCRIPTFORGE — Factions View
// Political landscape with power dynamics visualization
// ============================================================

export class FactionsView {
  constructor(app) {
    this.app = app;
  }

  render() {
    const bible = this.app.bible;
    if (!bible) return '<div class="empty-state"><div class="empty-icon">⚔️</div><h3 class="empty-title">No World Forged</h3></div>';
    
    const factions = bible.getFactions();
    
    return `
      <div class="view-container view-enter">
        <div class="section-header">
          <h1 class="section-title">Factions & Politics</h1>
          <p class="section-subtitle">The powers that shape ${bible.metadata.name}. Alliances shift, rivalries burn, and the balance of power is always in flux.</p>
          <div class="section-divider"></div>
        </div>
        
        <div class="grid-2" style="margin-bottom: var(--space-2xl);">
          ${factions.map(faction => this._renderFactionCard(faction, bible)).join('')}
        </div>
        
        <div class="glass-panel" style="margin-bottom: var(--space-2xl);">
          <div class="glass-panel-inner">
            <h3 class="section-title" style="font-size: 1.3rem;">Alliance Web</h3>
            <p class="text-muted mb-lg" style="font-size: 0.85rem;">Political relationships between factions</p>
            ${this._renderAllianceWeb(factions, bible)}
          </div>
        </div>
        
        <div class="glass-panel">
          <div class="glass-panel-inner">
            <h3 class="section-title" style="font-size: 1.3rem;">Power Balance</h3>
            <p class="text-muted mb-lg" style="font-size: 0.85rem;">Relative power and influence of each faction</p>
            ${this._renderPowerChart(factions)}
          </div>
        </div>
      </div>
    `;
  }

  _renderFactionCard(faction, bible) {
    const props = faction.properties || {};
    const members = bible.getCharactersByFaction(faction.id);
    const color = props.color || '#8B5CF6';
    
    return `
      <div class="card faction-card" style="cursor: default;">
        <div class="card-accent" style="background: ${color};"></div>
        <div style="padding-left: var(--space-sm);">
          <div class="faction-symbol">${props.symbol || '🏴'}</div>
          <h3 class="card-title" style="font-size: 1.2rem; color: ${color};">${faction.name}</h3>
          <p class="card-description" style="margin: var(--space-md) 0;">${faction.description}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-top: var(--space-lg);">
            <div>
              <div class="control-label">Ideology</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">${props.ideology || 'Unknown'}</p>
            </div>
            <div>
              <div class="control-label">Influence</div>
              <p style="font-size: 0.85rem; color: ${color};">${props.influence || 'Unknown'}</p>
            </div>
            <div>
              <div class="control-label">Strength</div>
              <p style="font-size: 0.85rem; color: var(--accent-emerald);">${props.strength || 'Unknown'}</p>
            </div>
            <div>
              <div class="control-label">Weakness</div>
              <p style="font-size: 0.85rem; color: var(--accent-rose);">${props.weakness || 'Unknown'}</p>
            </div>
          </div>
          
          <div class="faction-power-bar">
            <div class="faction-power-fill" style="width: ${props.power || 50}%; background: ${color};"></div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: var(--space-xs);">
            <span style="font-size: 0.7rem; color: var(--text-muted);">Power</span>
            <span style="font-size: 0.7rem; color: ${color}; font-family: var(--font-mono);">${props.power || 50}/100</span>
          </div>
          
          ${members.length > 0 ? `
            <div style="margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--glass-border);">
              <div class="control-label">Key Members (${members.length})</div>
              <div style="display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-top: var(--space-sm);">
                ${members.map(m => `
                  <span class="tag" style="color: ${color}; border-color: ${color}33; background: ${color}11; cursor: pointer;" 
                        onclick="window.app.navigateTo('characters', '${m.id}')">
                    ${m.name}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderAllianceWeb(factions, bible) {
    const rows = [];
    
    for (let i = 0; i < factions.length; i++) {
      for (let j = i + 1; j < factions.length; j++) {
        const rels = bible.getRelationshipsBetween(factions[i].id, factions[j].id);
        if (rels.length === 0) continue;
        
        const rel = rels[0];
        const color = rel.type === 'ALLIED_WITH' ? 'var(--accent-emerald)' : 
                      rel.type === 'ENEMY_OF' ? 'var(--accent-rose)' : 'var(--accent-gold)';
        const icon = rel.type === 'ALLIED_WITH' ? '🤝' : 
                     rel.type === 'ENEMY_OF' ? '⚔️' : '🔄';
        
        rows.push(`
          <div class="card" style="padding: var(--space-md); margin-bottom: var(--space-sm); cursor: default;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: var(--space-md);">
                <span style="font-size: 0.9rem; color: ${factions[i].properties.color};">${factions[i].properties.symbol || '🏴'} ${factions[i].name}</span>
                <span style="font-size: 1.2rem;">${icon}</span>
                <span style="font-size: 0.9rem; color: ${factions[j].properties.color};">${factions[j].properties.symbol || '🏴'} ${factions[j].name}</span>
              </div>
              <span class="tag" style="color: ${color}; border-color: ${color}; background: transparent;">${rel.type.replace(/_/g, ' ')}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-sm);">${rel.label || ''}</p>
            ${rel.strength ? `
              <div style="margin-top: var(--space-sm); height: 3px; background: rgba(255,255,255,0.05); border-radius: var(--radius-full); overflow: hidden;">
                <div style="width: ${rel.strength * 100}%; height: 100%; background: ${color}; border-radius: var(--radius-full);"></div>
              </div>
            ` : ''}
          </div>
        `);
      }
    }
    
    return rows.join('');
  }

  _renderPowerChart(factions) {
    const maxPower = Math.max(...factions.map(f => f.properties.power || 50));
    
    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        ${factions.map(f => {
          const power = f.properties.power || 50;
          const color = f.properties.color || '#8B5CF6';
          const width = (power / 100) * 100;
          
          return `
            <div style="display: flex; align-items: center; gap: var(--space-md);">
              <div style="width: 200px; flex-shrink: 0; display: flex; align-items: center; gap: var(--space-sm);">
                <span>${f.properties.symbol || '🏴'}</span>
                <span style="font-size: 0.85rem; color: ${color};">${f.name}</span>
              </div>
              <div style="flex: 1; height: 24px; background: rgba(255,255,255,0.03); border-radius: var(--radius-full); overflow: hidden; position: relative;">
                <div style="width: ${width}%; height: 100%; background: linear-gradient(90deg, ${color}44, ${color}); border-radius: var(--radius-full); transition: width 1.5s ease-out; display: flex; align-items: center; justify-content: flex-end; padding-right: var(--space-sm);">
                  <span style="font-family: var(--font-mono); font-size: 0.75rem; color: white; font-weight: 600;">${power}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}
