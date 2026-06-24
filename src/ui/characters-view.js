// ============================================================
// SCRIPTFORGE — Characters View
// Character explorer with cards and relationship visualization
// ============================================================

export class CharactersView {
  constructor(app) {
    this.app = app;
    this.selectedCharacter = null;
    this.filterFaction = 'all';
  }

  render() {
    const bible = this.app.bible;
    if (!bible) return '<div class="empty-state"><div class="empty-icon">👤</div><h3 class="empty-title">No World Forged</h3></div>';
    
    const characters = bible.getCharacters();
    const factions = bible.getFactions();
    
    let filteredChars = characters;
    if (this.filterFaction !== 'all') {
      const members = bible.getCharactersByFaction(this.filterFaction);
      const memberIds = new Set(members.map(m => m.id));
      filteredChars = characters.filter(c => memberIds.has(c.id));
    }
    
    return `
      <div class="view-container view-enter">
        <div class="section-header">
          <h1 class="section-title">Characters</h1>
          <p class="section-subtitle">The souls of ${bible.metadata.name}. Each carries their own story, trauma, and destiny.</p>
          <div class="section-divider"></div>
        </div>
        
        <div class="era-filters" style="margin-bottom: var(--space-xl);">
          <span class="era-chip ${this.filterFaction === 'all' ? 'active' : ''}" onclick="window.app.views.characters.setFilter('all')">All</span>
          ${factions.map(f => `
            <span class="era-chip ${this.filterFaction === f.id ? 'active' : ''}" 
                  style="${this.filterFaction === f.id ? `border-color: ${f.properties.color}; color: ${f.properties.color}; background: ${f.properties.color}22;` : ''}"
                  onclick="window.app.views.characters.setFilter('${f.id}')">
              ${f.properties.symbol || '🏴'} ${f.name}
            </span>
          `).join('')}
        </div>
        
        <div class="character-grid">
          ${filteredChars.map(char => this._renderCharacterCard(char, bible)).join('')}
        </div>
        
        <div class="modal-overlay" id="character-modal">
          <div class="modal-content" id="character-modal-content">
          </div>
        </div>
      </div>
    `;
  }

