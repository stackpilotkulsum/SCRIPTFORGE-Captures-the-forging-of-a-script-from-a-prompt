// ============================================================
// SCRIPTFORGE — Consistency Checker Agent
// The guardian of lore integrity — validates every generation
// ============================================================

export class ConsistencyChecker {
  constructor(worldBible) {
    this.bible = worldBible;
    this.contradictionLog = [];
    this.resolutionHistory = [];
    this.checksPerformed = 0;
  }

  /**
   * Check a generated story for consistency against the World Bible
   * @param {Object} story - The generated story object
   * @returns {Object} ConsistencyReport
   */
  check(story) {
    this.checksPerformed++;
    const issues = [];
    
    // Run all checks
    issues.push(...this._checkCharacterConsistency(story));
    issues.push(...this._checkRelationshipConsistency(story));
    issues.push(...this._checkLocationConsistency(story));
    issues.push(...this._checkRuleConsistency(story));
    issues.push(...this._checkTimelineConsistency(story));
    issues.push(...this._checkDeadCharacters(story));
    issues.push(...this._checkSensoryConsistency(story));
    
    const report = {
      id: `check_${Date.now()}`,
      storyId: story.id,
      storyTitle: story.title,
      timestamp: Date.now(),
      issues,
      score: this._calculateScore(issues),
      summary: this._generateSummary(issues),
      autoResolved: [],
      flagged: []
    };
    
    // Auto-resolve minor issues
    for (const issue of issues) {
      if (issue.severity === 'INFO') {
        report.autoResolved.push(issue);
      } else {
        report.flagged.push(issue);
      }
    }
    
    // Update bible consistency score
    this.bible.metadata.consistencyScore = Math.max(0, 
      this.bible.metadata.consistencyScore - (report.flagged.length * 2)
    );
    
    this.contradictionLog.push(report);
    
    return report;
  }

  // ── Check Methods ─────────────────────────────────────────

  _checkCharacterConsistency(story) {
    const issues = [];
    
    if (!story.characters) return issues;
    
    for (const charRef of story.characters) {
      const character = this.bible.getEntity(charRef.id);
      if (!character) {
        issues.push({
          type: 'CHARACTER_NOT_FOUND',
          severity: 'WARNING',
          message: `Character "${charRef.name}" referenced in story but not found in World Bible`,
          entityId: charRef.id,
          suggestion: 'Add character to World Bible or verify ID'
        });
        continue;
      }
      
      // Check if character name matches
      if (character.name !== charRef.name) {
        issues.push({
          type: 'CHARACTER_NAME_MISMATCH',
          severity: 'WARNING',
          message: `Character name mismatch: Bible has "${character.name}" but story uses "${charRef.name}"`,
          entityId: charRef.id,
          suggestion: 'Verify character name is consistent'
        });
      }
      
      // Check personality consistency in content
      const props = character.properties || {};
      if (props.personality) {
        const isPacifist = props.personality.some(p => 
          p.toLowerCase().includes('peaceful') || p.toLowerCase().includes('pacifist')
        );
        if (isPacifist && story.content && story.content.toLowerCase().includes('violence')) {
          const contentLower = story.content.toLowerCase();
          const charNameLower = character.name.toLowerCase();
          if (contentLower.includes(charNameLower) && 
              (contentLower.includes('attacked') || contentLower.includes('killed') || contentLower.includes('struck'))) {
            issues.push({
              type: 'PERSONALITY_VIOLATION',
              severity: 'CONTRADICTION',
              message: `${character.name} is characterized as peaceful/pacifist but commits violence in this story`,
              entityId: charRef.id,
              suggestion: 'Either provide arc development justifying the change or modify the scene'
            });
          }
        }
      }
    }
    
    return issues;
  }

  _checkRelationshipConsistency(story) {
    const issues = [];
    
    if (!story.characters || story.characters.length < 2) return issues;
    
    for (let i = 0; i < story.characters.length; i++) {
      for (let j = i + 1; j < story.characters.length; j++) {
        const char1 = story.characters[i];
        const char2 = story.characters[j];
        const rels = this.bible.getRelationshipsBetween(char1.id, char2.id);
        
        if (rels.length === 0 && story.content) {
          // Characters interact but have no recorded relationship
          issues.push({
            type: 'UNRECORDED_INTERACTION',
            severity: 'INFO',
            message: `${char1.name} and ${char2.name} interact in this story but have no recorded relationship in the Bible`,
            entityId: char1.id,
            suggestion: 'Consider adding a relationship between these characters'
          });
        }
        
        // Check if enemies are being friendly without explanation
        const isEnemy = rels.some(r => r.type === 'ENEMY_OF' || r.type === 'RIVAL_OF');
        if (isEnemy && story.content) {
          const content = story.content.toLowerCase();
          if (content.includes('laughed together') || content.includes('embraced') || 
              content.includes('trusted completely')) {
            issues.push({
              type: 'RELATIONSHIP_VIOLATION',
              severity: 'CONTRADICTION',
              message: `${char1.name} and ${char2.name} are enemies/rivals but behave as close friends without a reconciliation event`,
              entityId: char1.id,
              suggestion: 'Add a reconciliation event to the timeline or adjust the interaction'
            });
          }
        }
      }
    }
    
    return issues;
  }

