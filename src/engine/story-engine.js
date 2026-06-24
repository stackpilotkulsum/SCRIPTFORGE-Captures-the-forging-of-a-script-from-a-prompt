// ============================================================
// SCRIPTFORGE — Story Engine
// Generates narratively coherent stories grounded in the World Bible
// ============================================================

export class StoryEngine {
  constructor(worldBible) {
    this.bible = worldBible;
    this.generatedStories = [];
    this.plotThreads = [];
    this._storyTemplates = this._initTemplates();
  }

  /**
   * Generate a story based on parameters
   * @param {Object} params - { type, characters, location, tone, theme }
   * @returns {Object} Generated story with metadata
   */
  generate(params = {}) {
    const type = params.type || this._randomFrom(['chronicle', 'dialogue', 'character_arc', 'battle', 'prophecy']);
    const story = this._generateByType(type, params);
    
    story.id = `story_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    story.generatedAt = Date.now();
    story.type = type;
    story.params = params;
    story.bibleReferences = this._extractReferences(story);
    
    this.generatedStories.push(story);
    this.bible.metadata.generationCount++;
    
    return story;
  }

  _generateByType(type, params) {
    switch (type) {
      case 'chronicle': return this._generateChronicle(params);
      case 'dialogue': return this._generateDialogue(params);
      case 'character_arc': return this._generateCharacterArc(params);
      case 'battle': return this._generateBattle(params);
      case 'prophecy': return this._generateProphecy(params);
      default: return this._generateChronicle(params);
    }
  }

  // ── Chronicle Generation ──────────────────────────────────

  _generateChronicle(params) {
    const characters = params.characters 
      ? params.characters.map(id => this.bible.getEntity(id)).filter(Boolean)
      : this._selectRelevantCharacters(2, 3);
    
    const location = params.location 
      ? this.bible.getEntity(params.location)
      : this._selectRelevantLocation(characters);
    
    const tone = params.tone || this._randomFrom(['tense', 'melancholic', 'hopeful', 'ominous']);
    const theme = params.theme || this._selectTheme();
    
    const templates = this._storyTemplates.chronicles;
    const template = this._randomFrom(templates);
    
    const title = this._fillTemplate(template.title, { characters, location, theme });
    const content = this._generateChronicleContent(characters, location, tone, theme, template);
    
    return {
      title,
      content,
      characters: characters.map(c => ({ id: c.id, name: c.name })),
      location: location ? { id: location.id, name: location.name } : null,
      tone,
      theme,
      wordCount: content.split(/\s+/).length
    };
  }

  _generateChronicleContent(characters, location, tone, theme, template) {
    const char1 = characters[0];
    const char2 = characters[1];
    const loc = location || { name: 'the realm', properties: {} };
    
    const relationships = char2 ? this.bible.getRelationshipsBetween(char1.id, char2.id) : [];
    const relType = relationships.length > 0 ? relationships[0].type : 'KNOWS';
    
    const sensoryDetails = this._getSensoryDetails(loc, tone);
    const characterVoice = this._getCharacterVoice(char1);
    
    const paragraphs = [];
    
    // Opening - Setting
    paragraphs.push(this._generateOpening(loc, tone, sensoryDetails));
    
    // Rising Action - Character introduction
    paragraphs.push(this._generateCharacterIntro(char1, loc, tone));
    
    // Middle - Conflict or Discovery
    if (char2) {
      paragraphs.push(this._generateEncounter(char1, char2, relType, loc, tone));
    }
    
    // Climax - Key moment
    paragraphs.push(this._generateClimax(char1, char2, theme, tone));
    
    // Resolution - Consequence
    paragraphs.push(this._generateResolution(char1, theme, tone));
    
    return paragraphs.join('\n\n');
  }

  _generateOpening(location, tone, sensory) {
    const openings = {
      tense: [
        `The air in ${location.name} tasted of ozone and approaching violence. ${sensory} No one spoke — but everyone listened.`,
        `Something had changed in ${location.name}. ${sensory} The usual rhythms of the place had shifted, like a heartbeat skipping.`,
        `${sensory} In ${location.name}, the silence was louder than any storm. It was the kind of quiet that came before endings.`
      ],
      melancholic: [
        `${location.name} had been beautiful once. ${sensory} Now it wore its grandeur like a funeral shroud — still magnificent, but draped over something dying.`,
        `The light filtering through ${location.name} was the color of old memories. ${sensory} Even the wind seemed to sigh here, carrying the weight of everything that had been lost.`,
        `${sensory} In ${location.name}, time moved differently. Slower. As if the world itself was reluctant to move forward into whatever came next.`
      ],
      hopeful: [
        `There was a crack in the clouds above ${location.name} — and through it, something that might have been starlight. ${sensory} It had been so long since anyone had seen the sky.`,
        `${sensory} For the first time in years, ${location.name} hummed with something other than machinery and despair. It hummed with possibility.`,
        `Dawn came to ${location.name} like a secret. ${sensory} Small. Quiet. But undeniable.`
      ],
      ominous: [
        `The deep thrum beneath ${location.name} was getting louder. ${sensory} No one wanted to acknowledge it. Acknowledging it would mean acknowledging what was coming.`,
        `${sensory} ${location.name} had always been a place of power. Now it was a place of dying power — which was infinitely more dangerous.`,
        `Something was waking in ${location.name}. ${sensory} The old instruments measured it, the old priests denied it, and the old walls trembled with it.`
      ]
    };
    
    return this._randomFrom(openings[tone] || openings.ominous);
  }

  _generateCharacterIntro(character, location, tone) {
    const props = character.properties || {};
    const personality = (props.personality || []).join(', ').toLowerCase();
    const role = props.role || 'a figure of significance';
    const senses = props.senses || {};
    
    const senseLoss = Object.entries(senses)
      .filter(([_, v]) => v === 'gone' || v === 'fading' || v === 'dulled')
      .map(([k, _]) => k);
    
    const senseDetail = senseLoss.length > 0 
      ? ` The storms had taken ${senseLoss.join(' and ')} from her years ago — but what remained was sharper for the sacrifice.`
      : '';
    
    const intros = [
      `${character.name} stood at the edge of ${location.name}, ${personality} as ever.${senseDetail} As ${role}, the weight of every soul in Aethermere pressed down on shoulders that had long since learned not to buckle.`,
      `They found ${character.name} where they always found them — at the heart of the storm, literal or otherwise.${senseDetail} ${role} was not a title to be worn lightly, and ${character.name} had never been accused of lightness.`,
      `${character.name} had not slept in three days. ${role} demanded sacrifices beyond Aetherbinding, and lately the greatest sacrifice was hope.${senseDetail} But still, they came. Still, they stood.`
    ];
    
    return this._randomFrom(intros);
  }

  _generateEncounter(char1, char2, relType, location, tone) {
    const encounters = {
      ENEMY_OF: [
        `"${char1.name}." ${char2.name}'s voice cut through the ambient noise of ${location.name} like a blade through cloud-crystal. They had not spoken since the Purge, and the silence between them had grown teeth.\n\n"${char2.name}," ${char1.name} replied, and in that single word was a history of blood, betrayal, and a grief that neither would admit to. "I wondered when you'd come."`,
        `The moment ${char2.name} appeared, the temperature in ${location.name} seemed to drop. Not physically — the atmospheric regulators saw to that — but in every other way that mattered.\n\n${char1.name} felt it before seeing them. Old enemies have a gravity of their own, and ${char2.name} had always been a force of nature. "You're either very brave or very desperate to be here," ${char1.name} said. "I'm hoping for desperate. It would mean we finally have something in common."`
      ],
      ALLIED_WITH: [
        `${char2.name} arrived without ceremony — which was itself a kind of trust. In Aethermere, where every gesture was weighted with political meaning, choosing not to perform was the most intimate thing two people could share.\n\n"The storm readings," ${char1.name} said without preamble. ${char2.name} nodded. They had both seen the numbers. Numbers didn't lie, even when every institution around them did.`,
        `"Tell me you have good news," ${char1.name} said as ${char2.name} materialized from the crowd in ${location.name}. The look on their face was answer enough.\n\n"I have news," ${char2.name} said carefully. "Whether it's good depends entirely on how much you're willing to sacrifice."`
      ],
      MENTOR_OF: [
        `${char2.name} found their mentor in the meditation chamber, surrounded by the fading glow of captured lightning. ${char1.name} looked smaller than they remembered — or perhaps ${char2.name} had simply grown.\n\n"You've been avoiding me," ${char1.name} said, eyes closed. "You only avoid me when you've made a decision you know I won't approve of."\n\n${char2.name} didn't deny it. Some truths were beyond lies.`,
      ],
      KNOWS: [
        `${char1.name} and ${char2.name} met in the shadow of ${location.name}'s oldest structure — a place where conversations couldn't be overheard, or so they hoped. The Whispering King had ears everywhere.\n\n"Something is changing," ${char2.name} said. "Can you feel it?"\n\n${char1.name} could. The question was whether feeling it and surviving it were compatible.`
      ],
      RIVAL_OF: [
        `"We keep meeting like this," ${char2.name} said, a razor's edge hiding beneath casual words. "One might think the storms are conspiring to throw us together."\n\n${char1.name} regarded them with the careful attention one gives to a loaded weapon. "The storms conspire for nothing. They are dying. As is the luxury of pretending we can afford to be enemies."`,
      ],
      BETRAYED: [
        `The last time ${char1.name} had seen ${char2.name}, it had been through smoke and screaming. Some betrayals are so complete they become a kind of creation — from the ashes of trust, something new and terrible is born.\n\n"I should kill you," ${char1.name} said conversationally. "I've imagined it a thousand times. A thousand different ways."\n\n"And yet here we are," ${char2.name} replied. "Both still breathing. Which means either you're not the killer you pretend to be, or I'm not the villain you need me to be."`,
      ]
    };
    
    const options = encounters[relType] || encounters.KNOWS;
    return this._randomFrom(options);
  }

  _generateClimax(char1, char2, theme, tone) {
    const themes = {
      'power': `And then, in a moment that would echo through Aethermere's history, the truth became undeniable. Power was not given by storms or gods or priesthoods. Power was taken — and the cost of taking it was always paid by someone else.\n\n${char1.name} understood this now with a clarity that felt like Aetherbinding in reverse: instead of losing a sense, they gained one. The sense of exactly how much time they had left. Not much. Not enough. But perhaps — just perhaps — enough to matter.`,
      'truth': `The truth, when it finally came, was smaller than expected. Not a thunderclap revelation but a quiet certainty that settled into ${char1.name}'s bones like pressure sickness — slow, inevitable, and impossible to ignore.\n\nThe storms were not dying. They were being killed. And the weapon was one that every citizen of Aethermere used every day without knowing what it cost.\n\nThe Breath Tithe was not a tax. It was a funeral rite for a world that had been dying since the day they arrived.`,
      'sacrifice': `${char1.name} looked at their hands — hands that had channeled a thousand storms, that had lost the ability to feel the difference between silk and steel. The sacrifice had always been presented as noble. Holy. Necessary.\n\nBut standing here, in this moment, with the weight of everything bearing down, they realized the greatest sacrifice was not the senses they had given to the storms.\n\nIt was the questions they had stopped asking.`,
      'revolution': `The first strike came not as violence but as silence. Every Storm Harvester in the lower arrays stopped working at precisely the same moment. The machinery ground to a halt. The energy grid flickered. The Spire Sanctum's lights dimmed for the first time in living memory.\n\nHigh above, the Wind Priesthood felt it like a blade between the ribs.\n\nBelow, ${char1.name} watched the darkness spread upward and felt something they hadn't felt in years: hope. Terrible, dangerous, world-breaking hope.`,
      'discovery': `The readings made no sense. ${char1.name} checked them three times, then a fourth, then threw the instrument against the wall and listened to it shatter with something between satisfaction and despair.\n\nThe numbers were impossible. The energy signature from below wasn't just strong — it was alive. It pulsed like a heartbeat, vast and slow and patient, as if it had been waiting for someone to finally look down instead of up.\n\n"We've been praying to the sky," ${char1.name} whispered, "while a god slept beneath our feet."`
    };
    
    return themes[theme] || themes[this._randomFrom(Object.keys(themes))];
  }

  _generateResolution(character, theme, tone) {
    const resolutions = [
      `${character.name} left ${this._randomFrom(['in silence', 'before dawn', 'without looking back', 'carrying a burden that had no name'])}. The world was the same as it had been an hour ago — same dying storms, same crumbling empire, same impossible choices.\n\nBut ${character.name} was different. And in a world where nothing changed, even a small difference could be the first crack in the wall that held everything together.\n\nOr the last crack before everything fell apart.\n\nThe storms would decide. They always did. But for the first time, ${character.name} wondered if the storms were even listening anymore.`,
      `When it was over — if such things were ever truly over — ${character.name} stood alone in the fading light and tried to remember what certainty felt like.\n\nThe empire was dying. That much was sure. But dying was not the same as dead, and in the space between those two words lay everything that mattered.\n\nSomewhere below, the Voice whispered. Somewhere above, the last stars waited. And here, in the middle of everything, ${character.name} made the only choice that was left.\n\nThey chose to continue.`,
      `The record would show that nothing significant happened that day. No battles were fought. No decrees were issued. The storms continued their slow recession, and the empire continued its slow unraveling.\n\nBut records are written by those who survive, and survival in Aethermere was becoming less a matter of strength than of knowing which way the wind was shifting.\n\n${character.name} knew. They had always known. The question was whether knowing would be enough.\n\nIt never had been before.\n\nBut then again — the world had never been this desperate before either.`
    ];
    
    return this._randomFrom(resolutions);
  }

  // ── Dialogue Generation ───────────────────────────────────

  _generateDialogue(params) {
    const characters = params.characters 
      ? params.characters.map(id => this.bible.getEntity(id)).filter(Boolean)
      : this._selectRelevantCharacters(2, 2);
    
    if (characters.length < 2) {
      characters.push(...this._selectRelevantCharacters(2 - characters.length, 2 - characters.length));
    }
    
    const char1 = characters[0];
    const char2 = characters[1];
    const location = params.location 
      ? this.bible.getEntity(params.location)
      : this._selectRelevantLocation(characters);
    
    const relationships = this.bible.getRelationshipsBetween(char1.id, char2.id);
    const relType = relationships.length > 0 ? relationships[0].type : 'KNOWS';
    
    const title = `${char1.name} & ${char2.name}: A ${this._relTypeToTone(relType)} Exchange`;
    const content = this._generateDialogueContent(char1, char2, relType, location);
    
    return {
      title,
      content,
      characters: characters.map(c => ({ id: c.id, name: c.name })),
      location: location ? { id: location.id, name: location.name } : null,
      tone: this._relTypeToTone(relType),
      theme: 'dialogue',
      wordCount: content.split(/\s+/).length
    };
  }

  _generateDialogueContent(char1, char2, relType, location) {
    const loc = location || { name: 'the meeting place' };
    const c1Props = char1.properties || {};
    const c2Props = char2.properties || {};
    
    const setting = `*${loc.name}. The ambient hum of storm energy pulses through the walls. ${char1.name} and ${char2.name} face each other across a distance that has nothing to do with physical space.*`;
    
    const dialogueLines = this._getDialogueLines(char1, char2, relType);
    
    return `${setting}\n\n${dialogueLines}`;
  }

  _getDialogueLines(char1, char2, relType) {
    const lines = [];
    const c1Style = this._getCharacterVoice(char1);
    const c2Style = this._getCharacterVoice(char2);
    
    const dialogueSets = {
      ENEMY_OF: [
        { c1: `"You have exactly thirty seconds before my guards arrive. I suggest you use them wisely."`, c2: `"Your guards?" *A thin smile.* "They're the ones who let me in. Interesting times we live in, ${char1.name}."`, c1r: `*A pause. The kind of pause that precedes either violence or truth.* "What do you want?"`, c2r: `"The same thing you want. I just have the courage to say it out loud: this empire is dying, and everyone who props up its corpse goes down with it."`, c1f: `"And your solution is what? Burn it all down? Replace one tyranny with another?"`, c2f: `"My solution is to stop pretending the storms care about your prayers. The Breath Divine isn't angry — it's *leaving*. And when it's gone, your Priesthood, your Spire, your entire cosmology becomes a monument to nothing."\n\n*Silence. The storm energy in the walls flickers.*\n\n"You know I'm right," ${char2.name} says, quieter now. "That's why I'm still alive."` },
      ],
      ALLIED_WITH: [
        { c1: `"The latest readings are... concerning."`, c2: `"'Concerning.' ${char1.name}, the storm output has dropped another 3% this quarter. We're past 'concerning' and well into 'catastrophic.'"`, c1r: `"I know the numbers."`, c2r: `"Then you know we can't wait anymore. The plan—"`, c1f: `"—is dangerous. Reckless. And probably our only option."\n\n*${char2.name} meets ${char1.name}'s eyes. In them, something that might be hope or might be the last flicker of light before darkness.*\n\n"When do we begin?" ${char2.name} asks.\n\n"We already have," ${char1.name} replies. "The moment we stopped pretending things would get better on their own, we began. Everything since has been logistics."` },
      ],
      MENTOR_OF: [
        { c1: `"Sit. You look like you haven't slept since the last moon."`, c2: `"I haven't."`, c1r: `"And what has your sleeplessness purchased? Clarity? Or just more questions?"`, c2r: `*A long exhalation.* "I found something. In the old records. The ones they said were destroyed in the archive fire."`, c1f: `*${char1.name}'s expression doesn't change, but something shifts behind their eyes — a door closing, or perhaps opening.*\n\n"There was no archive fire," ${char1.name} says softly. "I know. I helped hide them."\n\n"Then you know what they say. About the storms. About what's really—"\n\n"I know what they say. I've known for forty years. And I've spent every one of those years trying to decide if the truth would save us or destroy us."\n\n"And? What did you decide?"\n\n"That the choice was never mine to make. It's yours now."` },
      ]
    };
    
    const defaultDialogue = { c1: `"We need to talk," ${char1.name} says.`, c2: `${char2.name} considers this. "We do. Though I suspect neither of us will enjoy it."`, c1r: `"Since when has enjoyment been a factor in anything we do?"`, c2r: `"A fair point. Speak, then. The storms wait for no one — though lately they barely show up at all."`, c1f: `*And so they talk. Not easily — nothing in Aethermere is easy anymore — but with the desperate honesty of people who have run out of comfortable lies.*\n\n*The storm energy in the walls pulses in time with their words, as if the world itself is listening.*\n\n*Perhaps it is.*` };
    
    const set = (dialogueSets[relType] || [defaultDialogue])[0] || defaultDialogue;
    
    return `**${char1.name}:** ${set.c1}\n\n**${char2.name}:** ${set.c2}\n\n**${char1.name}:** ${set.c1r}\n\n**${char2.name}:** ${set.c2r}\n\n${set.c1f}`;
  }

  // ── Character Arc Generation ──────────────────────────────

  _generateCharacterArc(params) {
    const character = params.characters 
      ? this.bible.getEntity(params.characters[0])
      : this._selectRelevantCharacters(1, 1)[0];
    
    if (!character) return this._generateChronicle(params);
    
    const props = character.properties || {};
    const relationships = this.bible.getRelationshipsFor(character.id);
    
    const title = `The Arc of ${character.name}: ${this._randomFrom(['A Reckoning', 'Descent', 'Awakening', 'The Choice', 'Breaking Point'])}`;
    
    const sections = [];
    
    // Who they were
    sections.push(`## Who They Were\n\n${character.name} was not always this. Before the title of ${props.role || 'their current station'}, before the weight of ${this.bible.metadata.name || 'the world'} settled on their shoulders, they were simply a person with ${(props.personality || ['complex feelings']).slice(0, 2).join(' and ').toLowerCase()} tendencies and a future that seemed, if not bright, at least survivable.`);
    
    // What shaped them
    if (props.trauma) {
      sections.push(`## What Shaped Them\n\n${props.trauma}. This is the wound that never healed — the one that ${character.name} carries like a second heartbeat, constant and inescapable. Every decision since has been either an attempt to prevent it from happening again or a recognition that prevention was always an illusion.`);
    }
    
    // What drives them
    if (props.goals && props.goals.length > 0) {
      sections.push(`## What Drives Them\n\n${props.goals.map((g, i) => `${i + 1}. **${g}** — ${i === 0 ? 'The primary obsession. Everything else is subordinate to this.' : i === 1 ? 'The secondary goal, often in conflict with the first.' : 'The quiet wish they barely admit to themselves.'}`).join('\n')}`);
    }
    
    // What they fear
    if (props.fears && props.fears.length > 0) {
      sections.push(`## What They Fear\n\n${props.fears.map(f => `> *"${f}"*`).join('\n\n')}\n\nThese fears do not make ${character.name} weak. They make them human. In Aethermere, where the storms strip away everything that isn't essential, fear is often the last honest thing a person has.`);
    }
    
    // Current state
    sections.push(`## Where They Stand Now\n\n${props.emotionalState || 'At a crossroads'}. The empire crumbles. The storms fade. And ${character.name} stands at the intersection of everything they've built and everything they've lost, knowing that the next choice they make will define not just their arc — but the arc of the entire world.\n\nThe question is not whether they will act. They will. They must.\n\nThe question is whether the world will survive the answer.`);
    
    const content = sections.join('\n\n---\n\n');
    
    return {
      title,
      content,
      characters: [{ id: character.id, name: character.name }],
      location: null,
      tone: 'introspective',
      theme: 'character',
      wordCount: content.split(/\s+/).length
    };
  }

  // ── Battle Report ─────────────────────────────────────────

  _generateBattle(params) {
    const characters = params.characters 
      ? params.characters.map(id => this.bible.getEntity(id)).filter(Boolean)
      : this._selectRelevantCharacters(2, 4);
    
    const location = params.location 
      ? this.bible.getEntity(params.location)
      : this._selectRelevantLocation(characters);
    
    const title = `The ${this._randomFrom(['Siege', 'Battle', 'Clash', 'Skirmish'])} of ${location ? location.name : 'the Borderlands'}`;
    
    const content = `# ${title}\n\n*An account from the chronicles of Aethermere*\n\n---\n\nThe ${location ? location.name : 'contested ground'} had seen conflict before — but never like this. The dying storms above seemed to pause, as if even the atmosphere held its breath.\n\n${characters.map(c => `**${c.name}** stood with their forces, ${c.properties?.emotionalState || 'ready for what came next'}.`).join(' ')}\n\nThe first Aetherbinding strike came without warning — a lance of compressed atmospheric energy that shattered a platform's support strut and sent fifty people tumbling into the void. The screams were lost in the wind before they could become memory.\n\n${characters.length >= 2 ? `${characters[0].name} and ${characters[1].name} found each other in the chaos, as they always did. Gravity and hatred have similar properties — both are invisible forces that bend everything around them toward collision.\n\n"This ends today," one of them said.\n\n"It ended years ago," the other replied. "We're just too stubborn to notice."` : ''}\n\nThe battle raged for six hours. When it was over, nothing had been won — but everything had changed. The map of Aethermere would need to be redrawn. Again.\n\n**Casualties:** The storms took their share, as they always did. The final count was a number that looked like a statistic on paper and like the end of the world in person.\n\n**Consequences:** The balance of power shifted. Not dramatically — dramatic shifts are for stories. In reality, power seeps like water, finding new levels through cracks that nobody noticed until they became canyons.`;
    
    return {
      title,
      content,
      characters: characters.map(c => ({ id: c.id, name: c.name })),
      location: location ? { id: location.id, name: location.name } : null,
      tone: 'epic',
      theme: 'conflict',
      wordCount: content.split(/\s+/).length
    };
  }

  // ── Prophecy ──────────────────────────────────────────────

  _generateProphecy(params) {
    const prophecies = [
      {
        title: 'The Prophecy of the Last Storm',
        content: `*Spoken by Sylara the Voiceless, in the depths where light fears to follow:*\n\n---\n\n> When the last storm falls silent,\n> and the Spire's crown goes dark,\n> the Breath Divine shall speak\n> not through wind, but through the void between winds.\n\n> Five senses given, one truth received:\n> the sky was never your home.\n> You are guests in a house\n> built on the back of something sleeping.\n\n> It stirs now.\n> Not in anger — in curiosity.\n> A thousand years of prayers\n> have finally reached ears\n> you never imagined existed.\n\n> The boy who fell will rise.\n> The captain who fled will return.\n> The priest who prayed will doubt.\n> The rebel who burned will build.\n> And the king who whispered\n> will finally *scream*.\n\n> This is not prophecy.\n> Prophecy implies uncertainty.\n> This is weather.\n> And I am telling you:\n> the storm is coming.\n> Not from above.\n> From below.\n\n---\n\n*The bioluminescent organisms in the Whisperdeep pulsed once in unison after these words were spoken. None of them had ever done that before. None of them stopped doing it afterward.*`
      },
      {
        title: 'The Prophecy of the Forked Path',
        content: `*Found inscribed in pre-human script on a fragment of the Shattered Ring, translated imperfectly:*\n\n---\n\n> TO THE CHILDREN OF THE BORROWED SKY:\n>\n> You came seeking refuge.\n> You found a prison.\n> The difference is a matter of\n> how long you choose not to look at the locks.\n\n> Two paths lie before you:\n>\n> UPWARD — through the thinning atmosphere,\n> past the boundary your priests declared holy\n> (it was never holy; it was a fence),\n> into the void where your ancestors\n> once traveled as easily as breathing.\n>\n> DOWNWARD — into the pressure,\n> into the warmth,\n> into the arms of something\n> that has been singing to you\n> since before you had ears to hear.\n\n> Both paths lead to survival.\n> Neither path leads home.\n> Home was lost before you arrived.\n> Home is a story you tell\n> so the darkness feels smaller.\n\n> Choose soon.\n> The borrowed sky\n> wants its breath back.\n\n---\n\n*This translation has been suppressed by every High Templar since its discovery. The current High Templar, Vael Tempest, is the first to question whether suppression was wise.*`
      },
      {
        title: 'The Prophecy of Five Silences',
        content: `*Murmured by Elder Liren Storm-Touched in her 91st year, through touch-language pressed into the palm of her final student:*\n\n---\n\n> The First Silence was wonder.\n> We arrived and the storms greeted us\n> and we were too awed to speak.\n\n> The Second Silence was prayer.\n> We knelt before the wind\n> and offered our senses as tribute\n> and called it holy.\n\n> The Third Silence was denial.\n> The storms began to weaken\n> and we pressed our lips together\n> and refused to name what we knew.\n\n> The Fourth Silence is now.\n> It is the silence of a world\n> holding its breath\n> before the scream.\n\n> The Fifth Silence...\n>\n> The Fifth Silence I have heard.\n> It comes from below.\n> It is vast. It is patient.\n> And it is not silence at all.\n>\n> It is a voice so deep\n> that only the senseless can hear it.\n> I hear it every moment of every day.\n> It says one word.\n> The same word.\n> Over and over.\n>\n> *Welcome.*\n\n---\n\n*Liren has not spoken since delivering this prophecy. Whether she cannot or will not is a distinction that may not matter.*`
      }
    ];
    
    const prophecy = this._randomFrom(prophecies);
    
    return {
      ...prophecy,
      characters: [],
      location: null,
      tone: 'mystical',
      theme: 'prophecy',
      wordCount: prophecy.content.split(/\s+/).length
    };
  }

  // ── Helper Methods ────────────────────────────────────────

  _selectRelevantCharacters(min, max) {
    const allChars = this.bible.getCharacters();
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const shuffled = [...allChars].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  _selectRelevantLocation(characters) {
    if (characters.length > 0) {
      const firstChar = characters[0];
      const locRels = this.bible.getRelationshipsFor(firstChar.id)
        .filter(r => r.type === 'LOCATED_IN');
      if (locRels.length > 0) {
        return this.bible.getEntity(locRels[0].target);
      }
    }
    const allLocs = this.bible.getLocations();
    return allLocs.length > 0 ? this._randomFrom(allLocs) : null;
  }

  _selectTheme() {
    return this._randomFrom(['power', 'truth', 'sacrifice', 'revolution', 'discovery']);
  }

  _getSensoryDetails(location, tone) {
    const details = {
      tense: 'The air hummed with barely-contained energy, each breath carrying the metallic tang of atmospheric charge.',
      melancholic: 'A soft luminescence filtered through the cloud layers, casting everything in shades of fading gold.',
      hopeful: 'Somewhere in the distance, a wind current carried the sound of singing — faint but unmistakable.',
      ominous: 'The deep vibrations from below resonated in the bones, a frequency felt rather than heard.'
    };
    return details[tone] || details.ominous;
  }

  _getCharacterVoice(character) {
    const props = character.properties || {};
    return props.speechStyle || 'measured and deliberate';
  }

  _relTypeToTone(relType) {
    const tones = {
      ENEMY_OF: 'Hostile', ALLIED_WITH: 'Strategic', MENTOR_OF: 'Wisdom',
      KNOWS: 'Tense', RIVAL_OF: 'Charged', BETRAYED: 'Bitter',
      LOVES: 'Intimate', FEARS: 'Fearful'
    };
    return tones[relType] || 'Complex';
  }

  _fillTemplate(template, data) {
    let result = template;
    if (data.characters && data.characters[0]) {
      result = result.replace('{character1}', data.characters[0].name);
    }
    if (data.characters && data.characters[1]) {
      result = result.replace('{character2}', data.characters[1].name);
    }
    if (data.location) {
      result = result.replace('{location}', data.location.name);
    }
    if (data.theme) {
      result = result.replace('{theme}', data.theme);
    }
    return result;
  }

  _randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  _initTemplates() {
    return {
      chronicles: [
        { title: 'The {theme} of {location}', structure: 'classic' },
        { title: '{character1} and the Weight of {theme}', structure: 'character-driven' },
        { title: 'When {character1} Met {character2}', structure: 'encounter' },
        { title: 'Whispers in {location}', structure: 'atmospheric' },
        { title: 'The Last {theme}', structure: 'climactic' }
      ]
    };
  }

  // ── Get story types available ─────────────────────────────

  getStoryTypes() {
    return [
      { id: 'chronicle', name: 'Chronicle', description: 'A narrative account of events in the world', icon: '📜' },
      { id: 'dialogue', name: 'Dialogue Scene', description: 'An intimate conversation between characters', icon: '💬' },
      { id: 'character_arc', name: 'Character Arc', description: 'A deep dive into a character\'s journey', icon: '🎭' },
      { id: 'battle', name: 'Battle Report', description: 'An account of conflict and its aftermath', icon: '⚔️' },
      { id: 'prophecy', name: 'Prophecy', description: 'Mystical visions of what was and what will be', icon: '🔮' }
    ];
  }
}
