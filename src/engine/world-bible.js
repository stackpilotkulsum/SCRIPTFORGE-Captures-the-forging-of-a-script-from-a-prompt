// ============================================================
// SCRIPTFORGE — World Bible (Knowledge Graph Engine)
// The beating heart: stores every entity, relationship, and rule
// ============================================================

export class WorldBible {
  constructor() {
    this.entities = new Map();       // id -> Entity
    this.relationships = [];          // Array of Relationship objects
    this.timeline = [];               // Ordered events
    this.rules = [];                  // World rules (magic, physics, etc.)
    this.metadata = {
      name: '',
      prompt: '',
      createdAt: null,
      lastModified: null,
      generationCount: 0,
      consistencyScore: 100
    };
    this._idCounter = 0;
    this._listeners = new Map();
  }

  // ── Entity Management ──────────────────────────────────────

  addEntity(entity) {
    const id = entity.id || this._generateId(entity.type);
    const fullEntity = {
      id,
      type: entity.type,           // 'character', 'location', 'faction', 'event', 'artifact', 'rule'
      name: entity.name,
      description: entity.description || '',
      properties: entity.properties || {},
      tags: entity.tags || [],
      imagePrompt: entity.imagePrompt || '',
      imagePath: entity.imagePath || '',
      createdAt: Date.now(),
      lastModified: Date.now(),
      history: []                  // Track changes over time
    };
    this.entities.set(id, fullEntity);
    this._emit('entityAdded', fullEntity);
    this.metadata.lastModified = Date.now();
    return fullEntity;
  }

  updateEntity(id, updates) {
    const entity = this.entities.get(id);
    if (!entity) throw new Error(`Entity ${id} not found`);
    
    // Archive current state before updating
    entity.history.push({
      timestamp: Date.now(),
      snapshot: JSON.parse(JSON.stringify({ ...entity, history: undefined }))
    });
    
    Object.assign(entity, updates, { lastModified: Date.now() });
    if (updates.properties) {
      entity.properties = { ...entity.properties, ...updates.properties };
    }
    this._emit('entityUpdated', entity);
    this.metadata.lastModified = Date.now();
    return entity;
  }

  removeEntity(id) {
    const entity = this.entities.get(id);
    if (!entity) return false;
    this.entities.delete(id);
    this.relationships = this.relationships.filter(
      r => r.source !== id && r.target !== id
    );
    this._emit('entityRemoved', entity);
    return true;
  }

  getEntity(id) {
    return this.entities.get(id) || null;
  }

  // ── Relationship Management ────────────────────────────────

  addRelationship(rel) {
    const relationship = {
      id: this._generateId('rel'),
      source: rel.source,          // entity id
      target: rel.target,          // entity id
      type: rel.type,              // 'MEMBER_OF', 'RULES', 'LOCATED_IN', 'ALLIED_WITH', etc.
      label: rel.label || rel.type,
      strength: rel.strength || 1, // 0-1 scale
      properties: rel.properties || {},
      bidirectional: rel.bidirectional || false,
      createdAt: Date.now()
    };
    this.relationships.push(relationship);
    this._emit('relationshipAdded', relationship);
    return relationship;
  }

  removeRelationship(id) {
    const idx = this.relationships.findIndex(r => r.id === id);
    if (idx === -1) return false;
    const removed = this.relationships.splice(idx, 1)[0];
    this._emit('relationshipRemoved', removed);
    return true;
  }

  getRelationshipsFor(entityId) {
    return this.relationships.filter(
      r => r.source === entityId || r.target === entityId
    );
  }

  getRelationshipsBetween(id1, id2) {
    return this.relationships.filter(
      r => (r.source === id1 && r.target === id2) ||
           (r.source === id2 && r.target === id1)
    );
  }

  // ── Query Methods ──────────────────────────────────────────

  getEntitiesByType(type) {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }

  getCharacters() { return this.getEntitiesByType('character'); }
  getLocations() { return this.getEntitiesByType('location'); }
  getFactions() { return this.getEntitiesByType('faction'); }
  getEvents() { return this.getEntitiesByType('event'); }
  getArtifacts() { return this.getEntitiesByType('artifact'); }
  getRuleEntities() { return this.getEntitiesByType('rule'); }

  getCharactersByFaction(factionId) {
    const memberRels = this.relationships.filter(
      r => r.target === factionId && r.type === 'MEMBER_OF'
    );
    return memberRels.map(r => this.getEntity(r.source)).filter(Boolean);
  }

  getLocationLore(locationId) {
    const location = this.getEntity(locationId);
    if (!location) return null;
    
    const characters = this.relationships
      .filter(r => r.target === locationId && r.type === 'LOCATED_IN')
      .map(r => this.getEntity(r.source)).filter(Boolean);
    
    const events = this.relationships
      .filter(r => r.target === locationId && r.type === 'OCCURRED_AT')
      .map(r => this.getEntity(r.source)).filter(Boolean);
    
    return { location, characters, events };
  }