  _renderCharacterCard(character, bible) {
    const props = character.properties || {};
    const faction = this._getCharacterFaction(character.id, bible);
    const senses = props.senses || {};
    
    return `
      <div class="character-card" onclick="window.app.views.characters.showDetail('${character.id}')">
        <div class="character-portrait" style="background: linear-gradient(135deg, ${faction ? faction.properties.color + '22' : 'var(--bg-surface)'}, var(--bg-elevated));">
          <div class="character-portrait-placeholder">${this._getCharacterEmoji(props)}</div>
          ${faction ? `
            <div class="character-faction-badge" style="background: ${faction.properties.color}22; border: 1px solid ${faction.properties.color}44; color: ${faction.properties.color};">
              ${faction.properties.symbol || ''} ${faction.name}
            </div>
          ` : ''}
        </div>
        <div class="character-info">
          <h3 class="character-name">${character.name}</h3>
          <div class="character-role">${props.role || 'Unknown Role'}</div>
          <p class="character-desc">${character.description}</p>
          
          ${typeof senses === 'object' && !Array.isArray(senses) ? `
            <div class="character-senses">
              ${this._renderSenseIndicator('👁️', 'Sight', senses.sight)}
              ${this._renderSenseIndicator('👂', 'Hearing', senses.hearing)}
              ${this._renderSenseIndicator('✋', 'Touch', senses.touch)}
              ${this._renderSenseIndicator('👃', 'Smell', senses.smell)}
              ${this._renderSenseIndicator('👅', 'Taste', senses.taste)}
              ${senses.sixth ? this._renderSenseIndicator('✨', 'Sixth', 'awakened') : ''}
              ${senses.pressure ? this._renderSenseIndicator('🌀', 'Pressure', 'awakened') : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderSenseIndicator(icon, label, status) {
    if (!status || status === 'Unknown') return '';
    const dotClass = status === 'intact' || status === 'heightened' || status === 'awakened' 
      ? 'active' 
      : (status === 'fading' || status === 'dulled' || status === 'slight damage') 
        ? 'fading' 
        : 'gone';
    return `
      <div class="sense-indicator" title="${label}: ${status}">
        <span>${icon}</span>
        <div class="sense-dot ${dotClass}"></div>
      </div>
    `;
  }

  showDetail(characterId) {
    const bible = this.app.bible;
    const character = bible.getEntity(characterId);
    if (!character) return;
    
    const props = character.properties || {};
    const relationships = bible.getRelationshipsFor(characterId);
    const faction = this._getCharacterFaction(characterId, bible);
    
    const modal = document.getElementById('character-modal');
    const content = document.getElementById('character-modal-content');
    
    content.innerHTML = `
      <div style="position: relative;">
        <button class="modal-close" onclick="window.app.views.characters.hideDetail()">✕</button>
        
        <div style="padding: var(--space-xl);">
          <div style="display: flex; align-items: start; gap: var(--space-xl); margin-bottom: var(--space-xl);">
            <div style="font-size: 4rem; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; background: ${faction ? faction.properties.color + '15' : 'rgba(139,92,246,0.1)'}; border-radius: var(--radius-lg); flex-shrink: 0;">
              ${this._getCharacterEmoji(props)}
            </div>
            <div>
              <h2 style="font-family: var(--font-display); font-size: 1.8rem; color: var(--text-primary); margin-bottom: var(--space-xs);">${character.name}</h2>
              <div style="color: var(--accent-primary); font-size: 0.9rem; font-weight: 500; margin-bottom: var(--space-sm);">${props.role || ''}</div>
              ${faction ? `<span class="tag tag-primary">${faction.properties.symbol || ''} ${faction.name}</span>` : ''}
              ${props.age ? `<span class="tag tag-gold" style="margin-left: var(--space-xs);">Age: ${props.age}</span>` : ''}
            </div>
          </div>
          
          <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--space-xl);">${character.description}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl);">
            ${props.personality ? `
              <div>
                <div class="control-label">Personality</div>
                <div style="display: flex; flex-wrap: wrap; gap: var(--space-xs);">
                  ${props.personality.map(p => `<span class="tag tag-primary">${p}</span>`).join('')}
                </div>
              </div>
            ` : ''}
            
            ${props.goals ? `
              <div>
                <div class="control-label">Goals</div>
                ${props.goals.map(g => `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: var(--space-xs);">• ${g}</div>`).join('')}
              </div>
            ` : ''}
            
            ${props.fears ? `
              <div>
                <div class="control-label">Fears</div>
                ${props.fears.map(f => `<div style="font-size: 0.85rem; color: var(--accent-rose); margin-bottom: var(--space-xs);">• ${f}</div>`).join('')}
              </div>
            ` : ''}
            
            ${props.trauma ? `
              <div>
                <div class="control-label">Defining Trauma</div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; font-style: italic;">${props.trauma}</p>
              </div>
            ` : ''}
          </div>
          
          ${props.emotionalState ? `
            <div style="margin-top: var(--space-xl); padding: var(--space-md); background: rgba(139,92,246,0.08); border-radius: var(--radius-md); border-left: 3px solid var(--accent-primary);">
              <div class="control-label" style="margin-bottom: var(--space-xs);">Current Emotional State</div>
              <p style="font-size: 0.9rem; color: var(--text-accent); font-style: italic;">"${props.emotionalState}"</p>
            </div>
          ` : ''}
          
          ${props.speechStyle ? `
            <div style="margin-top: var(--space-lg);">
              <div class="control-label">Speech Style</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">${props.speechStyle}</p>
            </div>
          ` : ''}
          
          ${relationships.length > 0 ? `
            <div style="margin-top: var(--space-xl);">
              <div class="control-label">Relationships</div>
              <div style="display: grid; gap: var(--space-sm); margin-top: var(--space-sm);">
                ${relationships.slice(0, 12).map(rel => {
                  const otherId = rel.source === characterId ? rel.target : rel.source;
                  const other = bible.getEntity(otherId);
                  if (!other) return '';
                  const color = this._getRelColor(rel.type);
                  return `
                    <div class="card" style="padding: var(--space-sm) var(--space-md); cursor: ${other.type === 'character' ? 'pointer' : 'default'};" 
                         ${other.type === 'character' ? `onclick="window.app.views.characters.showDetail('${other.id}')"` : ''}>
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                          <span style="font-size: 0.85rem; color: var(--text-primary);">${other.name}</span>
                          <span style="font-size: 0.7rem; color: ${color}; margin-left: var(--space-sm);">${rel.label || rel.type}</span>
                        </div>
                        <span class="tag" style="font-size: 0.6rem; color: ${color}; border-color: ${color}33; background: ${color}11;">${rel.type.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
          
          <div style="margin-top: var(--space-xl); display: flex; gap: var(--space-md);">
            <button class="btn btn-primary" onclick="window.app.generateStoryFor('${characterId}')">📜 Generate Story</button>
            <button class="btn btn-secondary" onclick="window.app.generateArcFor('${characterId}')">🎭 Character Arc</button>
          </div>
        </div>
      </div>
    `;
    
    modal.classList.add('active');
  }

  hideDetail() {
    const modal = document.getElementById('character-modal');
    if (modal) modal.classList.remove('active');
  }

  setFilter(factionId) {
    this.filterFaction = factionId;
    this.app.renderCurrentView();
  }

  _getCharacterFaction(characterId, bible) {
    const rels = bible.getRelationshipsFor(characterId);
    const factionRel = rels.find(r => 
      (r.type === 'MEMBER_OF' || r.type === 'RULES') && 
      bible.getEntity(r.target)?.type === 'faction'
    );
    return factionRel ? bible.getEntity(factionRel.target) : null;
  }

  _getCharacterEmoji(props) {
    if (props.role?.includes('High Templar') || props.role?.includes('Supreme')) return '👑';
    if (props.role?.includes('Commander') || props.role?.includes('Rebel')) return '⚔️';
    if (props.role?.includes('Guildmaster') || props.role?.includes('Merchant')) return '💰';
    if (props.role?.includes('Oracle') || props.role?.includes('Mystic')) return '🔮';
    if (props.role?.includes('Captain')) return '🚢';
    if (props.role?.includes('Apprentice') || props.role?.includes('Prophet')) return '⭐';
    if (props.role?.includes('Archon') || props.role?.includes('Military')) return '🛡️';
    if (props.role?.includes('Engineer') || props.role?.includes('Inventor')) return '🔧';
    if (props.role?.includes('Information') || props.role?.includes('Shadow')) return '🕵️';
    if (props.role?.includes('Elder') || props.role?.includes('Sage')) return '📖';
    return '👤';
  }

  _getRelColor(type) {
    const colors = {
      ENEMY_OF: '#F43F5E', ALLIED_WITH: '#10B981', MENTOR_OF: '#8B5CF6',
      KNOWS: '#06B6D4', RIVAL_OF: '#F59E0B', BETRAYED: '#EF4444',
      LOVES: '#EC4899', FEARS: '#6366F1', MEMBER_OF: '#8B5CF6',
      RULES: '#F59E0B', LOCATED_IN: '#06B6D4', POSSESSES: '#10B981',
      SERVES: '#A78BFA', PARENT_OF: '#FBBF24', SIBLING_OF: '#34D399',
      CREATED: '#F97316', SUCCEEDED: '#6EE7B7'
    };
    return colors[type] || '#8B5CF6';
  }
}
