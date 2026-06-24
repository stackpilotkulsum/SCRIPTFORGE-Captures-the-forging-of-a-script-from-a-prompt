// ============================================================
// SCRIPTFORGE — World Map View
// Interactive SVG map with clickable regions
// ============================================================

export class WorldMapView {
  constructor(app) {
    this.app = app;
    this.selectedLocation = null;
  }

  render() {
    const bible = this.app.bible;
    if (!bible) return '<div class="empty-state"><div class="empty-icon">🗺️</div><h3 class="empty-title">No World Forged</h3></div>';
    
    const locations = bible.getLocations();
    const locationData = this._getLocationPositions(locations);
    
    return `
      <div class="view-container view-enter">
        <div class="section-header">
          <h1 class="section-title">World Atlas</h1>
          <p class="section-subtitle">Explore the floating realms of ${bible.metadata.name}. Click any region to discover its lore.</p>
          <div class="section-divider"></div>
        </div>
        
        ${this._renderStatsBar()}
        
        <div class="map-container">
          <div class="map-canvas-wrapper" id="map-canvas-wrapper">
            <canvas id="map-canvas" class="map-canvas"></canvas>
            ${locationData.map(loc => `
              <div class="map-location-node ${this.selectedLocation === loc.entity.id ? 'selected' : ''}" 
                   id="map-node-${loc.entity.id}"
                   style="left: ${loc.x}%; top: ${loc.y}%; background: ${this._getLocationColor(loc.entity)};"
                   onclick="window.app.selectLocation('${loc.entity.id}')">
                <div class="map-location-label">${loc.entity.name}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="map-sidebar">
            <div id="map-detail" class="map-detail-panel">
              ${this.selectedLocation ? this._renderLocationDetail(bible.getEntity(this.selectedLocation)) : this._renderLocationList(locations)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderStatsBar() {
    const bible = this.app.bible;
    const stats = bible.getStats();
    return `
      <div class="world-stats-bar">
        <div class="world-stat">
          <span class="world-stat-icon">🌍</span>
          <div class="world-stat-info">
            <span class="world-stat-value">${stats.locations}</span>
            <span class="world-stat-label">Regions</span>
          </div>
        </div>
        <div class="world-stat">
          <span class="world-stat-icon">👥</span>
          <div class="world-stat-info">
            <span class="world-stat-value">${stats.characters}</span>
            <span class="world-stat-label">Characters</span>
          </div>
        </div>
        <div class="world-stat">
          <span class="world-stat-icon">⚔️</span>
          <div class="world-stat-info">
            <span class="world-stat-value">${stats.factions}</span>
            <span class="world-stat-label">Factions</span>
          </div>
        </div>
        <div class="world-stat">
          <span class="world-stat-icon">🔗</span>
          <div class="world-stat-info">
            <span class="world-stat-value">${stats.relationships}</span>
            <span class="world-stat-label">Connections</span>
          </div>
        </div>
        <div class="world-stat">
          <span class="world-stat-icon">⏳</span>
          <div class="world-stat-info">
            <span class="world-stat-value">${stats.timelineEvents}</span>
            <span class="world-stat-label">Events</span>
          </div>
        </div>
        <div class="world-stat">
          <span class="world-stat-icon">💚</span>
          <div class="world-stat-info">
            <span class="world-stat-value">${stats.consistencyScore}%</span>
            <span class="world-stat-label">Consistency</span>
          </div>
        </div>
      </div>
    `;
  }

  _renderLocationList(locations) {
    return `
      <div class="glass-panel">
        <div class="glass-panel-inner">
          <h3 class="section-title" style="font-size: 1.2rem;">Regions</h3>
          <p class="text-muted" style="font-size: 0.85rem; margin-bottom: var(--space-lg);">Click a node on the map to explore</p>
          ${locations.map(loc => `
            <div class="card" style="margin-bottom: var(--space-sm); padding: var(--space-md);" onclick="window.app.selectLocation('${loc.id}')">
              <div style="display: flex; align-items: center; gap: var(--space-md);">
                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${this._getLocationColor(loc)}; flex-shrink: 0;"></div>
                <div>
                  <div class="card-title" style="font-size: 0.9rem;">${loc.name}</div>
                  <div class="text-muted" style="font-size: 0.75rem;">Alt: ${loc.properties.altitude || '?'}m · Pop: ${(loc.properties.population || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _renderLocationDetail(location) {
    if (!location) return this._renderLocationList(this.app.bible.getLocations());
    
    const bible = this.app.bible;
    const lore = bible.getLocationLore(location.id);
    const factionRels = bible.getRelationshipsFor(location.id)
      .filter(r => r.type === 'LOCATED_IN')
      .map(r => bible.getEntity(r.source))
      .filter(e => e && e.type === 'faction');
    
    return `
      <div class="glass-panel">
        <div class="glass-panel-inner">
          <button class="btn btn-ghost" style="margin-bottom: var(--space-md);" onclick="window.app.selectLocation(null)">← Back to list</button>
          
          <h3 class="section-title" style="font-size: 1.3rem;">${location.name}</h3>
          
          <div style="display: flex; gap: var(--space-md); margin: var(--space-md) 0; flex-wrap: wrap;">
            ${location.properties.altitude !== undefined ? `<span class="tag tag-primary">Alt: ${location.properties.altitude}m</span>` : ''}
            ${location.properties.population ? `<span class="tag tag-gold">Pop: ${location.properties.population.toLocaleString()}</span>` : ''}
            ${(location.tags || []).map(t => `<span class="tag tag-cyan">${t}</span>`).join('')}
          </div>
          
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-lg);">${location.description}</p>
          
          ${location.properties.climate ? `
            <div style="margin-bottom: var(--space-lg);">
              <div class="control-label">Climate</div>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">${location.properties.climate}</p>
            </div>
          ` : ''}
          
          ${location.properties.resources ? `
            <div style="margin-bottom: var(--space-lg);">
              <div class="control-label">Resources</div>
              <div style="display: flex; flex-wrap: wrap; gap: var(--space-xs);">
                ${location.properties.resources.map(r => `<span class="tag tag-emerald">${r}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${location.properties.threat ? `
            <div style="margin-bottom: var(--space-lg);">
              <div class="control-label">Threats</div>
              <p style="font-size: 0.85rem; color: var(--accent-rose);">${location.properties.threat}</p>
            </div>
          ` : ''}
          
          ${lore.characters.length > 0 ? `
            <div style="margin-bottom: var(--space-lg);">
              <div class="control-label">Notable Residents</div>
              ${lore.characters.map(c => `
                <div class="card" style="padding: var(--space-sm) var(--space-md); margin-bottom: var(--space-xs); cursor: pointer;" onclick="window.app.navigateTo('characters', '${c.id}')">
                  <span style="font-size: 0.85rem; color: var(--text-primary);">${c.name}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: var(--space-sm);">${c.properties?.role || ''}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${factionRels.length > 0 ? `
            <div>
              <div class="control-label">Controlling Factions</div>
              ${factionRels.map(f => `
                <div class="card" style="padding: var(--space-sm) var(--space-md); margin-bottom: var(--space-xs);">
                  <span style="font-size: 1rem;">${f.properties?.symbol || '🏴'}</span>
                  <span style="font-size: 0.85rem; color: var(--text-primary); margin-left: var(--space-sm);">${f.name}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _getLocationPositions(locations) {
    const positions = {
      'The Spire Sanctum': { x: 50, y: 12 },
      'The Cloudfall Markets': { x: 30, y: 40 },
      'The Storm Anvil': { x: 70, y: 50 },
      'The Whisperdeep': { x: 45, y: 80 },
      'The Shattered Ring': { x: 75, y: 20 },
      "The Exile's Drift": { x: 20, y: 65 }
    };
    
    return locations.map((entity, idx) => {
      const pos = positions[entity.name] || { x: 20 + (idx * 15) % 60, y: 20 + (idx * 20) % 60 };
      return { entity, ...pos };
    });
  }

  _getLocationColor(location) {
    const altColors = {
      6200: '#A78BFA',  // Spire - high
      3800: '#FBBF24',  // Markets - mid
      2800: '#F97316',  // Storm Anvil - mid-low
      '-800': '#06B6D4', // Whisperdeep - deep
      4500: '#EC4899',  // Shattered Ring
    };
    return altColors[location.properties?.altitude] || '#8B5CF6';
  }

  initMapCanvas() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    
    const wrapper = document.getElementById('map-canvas-wrapper');
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    
    const ctx = canvas.getContext('2d');
    this._drawMapBackground(ctx, canvas.width, canvas.height);
  }

  _drawMapBackground(ctx, w, h) {
    // Gas giant atmosphere layers
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.2, '#16082a');
    gradient.addColorStop(0.4, '#1a1040');
    gradient.addColorStop(0.6, '#1e1548');
    gradient.addColorStop(0.8, '#0d1a3a');
    gradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Atmospheric bands
    for (let i = 0; i < 8; i++) {
      const y = (h / 8) * i;
      const bandGradient = ctx.createLinearGradient(0, y, 0, y + h/8);
      bandGradient.addColorStop(0, `rgba(139, 92, 246, ${0.02 + Math.random() * 0.03})`);
      bandGradient.addColorStop(0.5, `rgba(6, 182, 212, ${0.01 + Math.random() * 0.02})`);
      bandGradient.addColorStop(1, `rgba(139, 92, 246, ${0.01 + Math.random() * 0.02})`);
      ctx.fillStyle = bandGradient;
      ctx.fillRect(0, y, w, h/8);
    }
    
    // Cloud wisps
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const radius = 50 + Math.random() * 150;
      const cloud = ctx.createRadialGradient(x, y, 0, x, y, radius);
      cloud.addColorStop(0, 'rgba(200, 180, 255, 0.3)');
      cloud.addColorStop(1, 'transparent');
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Stars in the upper region
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * w;
      const y = Math.random() * (h * 0.3);
      const size = Math.random() * 1.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Altitude indicators
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.font = '10px "JetBrains Mono"';
    const altitudes = ['+6000m', '+4000m', '+2000m', '0m', '-1000m'];
    altitudes.forEach((alt, i) => {
      const y = (h / (altitudes.length - 1)) * i;
      ctx.fillText(alt, 10, y + 12);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.setLineDash([4, 8]);
      ctx.moveTo(40, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    
    // Draw connection lines between locations (will be drawn over by nodes)
    const bible = this.app.bible;
    if (bible) {
      const locations = bible.getLocations();
      const positions = this._getLocationPositions(locations);
      
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          // Check if these locations have a connection
          const rels = bible.getRelationshipsBetween(positions[i].entity.id, positions[j].entity.id);
          if (rels.length > 0) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x * w / 100, positions[i].y * h / 100);
            ctx.lineTo(positions[j].x * w / 100, positions[j].y * h / 100);
            ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]);
    }
  }
}