  _checkLocationConsistency(story) {
    const issues = [];
    
    if (!story.location) return issues;
    
    const location = this.bible.getEntity(story.location.id);
    if (!location) {
      issues.push({
        type: 'LOCATION_NOT_FOUND',
        severity: 'WARNING',
        message: `Location "${story.location.name}" not found in World Bible`,
        entityId: story.location.id,
        suggestion: 'Add location to World Bible'
      });
      return issues;
    }
    
    // Check if characters are supposed to be at this location
    if (story.characters) {
      for (const charRef of story.characters) {
        const charLocRels = this.bible.getRelationshipsFor(charRef.id)
          .filter(r => r.type === 'LOCATED_IN');
        
        if (charLocRels.length > 0) {
          const primaryLoc = this.bible.getEntity(charLocRels[0].target);
          if (primaryLoc && primaryLoc.id !== location.id) {
            issues.push({
              type: 'CHARACTER_LOCATION_MISMATCH',
              severity: 'INFO',
              message: `${charRef.name} is primarily located at ${primaryLoc.name} but appears in ${location.name}`,
              entityId: charRef.id,
              suggestion: 'Characters can travel — consider adding a travel event to explain their presence'
            });
          }
        }
      }
    }
    
    return issues;
  }

  _checkRuleConsistency(story) {
    const issues = [];
    
    if (!story.content) return issues;
    
    const content = story.content.toLowerCase();
    
    // Check Aetherbinding rules
    const magicRules = this.bible.getRulesByCategory('magic');
    for (const rule of magicRules) {
      if (rule.name === 'Aetherbinding') {
        // Check if Aetherbinding is used without mentioning cost
        if (content.includes('aetherbind') || content.includes('binding') || content.includes('channeled')) {
          if (!content.includes('sense') && !content.includes('cost') && !content.includes('sacrifice') && !content.includes('loss')) {
            issues.push({
              type: 'MAGIC_COST_MISSING',
              severity: 'WARNING',
              message: 'Aetherbinding is used in this story but the sensory cost is not acknowledged',
              suggestion: 'Aetherbinding always has a sensory cost — mention or imply it'
            });
          }
        }
        
        // Check if Aetherbinding is used indoors
        if ((content.includes('aetherbind') || content.includes('channeled storm')) && 
            (content.includes('indoors') || content.includes('sealed room') || content.includes('underground'))) {
          issues.push({
            type: 'MAGIC_RULE_VIOLATION',
            severity: 'CONTRADICTION',
            message: 'Aetherbinding requires direct exposure to atmospheric currents — cannot work indoors',
            suggestion: 'Move the scene outdoors or use a different power source'
          });
        }
      }
    }
    
    // Check physics rules
    const physicsRules = this.bible.getRulesByCategory('physics');
    for (const rule of physicsRules) {
      if (rule.name === 'Gas Giant Environment') {
        if (content.includes('solid ground') || content.includes('walked on earth') || content.includes('the soil')) {
          issues.push({
            type: 'PHYSICS_VIOLATION',
            severity: 'CONTRADICTION',
            message: 'References to solid ground in a gas giant environment — no natural solid ground exists in Aethermere',
            suggestion: 'Replace with floating platform, cloud-crystal, or atmospheric structure'
          });
        }
      }
    }
    
    return issues;
  }

  _checkTimelineConsistency(story) {
    const issues = [];
    
    if (!story.content) return issues;
    
    const content = story.content.toLowerCase();
    
    // Check references to timeline events
    const timeline = this.bible.timeline;
    for (const event of timeline) {
      const eventNameLower = event.name.toLowerCase();
      if (content.includes(eventNameLower)) {
        // Verify the event details aren't contradicted
        if (event.year < 0 && content.includes(`${eventNameLower}`) && content.includes('recently')) {
          if (Math.abs(event.year) > 50) {
            issues.push({
              type: 'TEMPORAL_INCONSISTENCY',
              severity: 'WARNING',
              message: `"${event.name}" is referenced as recent but occurred ${Math.abs(event.year)} years ago`,
              suggestion: 'Adjust temporal framing or specify that it feels recent emotionally'
            });
          }
        }
      }
    }
    
    return issues;
  }