  getRelationshipChain(startId, maxDepth = 3) {
    const visited = new Set();
    const chain = [];
    
    const traverse = (id, depth) => {
      if (depth > maxDepth || visited.has(id)) return;
      visited.add(id);
      
      const rels = this.getRelationshipsFor(id);
      for (const rel of rels) {
        chain.push(rel);
        const nextId = rel.source === id ? rel.target : rel.source;
        traverse(nextId, depth + 1);
      }
    };
    
    traverse(startId, 0);
    return chain;
  }

  searchEntities(query) {
    const q = query.toLowerCase();
    return Array.from(this.entities.values()).filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // ── Timeline Management ────────────────────────────────────

  addTimelineEvent(event) {
    const timelineEntry = {
      id: event.id || this._generateId('timeline'),
      entityId: event.entityId,       // Link to event entity
      name: event.name,
      description: event.description,
      year: event.year,
      era: event.era || 'current',
      importance: event.importance || 'minor', // 'pivotal', 'major', 'minor'
      involvedEntities: event.involvedEntities || [],
      consequences: event.consequences || [],
      causedBy: event.causedBy || null
    };
    
    this.timeline.push(timelineEntry);
    this.timeline.sort((a, b) => a.year - b.year);
    this._emit('timelineUpdated', timelineEntry);
    return timelineEntry;
  }

  getTimelineRange(startYear, endYear) {
    return this.timeline.filter(e => e.year >= startYear && e.year <= endYear);
  }

  // ── World Rules ────────────────────────────────────────────

  addRule(rule) {
    const worldRule = {
      id: this._generateId('rule'),
      category: rule.category,       // 'magic', 'physics', 'social', 'biological'
      name: rule.name,
      description: rule.description,
      constraints: rule.constraints || [],
      exceptions: rule.exceptions || []
    };
    this.rules.push(worldRule);
    this._emit('ruleAdded', worldRule);
    return worldRule;
  }

  getRulesByCategory(category) {
    return this.rules.filter(r => r.category === category);
  }

  // ── Statistics ─────────────────────────────────────────────

  getStats() {
    const entities = Array.from(this.entities.values());
    return {
      totalEntities: entities.length,
      characters: entities.filter(e => e.type === 'character').length,
      locations: entities.filter(e => e.type === 'location').length,
      factions: entities.filter(e => e.type === 'faction').length,
      events: entities.filter(e => e.type === 'event').length,
      artifacts: entities.filter(e => e.type === 'artifact').length,
      relationships: this.relationships.length,
      timelineEvents: this.timeline.length,
      rules: this.rules.length,
      consistencyScore: this.metadata.consistencyScore,
      generationCount: this.metadata.generationCount
    };
  }

  // ── Serialization ──────────────────────────────────────────

  toJSON() {
    return {
      metadata: this.metadata,
      entities: Array.from(this.entities.entries()),
      relationships: this.relationships,
      timeline: this.timeline,
      rules: this.rules,
      _idCounter: this._idCounter
    };
  }

  static fromJSON(data) {
    const bible = new WorldBible();
    bible.metadata = data.metadata;
    bible.entities = new Map(data.entities);
    bible.relationships = data.relationships;
    bible.timeline = data.timeline;
    bible.rules = data.rules;
    bible._idCounter = data._idCounter;
    return bible;
  }

  // ── Event System ───────────────────────────────────────────

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
    return () => {
      const cbs = this._listeners.get(event);
      const idx = cbs.indexOf(callback);
      if (idx > -1) cbs.splice(idx, 1);
    };
  }

  _emit(event, data) {
    const cbs = this._listeners.get(event) || [];
    cbs.forEach(cb => cb(data));
  }

  _generateId(prefix) {
    return `${prefix}_${++this._idCounter}_${Date.now().toString(36)}`;
  }
}

// ── Relationship Type Constants ──────────────────────────────

export const RelationshipTypes = {
  MEMBER_OF: 'MEMBER_OF',
  RULES: 'RULES',
  LOCATED_IN: 'LOCATED_IN',
  ALLIED_WITH: 'ALLIED_WITH',
  ENEMY_OF: 'ENEMY_OF',
  CAUSED: 'CAUSED',
  KNOWS: 'KNOWS',
  LOVES: 'LOVES',
  FEARS: 'FEARS',
  SERVES: 'SERVES',
  BETRAYED: 'BETRAYED',
  PARENT_OF: 'PARENT_OF',
  SIBLING_OF: 'SIBLING_OF',
  MENTOR_OF: 'MENTOR_OF',
  RIVAL_OF: 'RIVAL_OF',
  OCCURRED_AT: 'OCCURRED_AT',
  POSSESSES: 'POSSESSES',
  CREATED: 'CREATED',
  DESTROYED: 'DESTROYED',
  SUCCEEDED: 'SUCCEEDED'
};

// ── Entity Type Constants ────────────────────────────────────

export const EntityTypes = {
  CHARACTER: 'character',
  LOCATION: 'location',
  FACTION: 'faction',
  EVENT: 'event',
  ARTIFACT: 'artifact',
  RULE: 'rule'
};
