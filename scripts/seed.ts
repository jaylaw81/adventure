/**
 * Seed script — inserts demo stories for jaylaw81@gmail.com
 * Run with: npx tsx scripts/seed.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const USER_EMAIL = 'jaylaw81@gmail.com'

function id() { return crypto.randomUUID() }
function token() { return crypto.randomUUID().replace(/-/g, '') }

// ---------------------------------------------------------------------------
// Story definitions
// ---------------------------------------------------------------------------

const stories = [

  // ── 1. THE LOST KINGDOM (Fantasy · All Ages) ────────────────────────────
  {
    adventure: {
      title: 'The Lost Kingdom',
      description: 'An ancient kingdom lies hidden beyond the Veil of Mists. As the last royal heir, only you can restore it — if you survive the journey.',
      audience: 'all',
      tags: JSON.stringify(['Fantasy', 'Adventure']),
    },
    nodes: () => {
      const start    = id(), castle   = id(), forest   = id()
      const dragon   = id(), throne   = id(), wizard   = id()
      const end1     = id(), end2     = id(), end3     = id()
      return {
        nodes: [
          { id: start,  nodeType: 'start',  status: 'completed', title: 'The Gates of Aelthar',        content: 'You stand before the towering iron gates of Aelthar, the Lost Kingdom. Vines as thick as your arm have swallowed the stonework, and an eerie silence hangs in the air. Somewhere inside, your destiny awaits. The gates are ajar — just enough for you to squeeze through. To the west, an ancient forest stirs with whispered magic.',  positionX: 400, positionY: 100 },
          { id: castle, nodeType: 'scene',  status: 'completed', title: 'The Great Hall',              content: 'Dust motes drift through shafts of pale light as you enter the great hall. Tapestries hang in tatters from the rafters, and the long banquet table is set as though guests might arrive at any moment. Then you hear it — a slow, rumbling breath from the shadows at the far end. Something enormous is sleeping near the throne.',                    positionX: 150, positionY: 300 },
          { id: forest, nodeType: 'scene',  status: 'completed', title: 'The Whispering Forest',       content: 'The trees close around you like a cathedral of ancient wood. Bioluminescent fungi dot the roots, casting a soft blue glow. An owl with silver feathers watches you from a low branch. As you walk deeper, you hear the crackling of a campfire and catch the scent of woodsmoke and spell-herbs.',                                                    positionX: 650, positionY: 300 },
          { id: dragon, nodeType: 'scene',  status: 'completed', title: 'The Sleeping Dragon',         content: 'A dragon the colour of old copper coils around the base of the throne, its scales rising and falling slowly with each breath. One golden eye cracks open and fixes on you. It does not move. It is waiting — watching — judging. In your pack you carry a royal signet ring passed down through your family. The dragon seems to recognise it.',        positionX: 0,   positionY: 500 },
          { id: throne, nodeType: 'scene',  status: 'completed', title: 'The Throne Room',             content: 'You slip past the sleeping dragon and reach the throne. Atop the carved obsidian seat sits a crown of twisted silver set with a single amber jewel that pulses with warm light. The moment your fingers brush it, memories flood your mind — visions of your ancestors, the great betrayal, and how the kingdom was lost. You know what you must do.',     positionX: 300, positionY: 500 },
          { id: wizard, nodeType: 'scene',  status: 'completed', title: 'Orindal the Cartographer',    content: 'Around the fire sits an old man in a coat covered in pockets. His eyes are the same silver as the owl\'s feathers — the owl was him, you realise. He introduces himself as Orindal, the last court wizard of Aelthar. He has been waiting three hundred years for the true heir. He hands you a rolled map and smiles.',                              positionX: 650, positionY: 500 },
          { id: end1,   nodeType: 'ending', status: 'completed', title: 'The Dragon Oath',             content: 'You press the signet ring against the dragon\'s snout. Its eye widens. Then it bows its great head — a gesture of ancient fealty. The dragon, Vorath, swears to serve the rightful heir of Aelthar. Together you rise to reclaim the kingdom, and the Veil of Mists lifts for the first time in three centuries. The Lost Kingdom is lost no more.',   positionX: -150, positionY: 700 },
          { id: end2,   nodeType: 'ending', status: 'completed', title: 'The Crown Restored',          content: 'You place the crown upon your head. Light erupts from the amber jewel, racing through the cracks in the castle walls like veins of gold. Outside, you hear the Veil of Mists dissolve. The people of the surrounding villages look up in awe as the towers of Aelthar emerge from the fog, gleaming as though brand new. Your reign begins today.',   positionX: 300, positionY: 700 },
          { id: end3,   nodeType: 'ending', status: 'completed', title: 'The Long Way Home',           content: 'Orindal spreads the map between you. It shows not just Aelthar but every hidden path between the kingdoms — routes that could unite the fractured lands. "You don\'t need an army," he tells you. "You need allies." You roll up the map, tuck it under your arm, and set off on the longest — and most important — journey of your life.',             positionX: 650, positionY: 700 },
        ],
        choices: [
          { sourceNodeId: start,  targetNodeId: castle,  label: 'Enter the castle',          orderIndex: 0 },
          { sourceNodeId: start,  targetNodeId: forest,  label: 'Explore the forest',         orderIndex: 1 },
          { sourceNodeId: castle, targetNodeId: dragon,  label: 'Investigate the shadows',    orderIndex: 0 },
          { sourceNodeId: castle, targetNodeId: throne,  label: 'Head straight to the throne',orderIndex: 1 },
          { sourceNodeId: dragon, targetNodeId: end1,    label: 'Present the signet ring',    orderIndex: 0 },
          { sourceNodeId: dragon, targetNodeId: throne,  label: 'Sneak past while it sleeps', orderIndex: 1 },
          { sourceNodeId: throne, targetNodeId: end2,    label: 'Take the crown',             orderIndex: 0 },
          { sourceNodeId: forest, targetNodeId: wizard,  label: 'Approach the fire',          orderIndex: 0 },
          { sourceNodeId: wizard, targetNodeId: end3,    label: 'Accept his help',            orderIndex: 0 },
          { sourceNodeId: wizard, targetNodeId: end2,    label: 'Go to the castle instead',   orderIndex: 1 },
        ],
      }
    },
  },

  // ── 2. MIDNIGHT AT THE GALA (Mystery · Teens) ───────────────────────────
  {
    adventure: {
      title: 'Midnight at the Gala',
      description: 'The city\'s most glamorous party turns deadly. Everyone has a motive. Only you can unravel the truth before the killer escapes into the night.',
      audience: 'teens',
      tags: JSON.stringify(['Mystery', 'Thriller', 'Drama']),
    },
    nodes: () => {
      const start     = id(), ballroom = id(), library  = id()
      const butler    = id(), study    = id(), rooftop  = id()
      const end1      = id(), end2     = id(), end3     = id()
      return {
        nodes: [
          { id: start,   nodeType: 'start',  status: 'completed', title: 'A Body at the Gala',         content: 'The champagne flutes are still clinking when the scream cuts through the orchestra. Lord Ashford — your host and the city\'s most powerful banker — has been found dead in his private study, a single red rose placed on his chest. The doors are locked. The killer is still in the building. Detective Inspector Callie Torres looks at you. "I need your help."', positionX: 400, positionY: 100 },
          { id: ballroom,nodeType: 'scene',  status: 'completed', title: 'Secrets in the Ballroom',    content: 'You mingle with the two hundred guests who are now trapped at the gala. In hushed conversations you learn three things: Ashford\'s business partner, Victor Crane, had a blazing argument with him an hour before the murder. The socialite Lady Voss was seen leaving the study wing at 11:47. And the head butler, Mr. Reeves, has been jumpy all evening.',     positionX: 150, positionY: 300 },
          { id: library, nodeType: 'scene',  status: 'completed', title: 'The Private Library',        content: 'Ashford\'s private library is a room of mahogany and secrets. Behind a loose panel you find a ledger — offshore accounts, blackmail payments, forged land deeds. Dozens of names. Most are people at tonight\'s gala. Whoever killed Ashford had at least twenty reasons. Near the window you spot a monogrammed handkerchief. The initials: V.C.',            positionX: 650, positionY: 300 },
          { id: butler,  nodeType: 'scene',  status: 'completed', title: 'Mr. Reeves Confesses',       content: '"I didn\'t kill him," Reeves says, his voice cracking. "But I knew who would. I saw Victor Crane slip something into Lord Ashford\'s drink an hour before the body was found. I said nothing because Crane owns the mortgage on my daughter\'s house. I\'m so sorry." He hands you a keycard. "This opens the rooftop. Crane went up ten minutes ago."',       positionX: 150, positionY: 500 },
          { id: study,   nodeType: 'scene',  status: 'completed', title: 'The Study',                  content: 'The study is sealed with police tape, but you slip under it. The red rose is still on the body. You notice the rose has no thorns — unusual — and there\'s a faint trace of perfume you recognise. Lady Voss\'s signature scent. A crumpled note in the wastebasket reads: "Meet me at midnight. Come alone." The handwriting is Voss\'s, but the signature is Crane\'s.', positionX: 650, positionY: 500 },
          { id: rooftop, nodeType: 'scene',  status: 'completed', title: 'The Rooftop Confrontation',  content: 'Victor Crane stands at the rooftop edge, a phone pressed to his ear. When he sees you, he ends the call. "You\'re smarter than I thought," he says, not unkindly. "Ashford was going to destroy twelve families, including mine. Lady Voss arranged the note to lure him. I provided the means. We both pulled the trigger, in our own ways." He waits.',        positionX: 400, positionY: 500 },
          { id: end1,    nodeType: 'ending', status: 'completed', title: 'Justice Served',             content: 'You give DI Torres Crane\'s location and the full evidence. Both Crane and Lady Voss are arrested. The ledger exposes a network of corruption that rocks the city for months. It isn\'t a clean ending — powerful people rarely face a clean end — but it is a true one. Torres shakes your hand. "Same time next week?"',                                        positionX: 150, positionY: 700 },
          { id: end2,    nodeType: 'ending', status: 'completed', title: 'A Quiet Deal',               content: 'You tell Crane you\'ll give him one hour to disappear and return the ledger funds. He nods, transfers three accounts\' worth of evidence anonymously to a journalist, and vanishes into the night. The scandal breaks anyway. Is it justice? Not exactly. But twelve families keep their homes, and the corrupt network still falls. Some nights that\'s enough.',  positionX: 400, positionY: 700 },
          { id: end3,    nodeType: 'ending', status: 'completed', title: 'The Wrong Suspect',          content: 'You confront Lady Voss based on the note and the perfume. She laughs. "Crane forged my handwriting. The perfume? He stole a bottle from my room." Security camera footage Torres pulls up proves it. Voss is innocent. Crane — who vanished while you were distracted — is already on a private jet. He got away. This time.',                                 positionX: 650, positionY: 700 },
        ],
        choices: [
          { sourceNodeId: start,   targetNodeId: ballroom, label: 'Mingle with the guests',        orderIndex: 0 },
          { sourceNodeId: start,   targetNodeId: library,  label: 'Sneak into the library',        orderIndex: 1 },
          { sourceNodeId: ballroom,targetNodeId: butler,   label: 'Pull Reeves aside',             orderIndex: 0 },
          { sourceNodeId: ballroom,targetNodeId: study,    label: 'Examine the study',             orderIndex: 1 },
          { sourceNodeId: library, targetNodeId: rooftop,  label: 'Follow the initials to Crane',  orderIndex: 0 },
          { sourceNodeId: library, targetNodeId: study,    label: 'Cross-reference the study',     orderIndex: 1 },
          { sourceNodeId: butler,  targetNodeId: rooftop,  label: 'Use the keycard',               orderIndex: 0 },
          { sourceNodeId: butler,  targetNodeId: end1,     label: 'Call Torres immediately',       orderIndex: 1 },
          { sourceNodeId: study,   targetNodeId: rooftop,  label: 'Head to the rooftop',           orderIndex: 0 },
          { sourceNodeId: study,   targetNodeId: end3,     label: 'Confront Lady Voss',            orderIndex: 1 },
          { sourceNodeId: rooftop, targetNodeId: end1,     label: 'Detain Crane and call Torres',  orderIndex: 0 },
          { sourceNodeId: rooftop, targetNodeId: end2,     label: 'Make a private deal',           orderIndex: 1 },
        ],
      }
    },
  },

  // ── 3. SIGNAL LOST (Sci-Fi · All Ages) ─────────────────────────────────
  {
    adventure: {
      title: 'Signal Lost',
      description: 'Your survey shuttle crashes on an uncharted moon. With oxygen running low and no rescue in sight, every decision could be your last — or your salvation.',
      audience: 'all',
      tags: JSON.stringify(['Sci-Fi', 'Adventure']),
    },
    nodes: () => {
      const start    = id(), distress = id(), caves    = id()
      const alien    = id(), beacon   = id(), lab      = id()
      const end1     = id(), end2     = id(), end3     = id()
      return {
        nodes: [
          { id: start,  nodeType: 'start',  status: 'completed', title: 'Impact',                     content: 'You come to consciousness upside-down in your crash harness. Warning lights strobe across the cockpit. Through the cracked viewport you see a pale orange sky and a landscape of glittering crystalline formations stretching to the horizon. Your oxygen readout says 6 hours. The comms array is dead. Your crewmate, Yusra, is unconscious but breathing.', positionX: 400, positionY: 100 },
          { id: distress,nodeType:'scene',  status: 'completed', title: 'The Distress Beacon',        content: 'The emergency beacon is intact but needs a clear line-of-sight to broadcast. The closest high point is a ridge two kilometres away. You can make it in an hour — but a scan shows movement on the route. Large, heat-signature movement. You\'ll be exposed on open ground. Alternatively the shuttle\'s secondary array could be rigged to boost signal from here, with time.',positionX: 150, positionY: 300 },
          { id: caves,  nodeType: 'scene',  status: 'completed', title: 'The Crystal Caves',          content: 'The cave entrance glows softly — the crystals absorb light and release it slowly, creating a perpetual twilight. The passage leads toward the ridge but also deeper underground. As you move, you notice the crystals are arranged in patterns too regular to be natural. Someone — or something — built parts of this tunnel.',                                         positionX: 650, positionY: 300 },
          { id: alien,  nodeType: 'scene',  status: 'completed', title: 'First Contact',              content: 'The creature is roughly humanoid, two metres tall, with translucent skin that shifts colour with its mood — currently a wary amber. It holds no weapon but blocks your path. When you set down your tools slowly and hold out empty hands, its colour shifts to a curious blue. It moves toward a side tunnel and looks back at you. Waiting.',                      positionX: 650, positionY: 500 },
          { id: beacon, nodeType: 'scene',  status: 'completed', title: 'Rigging the Array',          content: 'Working from memory and the shuttle\'s repair manual, you boost the secondary array using crystals from the cave entrance as signal amplifiers — their resonance frequency turns out to be a near-perfect match. The signal fires. You won\'t know if anyone received it for hours. Now you wait. Yusra stirs and opens her eyes. "Where are we?"',                positionX: 150, positionY: 500 },
          { id: lab,    nodeType: 'scene',  status: 'completed', title: 'The Ancient Station',        content: 'The creature leads you to a chamber carved from living rock — but lined with technology that is unmistakably artificial. Screens still glow. A navigation system shows your moon in a local star system, and beside it, a long-range transmitter that dwarfs anything your ship carries. The creature gestures to the controls. It\'s offering you a way home.',          positionX: 800, positionY: 500 },
          { id: end1,   nodeType: 'ending', status: 'completed', title: 'Rescue',                     content: 'The Meridian Corps rescue shuttle breaks atmosphere fourteen hours later, guided in by your looping distress signal. As you help Yusra aboard, you look back at the ridge. You\'re certain you see a pair of amber eyes watching from the crystal formations. You note the coordinates carefully in your log. You\'ll be back — with a team, and with the right intentions.', positionX: 150, positionY: 700 },
          { id: end2,   nodeType: 'ending', status: 'completed', title: 'The Long Signal',            content: 'The alien transmitter sends your message at speeds your own technology won\'t achieve for decades. A rescue ship responds within the hour. Before you leave, you and the creature exchange what amounts to a handshake — an ancient gesture, it turns out, that crosses the species barrier. First contact was made quietly, with open hands, in the dark.',          positionX: 650, positionY: 700 },
          { id: end3,   nodeType: 'ending', status: 'completed', title: 'Stranded But Alive',         content: 'The signal never reaches anyone. Hours stretch into days. But you\'ve found water, food the alien shows you is safe, and shelter. Weeks later, a survey drone picks up the shuttle wreckage. You walk out of the caves into the orange sunlight, Yusra beside you, the alien at a respectful distance. Some rescues take longer than others.',                     positionX: 400, positionY: 700 },
        ],
        choices: [
          { sourceNodeId: start,   targetNodeId: distress, label: 'Head for the ridge',            orderIndex: 0 },
          { sourceNodeId: start,   targetNodeId: caves,    label: 'Explore the crystal caves',     orderIndex: 1 },
          { sourceNodeId: distress,targetNodeId: beacon,   label: 'Rig the shuttle array',         orderIndex: 0 },
          { sourceNodeId: distress,targetNodeId: end3,     label: 'Push for the ridge anyway',     orderIndex: 1 },
          { sourceNodeId: caves,   targetNodeId: alien,    label: 'Follow the patterns deeper',    orderIndex: 0 },
          { sourceNodeId: caves,   targetNodeId: beacon,   label: 'Head back to the shuttle',      orderIndex: 1 },
          { sourceNodeId: alien,   targetNodeId: lab,      label: 'Follow the creature',           orderIndex: 0 },
          { sourceNodeId: alien,   targetNodeId: end3,     label: 'Back away slowly',              orderIndex: 1 },
          { sourceNodeId: beacon,  targetNodeId: end1,     label: 'Wait for rescue',               orderIndex: 0 },
          { sourceNodeId: beacon,  targetNodeId: caves,    label: 'Go back into the caves',        orderIndex: 1 },
          { sourceNodeId: lab,     targetNodeId: end2,     label: 'Use the alien transmitter',     orderIndex: 0 },
          { sourceNodeId: lab,     targetNodeId: end1,     label: 'Record everything and wait',    orderIndex: 1 },
        ],
      }
    },
  },

  // ── 4. THE LAST SHIFT (Drama · Teens) ───────────────────────────────────
  {
    adventure: {
      title: 'The Last Shift',
      description: 'It\'s your final night working at the Starlight Diner before you leave for college. A series of unexpected visitors will change how you see everything.',
      audience: 'teens',
      tags: JSON.stringify(['Drama', 'Comedy']),
    },
    nodes: () => {
      const start   = id(), oldman  = id(), sisters = id()
      const truth   = id(), runaway = id(), letter  = id()
      const end1    = id(), end2    = id(), end3    = id()
      return {
        nodes: [
          { id: start,  nodeType: 'start',  status: 'completed', title: 'Closing Time',               content: 'The Starlight Diner smells like coffee and old vinyl. It\'s 11 PM on your last ever shift — tomorrow morning you load up a car and drive four states away to start your new life. The place is nearly empty. Just you, Marge the cook, and the hum of the neon sign outside. Then the bell above the door rings.',                                          positionX: 400, positionY: 100 },
          { id: oldman, nodeType: 'scene',  status: 'completed', title: 'The Regular',                 content: 'Harold Kessler, 78 years old, slides into his usual booth. He orders his usual: black coffee and a slice of pie. He has eaten here every Thursday night for thirty-one years. Tonight he asks you to sit with him for a minute, something he has never done before. "I hear you\'re leaving," he says. "I have something for you."',                        positionX: 150, positionY: 300 },
          { id: sisters,nodeType: 'scene',  status: 'completed', title: 'Two Sisters',                 content: 'Two women in their fifties come in and sit at the counter. They argue in whispers over menus they aren\'t really reading. When you bring their coffee, the elder one says, "We haven\'t spoken in nine years. She called me tonight out of nowhere. We used to come here as kids." She glances at her sister. "We don\'t know how to start."',               positionX: 650, positionY: 300 },
          { id: truth,  nodeType: 'scene',  status: 'completed', title: 'Harold\'s Story',              content: 'Harold slides a weathered postcard across the table. It\'s from Paris, dated 1974. "I was going to go," he says. "Had a scholarship, a plan, someone I loved there. I got scared. Stayed here instead. Opened a hardware store. Good life." He pauses. "Not the one I was brave enough to have." He looks at you steadily. "Don\'t do what I did."',        positionX: 150, positionY: 500 },
          { id: runaway,nodeType: 'scene',  status: 'completed', title: 'The Kid in the Booth',        content: 'While the sisters are deciding, you notice a teenager — maybe fourteen — in the corner booth, nursing a hot chocolate and staring at the door. Their backpack is too full and their shoes are too muddy for a casual Thursday night. When you refill their drink, they flinch at the kindness of it. "I\'m fine," they say, before you\'ve asked anything.',     positionX: 650, positionY: 500 },
          { id: letter, nodeType: 'scene',  status: 'completed', title: 'Marge\'s Envelope',            content: 'Marge comes out of the kitchen with a coffee-stained envelope with your name on it. "Was going to give you this at the end of the shift but I\'m not good at goodbyes." Inside is a letter, three pages, and a folded fifty-dollar bill. The letter is about the night she almost gave up on cooking. It ends: "You reminded me why I stayed. Now go."',      positionX: 400, positionY: 500 },
          { id: end1,   nodeType: 'ending', status: 'completed', title: 'One Last Coffee',             content: 'You sit with Harold until close. He tells you about Paris, the scholarship, the person he left behind. You tell him about the doubts you\'ve had about leaving. At 1 AM, when you finally lock up, something has shifted — not in your plans, but in your resolve. You drive home knowing exactly why you\'re going, and what you\'re carrying with you.',      positionX: 150, positionY: 700 },
          { id: end2,   nodeType: 'ending', status: 'completed', title: 'Reconnected',                 content: 'You bring the sisters their coffee and say, simply, "Can I tell you something? I watched two people sit in silence for an hour once and then run out of time. Don\'t do that." You leave them the check and go back to work. When you glance over an hour later, they\'re laughing. Crying a little too. You quietly tear up their check.',                    positionX: 650, positionY: 700 },
          { id: end3,   nodeType: 'ending', status: 'completed', title: 'The Long Way Around',         content: 'You call the teen\'s parents — who, it turns out, have been searching for three hours. You stay until they arrive. The mother\'s face when she sees her kid through the window is something you\'ll carry for the rest of your life. You miss the last bus home. Marge drives you. You don\'t talk much. You don\'t need to.',                               positionX: 400, positionY: 700 },
        ],
        choices: [
          { sourceNodeId: start,   targetNodeId: oldman,  label: 'Greet Harold',                   orderIndex: 0 },
          { sourceNodeId: start,   targetNodeId: sisters, label: 'Seat the two women',             orderIndex: 1 },
          { sourceNodeId: start,   targetNodeId: letter,  label: 'Read the envelope from Marge',   orderIndex: 2 },
          { sourceNodeId: oldman,  targetNodeId: truth,   label: 'Sit with him',                   orderIndex: 0 },
          { sourceNodeId: oldman,  targetNodeId: runaway, label: 'Notice the kid in the booth',    orderIndex: 1 },
          { sourceNodeId: sisters, targetNodeId: end2,    label: 'Say something honest',           orderIndex: 0 },
          { sourceNodeId: sisters, targetNodeId: runaway, label: 'Leave them to it',               orderIndex: 1 },
          { sourceNodeId: truth,   targetNodeId: end1,    label: 'Stay and listen',                orderIndex: 0 },
          { sourceNodeId: truth,   targetNodeId: letter,  label: 'Go read Marge\'s letter',        orderIndex: 1 },
          { sourceNodeId: runaway, targetNodeId: end3,    label: 'Call for help',                  orderIndex: 0 },
          { sourceNodeId: runaway, targetNodeId: end2,    label: 'Just keep them company',         orderIndex: 1 },
          { sourceNodeId: letter,  targetNodeId: end1,    label: 'Go sit with Harold',             orderIndex: 0 },
          { sourceNodeId: letter,  targetNodeId: end3,    label: 'Check on the kid',               orderIndex: 1 },
        ],
      }
    },
  },

]

// ---------------------------------------------------------------------------
// Insert
// ---------------------------------------------------------------------------

async function seed() {
  console.log(`\nSeeding stories for ${USER_EMAIL}...\n`)

  for (const story of stories) {
    const adventureId = id()
    const shareToken = token()
    const { nodes: nodeList, choices: choiceList } = story.nodes()

    // Insert adventure
    await db.insert(schema.adventures).values({
      id: adventureId,
      title: story.adventure.title,
      description: story.adventure.description,
      userEmail: USER_EMAIL,
      audience: story.adventure.audience,
      tags: story.adventure.tags,
      isPublic: true,
      shareToken,
    })

    // Insert nodes
    for (const node of nodeList) {
      await db.insert(schema.nodes).values({
        id: node.id,
        adventureId,
        title: node.title,
        content: node.content,
        nodeType: node.nodeType,
        status: node.status,
        positionX: node.positionX,
        positionY: node.positionY,
      })
    }

    // Insert choices
    for (const choice of choiceList) {
      await db.insert(schema.choices).values({
        id: id(),
        adventureId,
        sourceNodeId: choice.sourceNodeId,
        targetNodeId: choice.targetNodeId,
        label: choice.label,
        orderIndex: choice.orderIndex,
      })
    }

    console.log(`  ✓ "${story.adventure.title}" (${story.adventure.audience}, ${nodeList.length} scenes, ${choiceList.length} choices)`)
  }

  console.log(`\nDone — ${stories.length} stories inserted.\n`)
}

seed().catch(err => { console.error(err); process.exit(1) })