  _checkDeadCharacters(story) {
    const issues = [];
    
    if (!story.characters) return issues;
    
    for (const charRef of story.characters) {
      const character = this.bible.getEntity(charRef.id);
      if (character && character.properties && character.properties.alive === false) {
        issues.push({
          type: 'DEAD_CHARACTER_ACTIVE',
          severity: 'CONTRADICTION',
          message: `${charRef.name} is dead in the World Bible but appears as an active character in this story`,
          entityId: charRef.id,
          suggestion: 'This character should appear only in flashbacks, memories, or visions'
        });
      }
    }
    
    return issues;
  }

  _checkSensoryConsistency(story) {
    const issues = [];
    
    if (!story.characters || !story.content) return issues;
    
    const content = story.content.toLowerCase();
    
    for (const charRef of story.characters) {
      const character = this.bible.getEntity(charRef.id);
      if (!character || !character.properties || !character.properties.senses) continue;
      
      const senses = character.properties.senses;
      const charNameLower = character.name.toLowerCase();
      
      // Check if character uses a lost sense
      if (senses.sight === 'gone' || senses.sight === 'one eye blind') {
        if (content.includes(charNameLower) && 
            (content.includes('she saw clearly') || content.includes('his keen eyes') || content.includes('looked closely at the detail'))) {
          issues.push({
            type: 'SENSORY_VIOLATION',
            severity: 'WARNING',
            message: `${character.name} has impaired sight but the story describes them seeing with full clarity`,
            entityId: charRef.id,
            suggestion: 'Adjust descriptions to reflect their visual impairment'
          });
        }
      }
      
      if (senses.touch === 'gone') {
        if (content.includes(charNameLower) && 
            (content.includes('felt the texture') || content.includes('touched gently') || content.includes('sensitive fingers'))) {
          issues.push({
            type: 'SENSORY_VIOLATION',
            severity: 'WARNING',
            message: `${character.name} has lost their sense of touch but the story describes them feeling textures`,
            entityId: charRef.id,
            suggestion: 'This character cannot feel physical sensations'
          });
        }
      }
    }
    
    return issues;
  }

  // ── Scoring & Reporting ───────────────────────────────────

  _calculateScore(issues) {
    let score = 100;
    for (const issue of issues) {
      switch (issue.severity) {
        case 'CONTRADICTION': score -= 15; break;
        case 'WARNING': score -= 5; break;
        case 'INFO': score -= 1; break;
      }
    }
    return Math.max(0, score);
  }

  _generateSummary(issues) {
    const contradictions = issues.filter(i => i.severity === 'CONTRADICTION').length;
    const warnings = issues.filter(i => i.severity === 'WARNING').length;
    const infos = issues.filter(i => i.severity === 'INFO').length;
    
    if (contradictions > 0) {
      return `⚠️ Found ${contradictions} contradiction(s) that need resolution. World Bible integrity is at risk.`;
    } else if (warnings > 0) {
      return `⚡ Found ${warnings} warning(s) — minor inconsistencies detected. Consider reviewing.`;
    } else if (infos > 0) {
      return `ℹ️ Found ${infos} note(s) — suggestions for enriching the World Bible.`;
    } else {
      return `✅ Perfect consistency! This story aligns completely with the World Bible.`;
    }
  }

  // ── Get Overall Health ────────────────────────────────────

  getWorldHealth() {
    const totalChecks = this.contradictionLog.length;
    const avgScore = totalChecks > 0 
      ? this.contradictionLog.reduce((sum, r) => sum + r.score, 0) / totalChecks 
      : 100;
    
    const totalIssues = this.contradictionLog.reduce((sum, r) => sum + r.issues.length, 0);
    const totalContradictions = this.contradictionLog.reduce((sum, r) => 
      sum + r.issues.filter(i => i.severity === 'CONTRADICTION').length, 0);
    const totalWarnings = this.contradictionLog.reduce((sum, r) => 
      sum + r.issues.filter(i => i.severity === 'WARNING').length, 0);
    
    return {
      totalChecks,
      averageScore: Math.round(avgScore),
      totalIssues,
      totalContradictions,
      totalWarnings,
      bibleConsistencyScore: this.bible.metadata.consistencyScore,
      status: avgScore >= 90 ? 'HEALTHY' : avgScore >= 70 ? 'FAIR' : avgScore >= 50 ? 'DEGRADED' : 'CRITICAL',
      statusEmoji: avgScore >= 90 ? '💚' : avgScore >= 70 ? '💛' : avgScore >= 50 ? '🟠' : '🔴',
      recentReports: this.contradictionLog.slice(-5)
    };
  }

  // ── Get detailed log ──────────────────────────────────────

  getContradictionLog() {
    return this.contradictionLog;
  }

  getRecentIssues(count = 10) {
    const allIssues = [];
    for (const report of this.contradictionLog) {
      for (const issue of report.issues) {
        allIssues.push({
          ...issue,
          storyId: report.storyId,
          storyTitle: report.storyTitle,
          checkedAt: report.timestamp
        });
      }
    }
    return allIssues.sort((a, b) => b.checkedAt - a.checkedAt).slice(0, count);
  }
}
