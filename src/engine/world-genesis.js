// ============================================================
// SCRIPTFORGE — World Genesis Engine
// Takes a text prompt and bootstraps the entire World Bible
// ============================================================

import { WorldBible, RelationshipTypes, EntityTypes } from './world-bible.js';

export class WorldGenesisEngine {
  
  /**
   * Generate a complete world from a text prompt.
   * In demo mode, uses the pre-crafted Aethermere world.
   * In production, this would call an LLM API.
   */
  static async generate(prompt, options = {}) {
    const bible = new WorldBible();
    bible.metadata.name = options.name || 'Generated World';
    bible.metadata.prompt = prompt;
    bible.metadata.createdAt = Date.now();
    bible.metadata.lastModified = Date.now();

    // Check if the demo world should be used
    const isDemo = prompt.toLowerCase().includes('dying empire') ||
                   prompt.toLowerCase().includes('gas giant') ||
                   prompt.toLowerCase().includes('wind priest') ||
                   options.useDemo;

    if (isDemo) {
      await this._buildAethermere(bible, options.onProgress);
    } else {
      await this._buildProceduralWorld(bible, prompt, options.onProgress);
    }

    return bible;
  }

  // ── The Demo World: Aethermere ─────────────────────────────

  static async _buildAethermere(bible, onProgress) {
    bible.metadata.name = 'The Dying Empire of Aethermere';

    const progress = (phase, detail) => {
      if (onProgress) onProgress(phase, detail);
    };

    // ── Phase 1: Core Lore ──────────────────────────────────
    progress('lore', 'Forging the foundations of reality...');
    await this._delay(300);

    bible.addRule({
      category: 'physics',
      name: 'Gas Giant Environment',
      description: 'Aethermere exists within the upper atmosphere of a massive gas giant. There is no solid ground — all civilization is built on floating platforms, condensed cloud-crystal, and harvested storm structures. Gravity is 0.8x Earth standard in the upper layers.',
      constraints: ['No natural solid ground exists', 'Structures must be anchored to atmospheric currents', 'Falling below the cloud floor means death by pressure'],
      exceptions: ['The Whisperdeep has semi-solid crystallized gas formations']
    });

    bible.addRule({
      category: 'magic',
      name: 'Aetherbinding',
      description: 'The art of harvesting kinetic energy from storms and atmospheric turbulence. Practitioners channel raw atmospheric force through their bodies to power technology, heal, or destroy. The cost is always physical — each use permanently dulls one of the user\'s senses.',
      constraints: [
        'Every use of Aetherbinding permanently reduces one sense (touch, then smell, then taste, then hearing, then sight)',
        'The more powerful the binding, the greater the sensory cost',
        'No Aetherbinder has ever retained all five senses past age 40',
        'Cannot create matter, only redirect and amplify existing energy',
        'Binding requires direct exposure to atmospheric currents — cannot work indoors'
      ],
      exceptions: ['The High Templar can temporarily restore senses using the Stormheart Reliquary']
    });

    bible.addRule({
      category: 'social',
      name: 'The Breath Tithe',
      description: 'Every citizen must contribute one hour per week to the Storm Harvesting arrays. This "Breath Tithe" powers the civilization. Those who refuse are cast into the Undercloud.',
      constraints: ['Universal obligation for all citizens aged 12-60', 'Nobles can pay proxies but must serve once per season'],
      exceptions: ['Wind Priests are exempt as they serve the storms directly']
    });

    bible.addRule({
      category: 'biological',
      name: 'Cloud Adaptation',
      description: 'Over millennia, Aethermere\'s people have evolved denser lungs, lighter bones, and inner ear structures that sense atmospheric pressure changes. They can survive at altitudes that would kill baseline humans.',
      constraints: ['Cannot survive below the Pressure Line at -2000m', 'Need supplemental oxygen above the Thinning at +8000m']
    });

    // ── Phase 2: Locations ──────────────────────────────────
    progress('geography', 'Mapping the floating realms...');
    await this._delay(400);

    const spireSanctum = bible.addEntity({
      type: EntityTypes.LOCATION,
      name: 'The Spire Sanctum',
      description: 'The highest point in Aethermere — a needle-thin tower of crystallized storm energy that pierces through the upper cloud layer into the serene void above. Home to the Wind Priesthood and seat of imperial power. Its walls shimmer with trapped lightning, and its halls echo with the prayers of a dying faith.',
      properties: {
        altitude: 6200,
        climate: 'Thin air, perpetual auroral glow, near-zero wind',
        population: 12000,
        significance: 'Capital of the Empire, religious center',
        threat: 'Structural instability as storms weaken',
        resources: ['Crystallized storm energy', 'Void-touched artifacts', 'Ancient star maps']
      },
      tags: ['capital', 'religious', 'imperial', 'endangered'],
      imagePrompt: 'A towering crystalline spire piercing through clouds into a star-filled void, glowing with trapped lightning, ethereal purple and gold atmosphere, fantasy sci-fi architecture, dramatic lighting'
    });

    const cloudfall = bible.addEntity({
      type: EntityTypes.LOCATION,
      name: 'The Cloudfall Markets',
      description: 'A sprawling bazaar built across dozens of interconnected floating platforms at mid-altitude. The economic heart of Aethermere, where storm-harvested energy is traded, information is sold, and revolution is whispered. Colorful awnings snap in perpetual wind, and the air smells of ozone and exotic spices.',
      properties: {
        altitude: 3800,
        climate: 'Moderate winds, frequent light rain, warm',
        population: 85000,
        significance: 'Trade hub, information nexus, rebel hotbed',
        threat: 'Platform decay, pirate raids',
        resources: ['Trade goods', 'Information networks', 'Black market technology']
      },
      tags: ['trade', 'urban', 'rebellion', 'crowded'],
      imagePrompt: 'A vast floating marketplace on interconnected platforms in the clouds, colorful awnings and bridges, bustling with traders, warm golden light through clouds, fantasy bazaar in the sky'
    });

    const stormAnvil = bible.addEntity({
      type: EntityTypes.LOCATION,
      name: 'The Storm Anvil',
      description: 'A massive industrial complex suspended in the heart of the most violent storm zone. Here, the Storm Harvesters Guild captures raw atmospheric energy and forges it into usable power cells. The work is brutal and dangerous — workers are chained to their stations during the worst tempests. The anvil groans and shudders constantly.',
      properties: {
        altitude: 2800,
        climate: 'Extreme storms, constant lightning, deafening wind',
        population: 30000,
        significance: 'Primary energy production, industrial heart',
        threat: 'Storm intensity declining, structural fatigue',
        resources: ['Raw storm energy', 'Power cells', 'Storm-forged metals']
      },
      tags: ['industrial', 'dangerous', 'vital', 'declining'],
      imagePrompt: 'A massive dark industrial forge suspended in a violent electrical storm, lightning striking metal structures, workers in protective gear, ominous red and purple atmosphere, industrial fantasy'
    });

    const whisperdeep = bible.addEntity({
      type: EntityTypes.LOCATION,
      name: 'The Whisperdeep',
      description: 'The lowest habitable zone of Aethermere, where atmospheric pressure creates semi-solid crystallized gas formations. A mysterious realm of caves and tunnels carved into living cloud-crystal. Home to the Silent Depths faction — exiles, mystics, and those who have heard the Voice Below. The light here is bioluminescent, cast by pressure-adapted organisms.',
      properties: {
        altitude: -800,
        climate: 'Dense atmosphere, warm, bioluminescent, still',
        population: 15000,
        significance: 'Exile territory, mystical site, resource-rich',
        threat: 'Pressure sickness, unknown entities below',
        resources: ['Cloud crystal', 'Bioluminescent organisms', 'Ancient fossils', 'Compressed gas deposits']
      },
      tags: ['underground', 'mysterious', 'exile', 'mystical'],
      imagePrompt: 'An otherworldly underground cavern made of translucent crystallized gas, bioluminescent organisms glowing in blues and greens, mysterious figures in robes, ethereal and haunting atmosphere'
    });

    const shatteredRing = bible.addEntity({
      type: EntityTypes.LOCATION,
      name: 'The Shattered Ring',
      description: 'The ruins of an ancient orbital structure that fell into Aethermere\'s atmosphere centuries ago. Now a debris field of alien metal and impossible geometries, orbiting the gas giant at cloud level. Treasure hunters and scholars risk their lives to salvage pre-human technology from its twisted wreckage. Some fragments still hum with unknown energy.',
      properties: {
        altitude: 4500,
        climate: 'Unpredictable micro-weather, radiation pockets',
        population: 2000,
        significance: 'Archaeological site, technology source, mystery',
        threat: 'Structural collapse, radiation, automated defenses',
        resources: ['Pre-human technology', 'Exotic materials', 'Data fragments']
      },
      tags: ['ruins', 'ancient', 'dangerous', 'treasure'],
      imagePrompt: 'Massive broken fragments of an alien orbital station floating in a gas giant atmosphere, twisted metal and impossible geometries, explorers on small craft, mysterious and awe-inspiring, sci-fi fantasy'
    });

    const exilesDrift = bible.addEntity({
      type: EntityTypes.LOCATION,
      name: 'The Exile\'s Drift',
      description: 'A loose collection of rogue platforms and repurposed storm-ships that drift freely through Aethermere\'s atmosphere, never anchoring. Home to the Exiled Skyborn — those cast out of the empire for defiance, crime, or simply being inconvenient. Despite their outcast status, the Drift has become a haven of freedom, innovation, and desperate hope.',
      properties: {
        altitude: 'Variable (1000-5000)',
        climate: 'Whatever they drift through',
        population: 20000,
        significance: 'Rebel stronghold, innovation hub, refugee haven',
        threat: 'Imperial pursuit, resource scarcity, internal conflict',
        resources: ['Salvaged technology', 'Free thinkers', 'Pirated goods']
      },
      tags: ['mobile', 'rebel', 'freedom', 'resourceful'],
      imagePrompt: 'A ragtag fleet of floating platforms and repurposed airships drifting through golden clouds, makeshift bridges and colorful banners, a rebel haven in the sky, warm and hopeful atmosphere'
    });

    // ── Phase 3: Factions ───────────────────────────────────
    progress('factions', 'Weaving the threads of power...');
    await this._delay(400);

    const windPriesthood = bible.addEntity({
      type: EntityTypes.FACTION,
      name: 'The Wind Priesthood',
      description: 'The ancient religious order that has ruled Aethermere for a thousand years. They claim divine authority from the storms themselves, interpreting atmospheric patterns as the will of the Breath Divine. As the storms weaken, so does their power — and they grow increasingly desperate to maintain control. Some seek genuine solutions; others resort to tyranny.',
      properties: {
        power: 85,
        influence: 'Declining',
        ideology: 'Theocratic authority, storm worship, tradition',
        strength: 'Religious legitimacy, Aetherbinding mastery, institutional control',
        weakness: 'Declining storms, internal divisions, public disillusionment',
        color: '#7B68EE',
        symbol: '🌪️'
      },
      tags: ['ruling', 'religious', 'declining', 'divided']
    });

    const rebellion = bible.addEntity({
      type: EntityTypes.FACTION,
      name: 'The Undercloud Rebellion',
      description: 'A growing revolutionary movement born in the lower platforms, fueled by inequality and the priesthood\'s failures. They believe the storms are dying because the Priesthood has been harvesting them unsustainably for centuries. Their solution: overthrow the priests, redistribute storm energy, and find new ways to survive. United by rage, divided by vision.',
      properties: {
        power: 45,
        influence: 'Rising rapidly',
        ideology: 'Egalitarian revolution, sustainability, secular governance',
        strength: 'Popular support, desperation, nothing to lose',
        weakness: 'Lack of resources, internal disagreements, no governing experience',
        color: '#DC143C',
        symbol: '⚡'
      },
      tags: ['revolutionary', 'growing', 'idealistic', 'fractured']
    });

    const guild = bible.addEntity({
      type: EntityTypes.FACTION,
      name: 'The Storm Harvesters Guild',
      description: 'The industrial backbone of Aethermere. They control the harvesting arrays and energy distribution — which means they control civilization\'s lifeblood. Officially neutral in the political struggle, they play both sides for profit. But as storms decline, their business model is dying too, and some within the Guild are seeking... alternative energy sources.',
      properties: {
        power: 70,
        influence: 'Stable but threatened',
        ideology: 'Pragmatic capitalism, energy monopoly, survival through innovation',
        strength: 'Controls energy infrastructure, wealth, technical expertise',
        weakness: 'Dependent on declining storms, morally flexible, distrusted',
        color: '#DAA520',
        symbol: '⚙️'
      },
      tags: ['industrial', 'wealthy', 'pragmatic', 'secretive']
    });

    const silentDepths = bible.addEntity({
      type: EntityTypes.FACTION,
      name: 'The Silent Depths',
      description: 'Mystics and exiles who have descended to the lowest habitable zones of the atmosphere. They claim to hear a "Voice Below" — something ancient and vast that existed before Aethermere\'s people arrived. They practice a forbidden form of Aetherbinding that draws power from pressure rather than storms. The establishment calls them insane. They may be the only ones who understand what\'s really happening.',
      properties: {
        power: 25,
        influence: 'Minimal but growing',
        ideology: 'Mysticism, communion with the deep, forbidden knowledge',
        strength: 'Unique abilities, hidden knowledge, pressure-binding',
        weakness: 'Small numbers, seen as lunatics, dangerous territory',
        color: '#00CED1',
        symbol: '🔮'
      },
      tags: ['mystical', 'outcast', 'visionary', 'dangerous']
    });

    const skyborn = bible.addEntity({
      type: EntityTypes.FACTION,
      name: 'The Exiled Skyborn',
      description: 'A loose confederation of exiles, free thinkers, and outcasts who drift through the atmosphere on repurposed platforms. They reject both the Priesthood and the Rebellion, believing that Aethermere\'s future lies not in controlling the storms but in leaving the gas giant entirely. They\'re building something in secret — a vessel designed to breach the atmosphere and reach the stars.',
      properties: {
        power: 30,
        influence: 'Growing among the desperate',
        ideology: 'Freedom, exploration, transcendence, leaving the gas giant',
        strength: 'Innovation, salvaged technology, adaptability, hope',
        weakness: 'No home base, resource scarcity, hunted by the empire',
        color: '#FF6347',
        symbol: '🚀'
      },
      tags: ['nomadic', 'innovative', 'hopeful', 'hunted']
    });

    // ── Phase 4: Characters ─────────────────────────────────
    progress('characters', 'Breathing life into souls...');
    await this._delay(500);

    const vaelTempest = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'High Templar Vael Tempest',
      description: 'The aging leader of the Wind Priesthood and de facto ruler of Aethermere. Once a true believer, she has watched her faith crumble as the storms weaken. She knows the empire is dying but cannot bring herself to abandon the old ways. Blind in one eye from decades of Aetherbinding, she sees more clearly than anyone the doom approaching — and is paralyzed by it.',
      properties: {
        age: 62,
        role: 'High Templar, Supreme Authority',
        personality: ['Wise', 'Conflicted', 'Proud', 'Haunted', 'Secretly Compassionate'],
        goals: ['Save the empire', 'Preserve the faith', 'Find the truth about the dying storms'],
        fears: ['That the Priesthood caused the storm decline', 'Dying without a successor', 'The Voice Below'],
        trauma: 'Ordered the Exile Purge fifteen years ago — cast thousands into the Undercloud to die',
        speechStyle: 'Formal, measured, occasionally breaking into raw emotion',
        senses: { touch: 'gone', smell: 'fading', taste: 'fading', hearing: 'intact', sight: 'one eye blind' },
        alive: true,
        emotionalState: 'Desperate determination masking deep despair'
      },
      tags: ['leader', 'priesthood', 'powerful', 'conflicted', 'tragic'],
      imagePrompt: 'An elderly woman with one blind eye in flowing wind-priest robes, standing at the edge of a crystalline tower, silver hair whipping in the wind, regal but tired, dramatic purple and gold lighting'
    });

    const korenAsh = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'Koren Ash',
      description: 'The charismatic young leader of the Undercloud Rebellion. Born in the lowest platforms where people choke on recycled air, she rose through the ranks on pure fury and brilliant strategy. She\'s a talented Aetherbinder who refuses to accept the cost — she binds storms with mechanical augmentation instead, which the Priesthood considers heresy. She wants justice, but the line between justice and vengeance blurs more each day.',
      properties: {
        age: 28,
        role: 'Commander of the Rebellion',
        personality: ['Fiery', 'Brilliant', 'Reckless', 'Empathetic', 'Vengeful'],
        goals: ['Overthrow the Priesthood', 'Redistribute energy', 'Build a just society'],
        fears: ['Becoming what she fights against', 'Losing her humanity to the cause', 'That the storms can\'t be saved'],
        trauma: 'Her younger brother was taken in the Breath Tithe at age 10 and never returned',
        speechStyle: 'Direct, passionate, laced with dark humor',
        senses: { touch: 'intact', smell: 'intact', taste: 'intact', hearing: 'intact', sight: 'intact' },
        alive: true,
        emotionalState: 'Burning rage barely contained by strategic thinking'
      },
      tags: ['rebel', 'leader', 'fiery', 'heretic', 'augmented'],
      imagePrompt: 'A fierce young woman with mechanical augments on her arms, short dark hair, standing on a rebel platform with lightning in the background, determined expression, red and orange tones'
    });

    const theron = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'Guildmaster Theron Vex',
      description: 'The calculating head of the Storm Harvesters Guild. He has no ideology — only survival calculus. He sells energy to whoever can pay and information to whoever pays more. Beneath his mercenary exterior, he harbors a terrifying secret: the Guild has discovered an alternative energy source deep below the cloud floor, but harnessing it might wake something that should stay asleep.',
      properties: {
        age: 45,
        role: 'Guildmaster of the Storm Harvesters',
        personality: ['Calculating', 'Pragmatic', 'Amoral', 'Secretly Terrified', 'Brilliant Engineer'],
        goals: ['Ensure the Guild\'s survival', 'Exploit the deep energy source', 'Play all sides'],
        fears: ['What lies below', 'Being exposed', 'A world without profit'],
        trauma: 'Watched his entire family die in a storm collapse when the harvesting arrays failed',
        speechStyle: 'Smooth, transactional, always offering a deal',
        senses: { touch: 'dulled', smell: 'intact', taste: 'intact', hearing: 'intact', sight: 'intact' },
        alive: true,
        emotionalState: 'Controlled calm masking existential terror'
      },
      tags: ['merchant', 'neutral', 'secretive', 'dangerous', 'wealthy'],
      imagePrompt: 'A middle-aged man in elaborate merchant-engineer clothing, sharp eyes, standing in front of massive storm harvesting machinery, golden and bronze tones, calculating expression'
    });

    const sylara = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'Sylara the Voiceless',
      description: 'The enigmatic oracle of the Silent Depths. She gave up all five senses voluntarily through extreme Aetherbinding — and claims she gained a sixth. She can hear the Voice Below, and it speaks to her of things that were and things that will be. The establishment dismisses her as a raving lunatic. The desperate seek her out as a prophet. The truth, as always, is more terrifying than either.',
      properties: {
        age: 'Unknown (appears 35)',
        role: 'Oracle of the Silent Depths',
        personality: ['Cryptic', 'Serene', 'Terrifying', 'Compassionate in unexpected ways'],
        goals: ['Prepare Aethermere for what comes', 'Make them listen', 'Find the truth beneath the truth'],
        fears: ['That the Voice Below is not benevolent', 'That she is already too late'],
        trauma: 'Voluntarily surrendered every sense to the storms',
        speechStyle: 'Speaks in riddles and fragments, eerily precise about details she shouldn\'t know',
        senses: { touch: 'gone', smell: 'gone', taste: 'gone', hearing: 'gone', sight: 'gone', sixth: 'awakened' },
        alive: true,
        emotionalState: 'Transcendent calm — or total disconnection'
      },
      tags: ['mystic', 'prophet', 'blind', 'powerful', 'enigmatic'],
      imagePrompt: 'A figure wrapped in flowing translucent robes in a bioluminescent cavern, no visible eyes, surrounded by swirling energy patterns, ethereal teal and purple glow, mystical and haunting'
    });

    const rennDrifter = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'Captain Renn Drifter',
      description: 'The legendary captain of the Exile\'s Drift flagship, the "Last Horizon." A former Wind Priest who broke faith when she discovered the Priesthood had been sabotaging efforts to leave the gas giant. She believes Aethermere\'s people are prisoners, and that the storms aren\'t dying — they\'re being drained by something the Priesthood has been hiding for centuries.',
      properties: {
        age: 38,
        role: 'Captain of the Last Horizon, Leader of the Skyborn',
        personality: ['Bold', 'Visionary', 'Haunted', 'Loyal', 'Stubborn'],
        goals: ['Build a vessel to leave the gas giant', 'Expose the Priesthood\'s secret', 'Find a new home'],
        fears: ['That there is no escape', 'That she\'s leading her people to death', 'The truth about what she found'],
        trauma: 'Was nearly executed by the Priesthood before her escape — carries the scars',
        speechStyle: 'Captain\'s confidence mixed with poetic melancholy',
        senses: { touch: 'dulled', smell: 'dulled', taste: 'intact', hearing: 'intact', sight: 'intact' },
        alive: true,
        emotionalState: 'Fierce hope fighting chronic exhaustion'
      },
      tags: ['captain', 'exile', 'visionary', 'rebel', 'explorer'],
      imagePrompt: 'A weathered woman captain on the bridge of a fantastical airship, scars visible, determined gaze toward the sky, windswept hair, warm amber and orange sunset clouds behind her'
    });

    const orinVale = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'Orin Vale',
      description: 'A young Storm Harvester apprentice who accidentally fell below the cloud floor — and survived. He spent three days in the pressure zone and came back changed. He can now sense storms before they form and feels a pull toward the depths. Both the Guild and the Silent Depths want him. The Priesthood wants him silenced. He just wants to understand what happened to him.',
      properties: {
        age: 19,
        role: 'Storm Harvester Apprentice, Unwitting Prophet',
        personality: ['Curious', 'Anxious', 'Kind', 'Stubborn', 'Naive'],
        goals: ['Understand his new abilities', 'Survive', 'Find his place in the world'],
        fears: ['The pressure zone', 'Being used as a weapon', 'Losing himself'],
        trauma: 'Three days alone below the cloud floor, hearing the Voice',
        speechStyle: 'Uncertain, questioning, occasionally slipping into eerie certainty',
        senses: { touch: 'heightened', smell: 'intact', taste: 'intact', hearing: 'heightened', sight: 'intact', pressure: 'awakened' },
        alive: true,
        emotionalState: 'Overwhelmed but determined'
      },
      tags: ['young', 'chosen', 'conflicted', 'hunted', 'special'],
      imagePrompt: 'A young man in storm harvester work clothes, wide eyes reflecting lightning, faint glowing patterns on his skin, standing between a massive storm above and mysterious depths below'
    });

    const isoldeVane = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'Archon Isolde Vane',
      description: 'The Priesthood\'s ruthless enforcer and Vael\'s right hand. Where Vael hesitates, Isolde acts. She genuinely believes the old ways are the only salvation and will burn the world to save it. Her Aetherbinding is second to none, though she has lost all sense of touch and most of her smell. She is the wall between the empire and chaos — and she is cracking.',
      properties: {
        age: 41,
        role: 'Archon of the Wind Guard, Military Commander',
        personality: ['Ruthless', 'Devout', 'Disciplined', 'Lonely', 'Breaking'],
        goals: ['Protect the Priesthood at any cost', 'Crush the Rebellion', 'Prove the old ways work'],
        fears: ['That Vael is losing faith', 'That she has become a monster', 'Silence'],
        trauma: 'Killed her own brother during the Exile Purge — he had joined the rebels',
        speechStyle: 'Clipped, military, occasional cracks revealing vulnerability',
        senses: { touch: 'gone', smell: 'mostly gone', taste: 'intact', hearing: 'intact', sight: 'intact' },
        alive: true,
        emotionalState: 'Iron discipline hiding a crumbling foundation'
      },
      tags: ['enforcer', 'powerful', 'tragic', 'dangerous', 'devout'],
      imagePrompt: 'A stern woman in ornate wind guard armor, crackling with electrical energy, sharp features, standing in a formation of soldiers on a floating platform, cold blue and silver tones'
    });

    const mazKael = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'Maz Kael',
      description: 'A brilliant inventor and Koren\'s second-in-command in the Rebellion. They designed the mechanical Aetherbinding augments that let rebels channel storms without the sensory cost. Maz is non-binary, endlessly optimistic despite everything, and the emotional heart of the rebel movement. They also have a secret: they\'ve been corresponding with someone inside the Priesthood.',
      properties: {
        age: 31,
        role: 'Chief Engineer of the Rebellion, Second-in-Command',
        personality: ['Brilliant', 'Optimistic', 'Creative', 'Secretive', 'Warm'],
        goals: ['Perfect mechanical Aetherbinding', 'Support Koren', 'Bridge the divide'],
        fears: ['That their correspondence will be discovered', 'That technology can\'t save them', 'Losing Koren'],
        trauma: 'Watched friends die testing early augment prototypes',
        speechStyle: 'Enthusiastic, technical jargon mixed with warmth, tendency to ramble',
        senses: { touch: 'intact', smell: 'intact', taste: 'intact', hearing: 'slight damage', sight: 'intact' },
        alive: true,
        emotionalState: 'Determined hope powered by love'
      },
      tags: ['inventor', 'rebel', 'kind', 'secretive', 'bridge'],
      imagePrompt: 'A non-binary person with goggles and tool-covered apron working on glowing mechanical devices, warm smile, surrounded by floating schematics and sparking inventions, warm workshop lighting'
    });

    const whisperKing = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'The Whispering King',
      description: 'Nobody knows if the Whispering King is a person, a title, or something else entirely. They control the information black market in the Cloudfall Markets with an invisible hand. Every faction has tried to identify or kill them — none have succeeded. They sell secrets to all sides, and some believe they are the only one who knows the full truth about Aethermere\'s past.',
      properties: {
        age: 'Unknown',
        role: 'Information Broker, Shadow Power',
        personality: ['Mysterious', 'Omniscient', 'Amused', 'Manipulative', 'Possibly benevolent'],
        goals: ['Unknown — possibly maintaining balance', 'Collecting all truths', 'Entertainment?'],
        fears: ['Unknown'],
        trauma: 'Unknown',
        speechStyle: 'Always through intermediaries or encoded messages, never direct',
        senses: 'Unknown',
        alive: 'Unknown',
        emotionalState: 'Unknowable'
      },
      tags: ['mysterious', 'powerful', 'information', 'shadow', 'unknown'],
      imagePrompt: 'A shadowy figure behind a screen of floating data fragments and whispered words made visible, face obscured, surrounded by glowing information threads, dark mysterious atmosphere'
    });

    const lirenStorm = bible.addEntity({
      type: EntityTypes.CHARACTER,
      name: 'Elder Liren Storm-Touched',
      description: 'The oldest living Aetherbinder at 91 years old. She has lost all five senses but remains lucid and powerful, kept alive by the storms themselves. She was the High Templar\'s mentor and is the only person alive who remembers the Great Tempest — the last truly massive storm, 70 years ago. She holds a secret about that storm that could change everything.',
      properties: {
        age: 91,
        role: 'Elder Sage, Living Archive',
        personality: ['Ancient', 'Patient', 'Sharp', 'Weary', 'Keeper of truth'],
        goals: ['Pass on the truth before death', 'See the storms one more time', 'Guide the next generation'],
        fears: ['Dying before the truth is known', 'That no one will listen'],
        trauma: 'Outlived everyone she ever loved',
        speechStyle: 'Slow, deliberate, every word chosen with care, speaks through touch-language since she can\'t hear',
        senses: { touch: 'gone', smell: 'gone', taste: 'gone', hearing: 'gone', sight: 'gone' },
        alive: true,
        emotionalState: 'Serene acceptance tinged with urgent purpose'
      },
      tags: ['elder', 'wise', 'senseless', 'archive', 'secret-keeper'],
      imagePrompt: 'An ancient woman, frail but radiating power, sitting in a crystalline meditation chamber, surrounded by swirling storm energy that seems to sustain her, ethereal white and silver glow'
    });

    // ── Phase 5: Relationships ──────────────────────────────
    progress('relationships', 'Connecting fates and forging bonds...');
    await this._delay(400);

    // Faction memberships
    bible.addRelationship({ source: vaelTempest.id, target: windPriesthood.id, type: RelationshipTypes.RULES, label: 'Rules as High Templar' });
    bible.addRelationship({ source: isoldeVane.id, target: windPriesthood.id, type: RelationshipTypes.MEMBER_OF, label: 'Archon and enforcer' });
    bible.addRelationship({ source: lirenStorm.id, target: windPriesthood.id, type: RelationshipTypes.MEMBER_OF, label: 'Elder sage' });
    bible.addRelationship({ source: korenAsh.id, target: rebellion.id, type: RelationshipTypes.RULES, label: 'Leads the revolution' });
    bible.addRelationship({ source: mazKael.id, target: rebellion.id, type: RelationshipTypes.MEMBER_OF, label: 'Chief engineer' });
    bible.addRelationship({ source: theron.id, target: guild.id, type: RelationshipTypes.RULES, label: 'Guildmaster' });
    bible.addRelationship({ source: orinVale.id, target: guild.id, type: RelationshipTypes.MEMBER_OF, label: 'Apprentice (wavering)' });
    bible.addRelationship({ source: sylara.id, target: silentDepths.id, type: RelationshipTypes.RULES, label: 'Oracle' });
    bible.addRelationship({ source: rennDrifter.id, target: skyborn.id, type: RelationshipTypes.RULES, label: 'Captain and leader' });

    // Faction politics
    bible.addRelationship({ source: windPriesthood.id, target: rebellion.id, type: RelationshipTypes.ENEMY_OF, label: 'Existential enemies', strength: 0.9 });
    bible.addRelationship({ source: guild.id, target: windPriesthood.id, type: RelationshipTypes.ALLIED_WITH, label: 'Uneasy business alliance', strength: 0.4 });
    bible.addRelationship({ source: guild.id, target: rebellion.id, type: RelationshipTypes.ALLIED_WITH, label: 'Secret supply deals', strength: 0.3 });
    bible.addRelationship({ source: silentDepths.id, target: windPriesthood.id, type: RelationshipTypes.ENEMY_OF, label: 'Branded heretics', strength: 0.7 });
    bible.addRelationship({ source: skyborn.id, target: windPriesthood.id, type: RelationshipTypes.ENEMY_OF, label: 'Hunted exiles', strength: 0.8 });
    bible.addRelationship({ source: skyborn.id, target: rebellion.id, type: RelationshipTypes.ALLIED_WITH, label: 'Shared enemy, different goals', strength: 0.5 });
    bible.addRelationship({ source: silentDepths.id, target: skyborn.id, type: RelationshipTypes.ALLIED_WITH, label: 'Mutual respect for outcasts', strength: 0.4 });

    // Character relationships
    bible.addRelationship({ source: vaelTempest.id, target: isoldeVane.id, type: RelationshipTypes.MENTOR_OF, label: 'Mentor and protégé, growing apart' });
    bible.addRelationship({ source: lirenStorm.id, target: vaelTempest.id, type: RelationshipTypes.MENTOR_OF, label: 'Ancient mentor, keeper of secrets' });
    bible.addRelationship({ source: korenAsh.id, target: vaelTempest.id, type: RelationshipTypes.ENEMY_OF, label: 'Personal vendetta', strength: 0.8 });
    bible.addRelationship({ source: korenAsh.id, target: mazKael.id, type: RelationshipTypes.KNOWS, label: 'Deep trust and partnership', strength: 0.9 });
    bible.addRelationship({ source: mazKael.id, target: isoldeVane.id, type: RelationshipTypes.KNOWS, label: 'Secret correspondence', strength: 0.6, properties: { secret: true } });
    bible.addRelationship({ source: theron.id, target: korenAsh.id, type: RelationshipTypes.KNOWS, label: 'Sells weapons to the rebellion', strength: 0.5 });
    bible.addRelationship({ source: theron.id, target: vaelTempest.id, type: RelationshipTypes.KNOWS, label: 'Official energy supplier', strength: 0.6 });
    bible.addRelationship({ source: orinVale.id, target: sylara.id, type: RelationshipTypes.KNOWS, label: 'She called him before they met', strength: 0.7 });
    bible.addRelationship({ source: rennDrifter.id, target: vaelTempest.id, type: RelationshipTypes.BETRAYED, label: 'Former priest, now sworn enemy' });
    bible.addRelationship({ source: rennDrifter.id, target: korenAsh.id, type: RelationshipTypes.ALLIED_WITH, label: 'Reluctant allies', strength: 0.5 });
    bible.addRelationship({ source: isoldeVane.id, target: korenAsh.id, type: RelationshipTypes.RIVAL_OF, label: 'Opposite sides, mirror souls', strength: 0.8 });

    // Location associations
    bible.addRelationship({ source: vaelTempest.id, target: spireSanctum.id, type: RelationshipTypes.LOCATED_IN, label: 'Resides in the Spire' });
    bible.addRelationship({ source: isoldeVane.id, target: spireSanctum.id, type: RelationshipTypes.LOCATED_IN, label: 'Commands from the Spire' });
    bible.addRelationship({ source: korenAsh.id, target: cloudfall.id, type: RelationshipTypes.LOCATED_IN, label: 'Hidden base in the Markets' });
    bible.addRelationship({ source: theron.id, target: stormAnvil.id, type: RelationshipTypes.LOCATED_IN, label: 'Headquarters at the Anvil' });
    bible.addRelationship({ source: sylara.id, target: whisperdeep.id, type: RelationshipTypes.LOCATED_IN, label: 'Dwells in the deep' });
    bible.addRelationship({ source: rennDrifter.id, target: exilesDrift.id, type: RelationshipTypes.LOCATED_IN, label: 'Captain of the Drift' });
    bible.addRelationship({ source: orinVale.id, target: stormAnvil.id, type: RelationshipTypes.LOCATED_IN, label: 'Works at the Anvil' });
    bible.addRelationship({ source: whisperKing.id, target: cloudfall.id, type: RelationshipTypes.LOCATED_IN, label: 'Somewhere in the Markets' });
    bible.addRelationship({ source: mazKael.id, target: cloudfall.id, type: RelationshipTypes.LOCATED_IN, label: 'Workshop in the Markets' });
    bible.addRelationship({ source: lirenStorm.id, target: spireSanctum.id, type: RelationshipTypes.LOCATED_IN, label: 'Meditation chambers' });

    // Faction locations
    bible.addRelationship({ source: windPriesthood.id, target: spireSanctum.id, type: RelationshipTypes.LOCATED_IN, label: 'Seat of power' });
    bible.addRelationship({ source: guild.id, target: stormAnvil.id, type: RelationshipTypes.LOCATED_IN, label: 'Industrial base' });
    bible.addRelationship({ source: silentDepths.id, target: whisperdeep.id, type: RelationshipTypes.LOCATED_IN, label: 'Deep territory' });
    bible.addRelationship({ source: skyborn.id, target: exilesDrift.id, type: RelationshipTypes.LOCATED_IN, label: 'The Drift' });
    bible.addRelationship({ source: rebellion.id, target: cloudfall.id, type: RelationshipTypes.LOCATED_IN, label: 'Hidden cells throughout' });

    // ── Phase 6: Timeline ───────────────────────────────────
    progress('timeline', 'Inscribing the annals of history...');
    await this._delay(400);

    bible.addTimelineEvent({
      name: 'The Arrival',
      description: 'The ancestors of Aethermere\'s people arrive at the gas giant in generation ships, fleeing a dead world. They have no choice but to settle in the upper atmosphere.',
      year: -1000,
      era: 'founding',
      importance: 'pivotal',
      involvedEntities: [],
      consequences: ['Civilization begins in the clouds']
    });

    bible.addTimelineEvent({
      name: 'Discovery of Aetherbinding',
      description: 'The first Aetherbinders discover they can channel atmospheric energy through their bodies. The cost — sensory loss — is not understood for decades.',
      year: -920,
      era: 'founding',
      importance: 'pivotal',
      consequences: ['Magic system established', 'First sensory sacrifices']
    });

    bible.addTimelineEvent({
      name: 'Founding of the Wind Priesthood',
      description: 'The most powerful Aetherbinders form a religious order, claiming the storms are divine and they are chosen interpreters. The theocracy begins.',
      year: -800,
      era: 'ascension',
      importance: 'pivotal',
      involvedEntities: [windPriesthood.id],
      consequences: ['Theocratic rule established', 'Aetherbinding becomes religious practice']
    });

    bible.addTimelineEvent({
      name: 'Construction of the Spire Sanctum',
      description: 'The Wind Priesthood builds their great tower from crystallized storm energy. It takes 200 years to complete and becomes the tallest structure in Aethermere.',
      year: -600,
      era: 'ascension',
      importance: 'major',
      involvedEntities: [windPriesthood.id, spireSanctum.id]
    });

    bible.addTimelineEvent({
      name: 'The Shattered Ring Falls',
      description: 'An ancient orbital structure from a pre-human civilization falls into the atmosphere. Its wreckage provides technology far beyond Aethermere\'s capabilities.',
      year: -400,
      era: 'ascension',
      importance: 'pivotal',
      involvedEntities: [shatteredRing.id],
      consequences: ['Alien technology discovered', 'Technological leap', 'Questions about the planet\'s past']
    });

    bible.addTimelineEvent({
      name: 'Formation of the Storm Harvesters Guild',
      description: 'As the population grows, storm energy becomes currency. The Guild forms to industrialize harvesting, creating the first arrays.',
      year: -300,
      era: 'golden',
      importance: 'major',
      involvedEntities: [guild.id, stormAnvil.id]
    });

    bible.addTimelineEvent({
      name: 'The Golden Millennium Begins',
      description: 'Aethermere enters a period of unprecedented prosperity. Storms are plentiful, the population booms, and new platforms are built at every altitude.',
      year: -200,
      era: 'golden',
      importance: 'major',
      consequences: ['Population explosion', 'Territorial expansion', 'Cultural flourishing']
    });

    bible.addTimelineEvent({
      name: 'The First Silence',
      description: 'For three days, all storms in the northern hemisphere cease. The Priesthood explains it as a divine test. It is the first sign of the decline.',
      year: -70,
      era: 'decline',
      importance: 'pivotal',
      involvedEntities: [windPriesthood.id],
      consequences: ['First public doubt', 'Silent Depths movement begins']
    });

    bible.addTimelineEvent({
      name: 'The Great Tempest',
      description: 'The last truly massive storm engulfs half the planet. The Priesthood celebrates it as divine renewal. Elder Liren witnesses something inside the storm that she has never spoken of.',
      year: -70,
      era: 'decline',
      importance: 'pivotal',
      involvedEntities: [lirenStorm.id],
      consequences: ['Last great storm', 'Liren\'s secret', 'Brief restoration of faith']
    });

    bible.addTimelineEvent({
      name: 'The Steady Decline',
      description: 'Storm intensity drops by 2% per year. The Priesthood denies it. The Guild adjusts prices. The people begin to worry.',
      year: -40,
      era: 'decline',
      importance: 'major',
      consequences: ['Energy prices rise', 'Lower platforms lose power first', 'Inequality deepens']
    });

    bible.addTimelineEvent({
      name: 'The Exile Purge',
      description: 'High Templar Vael, newly appointed, orders the purge of dissenters. Thousands are cast into the Undercloud. Among them: Renn Drifter, who barely survives.',
      year: -15,
      era: 'crisis',
      importance: 'pivotal',
      involvedEntities: [vaelTempest.id, rennDrifter.id],
      consequences: ['Mass exile', 'Formation of the Skyborn', 'Vael\'s guilt', 'Renn\'s vendetta']
    });

    bible.addTimelineEvent({
      name: 'Birth of the Rebellion',
      description: 'After years of simmering rage, Koren Ash unites the lower platform communities into the Undercloud Rebellion. Their first act: raiding a Guild energy shipment.',
      year: -5,
      era: 'crisis',
      importance: 'major',
      involvedEntities: [korenAsh.id, rebellion.id],
      consequences: ['Organized resistance begins', 'Guild forced to choose sides']
    });

    bible.addTimelineEvent({
      name: 'Orin\'s Fall',
      description: 'Young apprentice Orin Vale falls below the cloud floor during a storm harvesting operation. He survives three days in the pressure zone and returns changed.',
      year: 0,
      era: 'crisis',
      importance: 'pivotal',
      involvedEntities: [orinVale.id, sylara.id],
      consequences: ['Orin gains new abilities', 'Silent Depths takes interest', 'Events of the present begin']
    });

    bible.addTimelineEvent({
      name: 'The Present Crisis',
      description: 'Storm intensity has dropped 60% from its peak. The empire is fracturing. Revolution brews. Secrets surface. Something stirs below. The end — or the beginning — is here.',
      year: 0,
      era: 'crisis',
      importance: 'pivotal',
      involvedEntities: [vaelTempest.id, korenAsh.id, theron.id, sylara.id, rennDrifter.id, orinVale.id],
      consequences: ['All storylines converge']
    });

    // ── Phase 7: Artifacts ──────────────────────────────────
    progress('artifacts', 'Unearthing ancient relics...');
    await this._delay(300);

    const stormheart = bible.addEntity({
      type: EntityTypes.ARTIFACT,
      name: 'The Stormheart Reliquary',
      description: 'An ancient device of unknown origin that can temporarily restore an Aetherbinder\'s lost senses. The Wind Priesthood\'s most guarded secret. Only the High Templar knows its location within the Spire.',
      properties: {
        origin: 'Pre-human, from the Shattered Ring',
        power: 'Restores senses temporarily, may have other undiscovered functions',
        location: 'Hidden vault in the Spire Sanctum',
        danger: 'Prolonged use causes hallucinations of the Voice Below'
      },
      tags: ['ancient', 'powerful', 'secret', 'dangerous']
    });

    const lastHorizon = bible.addEntity({
      type: EntityTypes.ARTIFACT,
      name: 'The Last Horizon',
      description: 'Captain Renn\'s flagship — a heavily modified storm-ship that she\'s been secretly converting into an atmosphere-breaking vessel. If completed, it could carry 500 people out of the gas giant entirely.',
      properties: {
        origin: 'Modified Guild storm-ship',
        power: 'Potentially atmosphere-breaking capability',
        location: 'The Exile\'s Drift',
        completion: '70% — needs a power source strong enough for escape velocity'
      },
      tags: ['ship', 'hope', 'secret', 'incomplete']
    });

    const echoLens = bible.addEntity({
      type: EntityTypes.ARTIFACT,
      name: 'The Echo Lens',
      description: 'A crystalline device that records and replays moments of history. Created by the Priesthood to preserve sacred storms, it has been used secretly to record political conversations. The Whispering King is rumored to possess one.',
      properties: {
        origin: 'Wind Priesthood creation',
        power: 'Records and replays visual/audio events',
        location: 'Unknown — several exist',
        danger: 'Can be used for surveillance and blackmail'
      },
      tags: ['surveillance', 'information', 'priesthood', 'multiple']
    });

    // Artifact relationships
    bible.addRelationship({ source: vaelTempest.id, target: stormheart.id, type: RelationshipTypes.POSSESSES, label: 'Guardian of the Reliquary' });
    bible.addRelationship({ source: rennDrifter.id, target: lastHorizon.id, type: RelationshipTypes.POSSESSES, label: 'Captain of the vessel' });
    bible.addRelationship({ source: whisperKing.id, target: echoLens.id, type: RelationshipTypes.POSSESSES, label: 'Rumored to possess one' });
    bible.addRelationship({ source: stormheart.id, target: shatteredRing.id, type: RelationshipTypes.CREATED, label: 'Salvaged from the Ring' });

    progress('complete', 'The world of Aethermere has been forged.');
  }

  // ── Procedural World Generation ───────────────────────────

  static async _buildProceduralWorld(bible, prompt, onProgress) {
    const progress = (phase, detail) => {
      if (onProgress) onProgress(phase, detail);
    };

    // Extract themes from the prompt
    const themes = this._extractThemes(prompt);
    bible.metadata.name = themes.worldName;

    progress('lore', 'Forging the foundations of reality...');
    await this._delay(400);

    // Generate basic world rules
    bible.addRule({
      category: 'physics',
      name: `The Nature of ${themes.worldName}`,
      description: `${themes.worldName} is a world defined by ${themes.primaryElement}. ${themes.environmentDesc}`,
      constraints: themes.constraints
    });

    bible.addRule({
      category: 'magic',
      name: themes.magicName,
      description: themes.magicDesc,
      constraints: [themes.magicCost],
      exceptions: [themes.magicException]
    });

    // Generate locations
    progress('geography', 'Mapping the realms...');
    await this._delay(400);

    const locationTemplates = [
      { suffix: 'Capital', significance: 'Seat of power', population: 50000 },
      { suffix: 'Market District', significance: 'Trade hub', population: 80000 },
      { suffix: 'Frontier', significance: 'Border territory', population: 15000 },
      { suffix: 'Sacred Ground', significance: 'Religious site', population: 5000 },
      { suffix: 'Wilds', significance: 'Untamed territory', population: 2000 }
    ];

    const locations = locationTemplates.map(template => {
      return bible.addEntity({
        type: EntityTypes.LOCATION,
        name: `The ${themes.locationPrefix} ${template.suffix}`,
        description: `A ${template.significance.toLowerCase()} in ${themes.worldName}.`,
        properties: {
          population: template.population,
          significance: template.significance
        },
        tags: [template.suffix.toLowerCase()]
      });
    });

    // Generate factions
    progress('factions', 'Weaving threads of power...');
    await this._delay(400);

    const factionTemplates = [
      { name: 'The Ruling Order', ideology: 'Traditional authority', power: 80, color: '#7B68EE', symbol: '👑' },
      { name: 'The Resistance', ideology: 'Revolutionary change', power: 40, color: '#DC143C', symbol: '⚔️' },
      { name: 'The Merchants', ideology: 'Pragmatic profit', power: 60, color: '#DAA520', symbol: '💰' },
      { name: 'The Mystics', ideology: 'Hidden knowledge', power: 25, color: '#00CED1', symbol: '🔮' }
    ];

    const factions = factionTemplates.map(template => {
      return bible.addEntity({
        type: EntityTypes.FACTION,
        name: template.name,
        description: `A faction driven by ${template.ideology.toLowerCase()} in ${themes.worldName}.`,
        properties: { power: template.power, ideology: template.ideology, color: template.color, symbol: template.symbol },
        tags: [template.ideology.split(' ')[0].toLowerCase()]
      });
    });

    // Generate characters
    progress('characters', 'Breathing life into souls...');
    await this._delay(500);

    const characterTemplates = [
      { name: 'The Ruler', role: 'Supreme Authority', personality: ['Wise', 'Conflicted'], factionIdx: 0 },
      { name: 'The Rebel', role: 'Revolutionary Leader', personality: ['Fiery', 'Idealistic'], factionIdx: 1 },
      { name: 'The Merchant', role: 'Power Broker', personality: ['Calculating', 'Pragmatic'], factionIdx: 2 },
      { name: 'The Oracle', role: 'Keeper of Truth', personality: ['Cryptic', 'Ancient'], factionIdx: 3 },
      { name: 'The Chosen', role: 'Unlikely Hero', personality: ['Curious', 'Anxious'], factionIdx: 2 }
    ];

    const characters = characterTemplates.map(template => {
      const char = bible.addEntity({
        type: EntityTypes.CHARACTER,
        name: template.name,
        description: `${template.role} of ${themes.worldName}.`,
        properties: { role: template.role, personality: template.personality, alive: true },
        tags: template.personality.map(p => p.toLowerCase())
      });
      // Link to faction
      bible.addRelationship({
        source: char.id,
        target: factions[template.factionIdx].id,
        type: template.factionIdx === 0 ? RelationshipTypes.RULES : RelationshipTypes.MEMBER_OF
      });
      // Link to location
      if (locations[template.factionIdx]) {
        bible.addRelationship({
          source: char.id,
          target: locations[template.factionIdx].id,
          type: RelationshipTypes.LOCATED_IN
        });
      }
      return char;
    });

    // Generate timeline
    progress('timeline', 'Inscribing history...');
    await this._delay(300);

    bible.addTimelineEvent({ name: 'The Founding', year: -1000, era: 'founding', importance: 'pivotal', description: `${themes.worldName} was founded.` });
    bible.addTimelineEvent({ name: 'The Golden Age', year: -500, era: 'golden', importance: 'major', description: 'A period of prosperity and growth.' });
    bible.addTimelineEvent({ name: 'The Decline', year: -100, era: 'decline', importance: 'pivotal', description: 'The beginning of the end.' });
    bible.addTimelineEvent({ name: 'The Present Crisis', year: 0, era: 'crisis', importance: 'pivotal', description: 'Everything converges.' });

    progress('complete', `The world of ${themes.worldName} has been forged.`);
  }

  static _extractThemes(prompt) {
    const words = prompt.toLowerCase().split(/\s+/);
    const elements = ['fire', 'water', 'wind', 'earth', 'storm', 'ice', 'shadow', 'light', 'crystal', 'void'];
    const primaryElement = elements.find(e => words.includes(e)) || 'elemental energy';
    
    return {
      worldName: 'The Generated Realm',
      primaryElement,
      environmentDesc: `A world shaped by ${primaryElement} and the forces that wield it.`,
      locationPrefix: primaryElement.charAt(0).toUpperCase() + primaryElement.slice(1),
      magicName: `${primaryElement.charAt(0).toUpperCase() + primaryElement.slice(1)} Channeling`,
      magicDesc: `The art of harnessing ${primaryElement} to reshape reality.`,
      magicCost: `Every use exacts a physical toll on the channeler`,
      magicException: 'Ancient artifacts can bypass the cost',
      constraints: ['The environment is shaped by this force', 'Those who defy it face consequences']
    };
  }

  static _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
