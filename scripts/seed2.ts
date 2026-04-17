/**
 * Seed script — inserts 5 additional public stories for jaylaw81@gmail.com
 * Run with: npx tsx scripts/seed2.ts
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

  // ── 1. THE HAUNTED LIGHTHOUSE (Horror / Teens) ───────────────────────────
  {
    adventure: {
      title: 'The Haunted Lighthouse',
      description: 'The old lighthouse has been dark for forty years. Tonight a storm traps you inside — and you are not alone.',
      audience: 'teens',
      tags: JSON.stringify(['Horror', 'Mystery', 'Thriller']),
    },
    nodes: () => {
      const start   = id(), foyer   = id(), basement = id()
      const journal = id(), keeper  = id(), lantern  = id()
      const end1    = id(), end2    = id(), end3     = id()
      return {
        nodes: [
          { id: start,    nodeType: 'start',  status: 'completed', title: 'Storm\'s Edge',                  content: 'The ferry back to the mainland left an hour ago, and now the sky has turned the colour of a bruise. The only shelter on this rocky spit of land is the lighthouse — decommissioned since 1983, when the keeper vanished without a trace. Your phone has no signal. Lightning splits the sky. The door to the lighthouse is unlocked.', positionX: 400, positionY: 100 },
          { id: foyer,    nodeType: 'scene',  status: 'completed', title: 'The Entrance Hall',               content: 'Inside smells of brine and something older — coal oil, maybe, and damp stone. The spiral staircase winds upward into darkness. A door to your left is labelled BASEMENT in flaking paint. On a hook by the door hangs a slicker and a logbook, as if the keeper just stepped out. The logbook\'s last entry is dated the night of his disappearance.', positionX: 150, positionY: 300 },
          { id: basement, nodeType: 'scene',  status: 'completed', title: 'Below the Tide Line',             content: 'The basement floods twice a day at high tide — tonight the water is knee-deep and rising. Your torch picks out rusted equipment and something else: a locked iron chest sitting on a shelf just above the waterline, and a hand-drawn map of the lighthouse painted directly onto the wall. Someone spent a long time down here.', positionX: 650, positionY: 300 },
          { id: journal,  nodeType: 'scene',  status: 'completed', title: 'The Keeper\'s Last Words',         content: 'The logbook reads normally until the final page, where the handwriting becomes jagged and fast. "It comes up from the water. It wears the shape of things you love. Do not look at it directly. Do not let it hear your name. If it speaks to you — do not answer." The entry stops mid-sentence. Below it, in different ink: "He tried."', positionX: 150, positionY: 500 },
          { id: keeper,   nodeType: 'scene',  status: 'completed', title: 'The Figure in the Lamp Room',     content: 'At the top of the stairs, a figure stands at the great lamp, its back to you. It\'s wearing the keeper\'s slicker. When you call out, it turns slowly. Its face is your face — but the eyes are wrong. Too still. Too knowing. It opens its mouth and speaks your name in your own voice. The logbook\'s warning echoes in your head.', positionX: 400, positionY: 500 },
          { id: lantern,  nodeType: 'scene',  status: 'completed', title: 'The Old Lantern',                  content: 'The chest holds a brass lantern and a note: "It cannot stand direct light from this flame. The oil is still good. Hurry." You fill the lantern from a cracked bottle on the shelf. The water is at your waist now. Above you the lighthouse groans as the storm batters its walls. Your hand is steadier than you expected as you strike the match.', positionX: 650, positionY: 500 },
          { id: end1,     nodeType: 'ending', status: 'completed', title: 'Light Keeper',                    content: 'You hold the lantern up. The thing wearing your face recoils, its form flickering like a bad signal, and then — it dissolves, leaving only the scent of ozone and salt. The lighthouse lamp ignites on its own, great and golden, sending a beam out across the black water. When the storm clears at dawn, a boat sees it. They find you asleep on the stairs, the lantern still warm.', positionX: 150, positionY: 700 },
          { id: end2,     nodeType: 'ending', status: 'completed', title: 'Lost to the Water',               content: 'You answer it. The moment your voice leaves your mouth, something shifts. You\'re outside, on the rocks, though you don\'t remember walking there. The water is calm now. The storm is gone. The lighthouse is dark behind you, and you can\'t quite recall why you went inside. You don\'t notice the slicker on your shoulders that isn\'t yours.', positionX: 400, positionY: 700 },
          { id: end3,     nodeType: 'ending', status: 'completed', title: 'The Map\'s Promise',               content: 'The wall map shows a sea cave accessible at low tide — a bolt-hole the keeper used. The tide turns. You wade out through the rising water, follow the painted path from memory, and find the cave. It\'s dry and high and stocked with old supplies. You wait out the storm there, listening to the waves, and in the morning you walk back into the world with a story no one will quite believe.', positionX: 650, positionY: 700 },
        ],
        choices: [
          { sourceNodeId: start,    targetNodeId: foyer,    label: 'Enter the lighthouse',           orderIndex: 0 },
          { sourceNodeId: foyer,    targetNodeId: journal,  label: 'Read the logbook',               orderIndex: 0 },
          { sourceNodeId: foyer,    targetNodeId: basement, label: 'Go down to the basement',        orderIndex: 1 },
          { sourceNodeId: foyer,    targetNodeId: keeper,   label: 'Climb straight to the top',      orderIndex: 2 },
          { sourceNodeId: journal,  targetNodeId: keeper,   label: 'Go up and face whatever it is',  orderIndex: 0 },
          { sourceNodeId: journal,  targetNodeId: basement, label: 'Look for the chest in the basement', orderIndex: 1 },
          { sourceNodeId: basement, targetNodeId: lantern,  label: 'Get the lantern from the chest', orderIndex: 0 },
          { sourceNodeId: basement, targetNodeId: end3,     label: 'Follow the map on the wall',     orderIndex: 1 },
          { sourceNodeId: keeper,   targetNodeId: end1,     label: 'Use the lantern against it',     orderIndex: 0 },
          { sourceNodeId: keeper,   targetNodeId: end2,     label: 'Answer when it speaks your name',orderIndex: 1 },
          { sourceNodeId: lantern,  targetNodeId: keeper,   label: 'Go up to the lamp room',         orderIndex: 0 },
          { sourceNodeId: lantern,  targetNodeId: end3,     label: 'Use the map to find the cave',   orderIndex: 1 },
        ],
      }
    },
  },

  // ── 2. EMPEROR'S SHADOW (Historical / All Ages) ─────────────────────────
  {
    adventure: {
      title: 'Emperor\'s Shadow',
      description: 'Rome, 44 BC. Hours before the Ides of March. You are a young scribe who has uncovered a conspiracy — and the wrong word to the wrong person could cost you your life.',
      audience: 'all',
      tags: JSON.stringify(['Historical', 'Drama', 'Adventure']),
    },
    nodes: () => {
      const start   = id(), senate  = id(), forum    = id()
      const brutus  = id(), servant = id(), records  = id()
      const end1    = id(), end2    = id(), end3     = id()
      return {
        nodes: [
          { id: start,   nodeType: 'start',  status: 'completed', title: 'The Ides of March',           content: 'Rome hums with an uneasy energy this morning. You are Livia, a scribe in the office of the Senate records — young, observant, and largely invisible to the powerful men who stride past you. But last night, copying dispatches by oil-lamp, you read something you should not have: a list of names, a date, and a single word. Conspirators.', positionX: 400, positionY: 100 },
          { id: senate,  nodeType: 'scene',  status: 'completed', title: 'The Senate Steps',            content: 'The Senate steps teem with citizens, vendors, and senators. You spot Marcus Brutus on the portico, deep in conversation with several men you recognise from the list. He glances around often. Nearby, a senator\'s body slave is watching the same group with the same narrow attention you are. You make eye contact. He gives the smallest shake of his head — a warning.', positionX: 150, positionY: 300 },
          { id: forum,   nodeType: 'scene',  status: 'completed', title: 'The Forum',                   content: 'The Forum is the heart of Rome and the best place to disappear into a crowd. You have allies here: the spice merchant who has long moved messages for those who pay well, and a retired soldier turned wine-seller who owes you a debt from last winter. Either could help — but help requires trust, and trust takes time you may not have.', positionX: 650, positionY: 300 },
          { id: brutus,  nodeType: 'scene',  status: 'completed', title: 'Alone With Brutus',           content: 'Brutus finds you in the corridor of the records hall. He is calm, which is somehow more frightening than anger. He sits, folds his hands, and says, "You are clever enough to have read something dangerous. Are you clever enough to understand why it is necessary?" He does not threaten you. He simply waits. The choice of what you are feels like it is yours to make.', positionX: 150, positionY: 500 },
          { id: servant, nodeType: 'scene',  status: 'completed', title: 'The Senator\'s Slave',         content: 'His name is Helix. He has been watching the conspirators for three weeks at the order of a senator loyal to Caesar — a senator who is ill and cannot act himself. Helix has a sealed letter for Caesar\'s household, warning of the plot. He needs someone to deliver it. The streets are being watched. He trusts you because you are nobody. That is the only credential that matters.', positionX: 150, positionY: 500 },
          { id: records, nodeType: 'scene',  status: 'completed', title: 'The Archive',                 content: 'In the Senate archive you find other copies of the conspiracy list — and something more: a counter-plan, drawn up by loyalists, to move Caesar\'s appearance to a different hall. If this plan reaches the right hands in the next hour, today may yet pass quietly. But the copy in your hands is the only one. Its author is dead, killed this morning.', positionX: 650, positionY: 500 },
          { id: end1,    nodeType: 'ending', status: 'completed', title: 'A Name in History',           content: 'The letter reaches Caesar\'s household. A freedman pleads with him not to go to the Senate. Caesar hesitates — and hesitating, lives. History pivots on that hesitation. Your name will never appear in any record of the day. You are still a scribe. But every time you copy a dispatch in the lamplight, you know what the words can do.', positionX: 150, positionY: 700 },
          { id: end2,    nodeType: 'ending', status: 'completed', title: 'The Long Silence',            content: 'You tell Brutus you understand. You walk out of the records hall and say nothing to no one. The Ides proceed as history records them. Caesar falls. Rome changes. You remain a scribe, invisible as always, copying the official version of events into the archive — knowing, always, what it leaves out.', positionX: 400, positionY: 700 },
          { id: end3,    nodeType: 'ending', status: 'completed', title: 'The Counter-Plan',            content: 'The plan reaches a loyalist senator in time. Caesar\'s route is changed. The conspirators wait in the Pompey theatre for an hour before realising what has happened. In the chaos that follows, some flee, some are caught. Rome fractures — but differently, more slowly, with more room for argument and less for blood. You go back to your desk and write it all down while your hand still trembles.', positionX: 650, positionY: 700 },
        ],
        choices: [
          { sourceNodeId: start,   targetNodeId: senate,  label: 'Go to the Senate steps',            orderIndex: 0 },
          { sourceNodeId: start,   targetNodeId: forum,   label: 'Seek help in the Forum',            orderIndex: 1 },
          { sourceNodeId: start,   targetNodeId: records, label: 'Return to the archive',             orderIndex: 2 },
          { sourceNodeId: senate,  targetNodeId: brutus,  label: 'Let Brutus find you',               orderIndex: 0 },
          { sourceNodeId: senate,  targetNodeId: servant, label: 'Approach the senator\'s slave',     orderIndex: 1 },
          { sourceNodeId: forum,   targetNodeId: servant, label: 'Use the debt — deliver the letter', orderIndex: 0 },
          { sourceNodeId: forum,   targetNodeId: end3,    label: 'Buy passage and warn the archive',  orderIndex: 1 },
          { sourceNodeId: brutus,  targetNodeId: end2,    label: 'Agree to stay silent',              orderIndex: 0 },
          { sourceNodeId: brutus,  targetNodeId: servant, label: 'Leave and find Helix',              orderIndex: 1 },
          { sourceNodeId: servant, targetNodeId: end1,    label: 'Deliver the letter to Caesar\'s household', orderIndex: 0 },
          { sourceNodeId: servant, targetNodeId: end2,    label: 'Decide it is not your place',       orderIndex: 1 },
          { sourceNodeId: records, targetNodeId: end3,    label: 'Get the counter-plan to a loyalist',orderIndex: 0 },
          { sourceNodeId: records, targetNodeId: end2,    label: 'Destroy the document',              orderIndex: 1 },
        ],
      }
    },
  },

  // ── 3. THE HEIST (Thriller / Teens) ─────────────────────────────────────
  {
    adventure: {
      title: 'The Heist',
      description: 'One priceless painting. One night. A crew of five people who don\'t fully trust each other. What could go wrong?',
      audience: 'teens',
      tags: JSON.stringify(['Thriller', 'Drama', 'Comedy']),
    },
    nodes: () => {
      const start   = id(), plan    = id(), museum   = id()
      const vault   = id(), guard   = id(), alarm    = id()
      const end1    = id(), end2    = id(), end3     = id()
      return {
        nodes: [
          { id: start,  nodeType: 'start',  status: 'completed', title: 'The Briefing',                 content: 'The painting is a Vermeer — stolen once before, in 1974, and quietly returned with no explanation. Now it sits in the city museum behind six inches of glass and a laser grid. Your crew has one window: tonight, when the backup security system is offline for scheduled maintenance. Your handler, a woman named Dasha, slides a floor plan across the table. "Choose your role."', positionX: 400, positionY: 100 },
          { id: plan,   nodeType: 'scene',  status: 'completed', title: 'The Plan Has a Flaw',          content: 'Your tech expert, a nineteen-year-old called Sparrow, points to the east corridor: "The maintenance window only covers the east wing. The Vermeer is in the west." Dasha goes very still. Someone sold them incomplete information. The question is whether it was incompetence — or whether someone on the team wants them to fail.', positionX: 150, positionY: 300 },
          { id: museum, nodeType: 'scene',  status: 'completed', title: 'Inside the Museum',            content: 'You\'re in — through the loading dock, dressed as overnight cleaning staff. The east wing gleams under emergency lighting. The west wing is a different matter: one guard on a thirty-minute rotation, two cameras, and a pressure sensor beneath the painting itself. Sparrow is in your earpiece. "There\'s a way," she says. "But you have to trust me completely."', positionX: 650, positionY: 300 },
          { id: vault,  nodeType: 'scene',  status: 'completed', title: 'The Pressure Sensor',          content: 'Sparrow talks you through bypassing the sensor: a custom electromagnetic pulse, small and precise, that kills the sensor for ninety seconds. It\'s enough — if the guard\'s rotation holds. It doesn\'t. The guard appears early, radio crackling. You have exactly four seconds to decide.', positionX: 650, positionY: 500 },
          { id: guard,  nodeType: 'scene',  status: 'completed', title: 'The Guard\'s Name Is Dennis',  content: 'Dennis is 58, nine months from retirement, and he has a photo of three grandchildren on his belt clip. When he finds you, he doesn\'t reach for his radio. He looks at the painting, looks at you, and says: "Whatever they\'re paying you, it\'s not enough. This painting was looted from a Jewish family in 1943. I know because that\'s my wife\'s family." He pauses. "I\'ve been trying to report it for six years."', positionX: 400, positionY: 500 },
          { id: alarm,  nodeType: 'scene',  status: 'completed', title: 'The Alarm',                   content: 'An alarm trips — not the painting sensor, but the motion detector in the east corridor. Sparrow\'s voice cuts out. Someone on the crew panicked, or was never on the crew at all. You have sixty seconds before the response team arrives. The Vermeer is in your hands. The exit is forty metres away. Dennis is watching you choose who you are.', positionX: 150, positionY: 500 },
          { id: end1,   nodeType: 'ending', status: 'completed', title: 'The Right Owner',              content: 'You hand Dennis the painting. He stares at it for a long moment, then nods. You walk out through the loading dock in the commotion of the alarm response, empty-handed. Three months later, the Vermeer makes international news — officially "discovered" and returned to the original family. Dennis gets a commendation. Dasha never calls you again. You consider this a success.', positionX: 150, positionY: 700 },
          { id: end2,   nodeType: 'ending', status: 'completed', title: 'Clean Exit',                   content: 'You make the exit with forty seconds to spare, Vermeer under your arm. Dasha is waiting. The handoff goes smoothly. But in the car, something sits wrong with you — Dennis\'s face, the name on the storage label, the 1943 date. A week later you make an anonymous call to an art crimes journalist. You keep the money. You don\'t keep the painting.', positionX: 400, positionY: 700 },
          { id: end3,   nodeType: 'ending', status: 'completed', title: 'The Long Con',                 content: 'Dennis was the plan all along — Sparrow found him months ago. The theft is a cover story to get the painting into evidence lockup, where it will be properly assessed. The whole crew, including you, are working for a restitution organisation operating outside official channels. Dasha hands you a file with your next assignment. "Amsterdam," she says. "There are seventeen more."', positionX: 650, positionY: 700 },
        ],
        choices: [
          { sourceNodeId: start,  targetNodeId: plan,   label: 'Study the floor plan',               orderIndex: 0 },
          { sourceNodeId: start,  targetNodeId: museum, label: 'Skip straight to the job',           orderIndex: 1 },
          { sourceNodeId: plan,   targetNodeId: museum, label: 'Go in anyway — adapt on the fly',    orderIndex: 0 },
          { sourceNodeId: plan,   targetNodeId: alarm,  label: 'Investigate the leak first',         orderIndex: 1 },
          { sourceNodeId: museum, targetNodeId: vault,  label: 'Go for the painting',                orderIndex: 0 },
          { sourceNodeId: museum, targetNodeId: alarm,  label: 'Something feels wrong — hold',       orderIndex: 1 },
          { sourceNodeId: vault,  targetNodeId: guard,  label: 'Face the guard',                     orderIndex: 0 },
          { sourceNodeId: vault,  targetNodeId: end2,   label: 'Take the painting and run',          orderIndex: 1 },
          { sourceNodeId: guard,  targetNodeId: end1,   label: 'Give him the painting',              orderIndex: 0 },
          { sourceNodeId: guard,  targetNodeId: end3,   label: 'Ask him what he knows',              orderIndex: 1 },
          { sourceNodeId: alarm,  targetNodeId: end1,   label: 'Abort and drop the painting',        orderIndex: 0 },
          { sourceNodeId: alarm,  targetNodeId: end2,   label: 'Push for the exit',                  orderIndex: 1 },
        ],
      }
    },
  },

  // ── 4. WAKING DREAMS (Magical Realism / All Ages) ───────────────────────
  {
    adventure: {
      title: 'Waking Dreams',
      description: 'Every night you dream of the same city. One morning you wake up and the city is in your pocket — a paper map you\'ve never seen before. And it\'s changing.',
      audience: 'all',
      tags: JSON.stringify(['Fantasy', 'Mystery', 'Drama']),
    },
    nodes: () => {
      const start   = id(), market  = id(), tower    = id()
      const cartog  = id(), bridge  = id(), library  = id()
      const end1    = id(), end2    = id(), end3     = id()
      return {
        nodes: [
          { id: start,  nodeType: 'start',  status: 'completed', title: 'The Map in Your Pocket',       content: 'You have dreamed of a city without a name for as long as you can remember. Every night the same cobblestones, the same impossible towers, the same river that flows upward through the centre of town. This morning the map is on your pillow. It is drawn in your own handwriting. It is warm to the touch. And there — in the corner of the map — your name, written by someone else.', positionX: 400, positionY: 100 },
          { id: market, nodeType: 'scene',  status: 'completed', title: 'The Night Market',             content: 'You fall asleep with the map in your hand. The city opens around you like a book. The night market is running — stalls selling bottled sounds, preserved memories, and shoes that know the way home. A vendor with no shadow holds up a small compass. "You\'re early," she says. "Or very late. It\'s difficult to tell with newcomers."', positionX: 150, positionY: 300 },
          { id: tower,  nodeType: 'scene',  status: 'completed', title: 'The Tower of Clocks',          content: 'The tower at the centre of the city is built entirely from clocks — grandfather clocks, pocket watches, sundials, hourglasses — all running at different speeds. At the top, according to your map, is someone who has been waiting. The door opens before you knock. Inside, the smell of tea and something older. Time, you think. It smells like time.', positionX: 650, positionY: 300 },
          { id: cartog, nodeType: 'scene',  status: 'completed', title: 'The Cartographer',             content: 'The person in the tower looks exactly like you — forty years older. She is the cartographer of the dream city, and she has been drawing maps of it every night for four decades. "You\'re here because the city is forgetting itself," she says. "Streets disappear. Districts dissolve. It has been looking for someone to remember it back into existence." She slides a pen across the table.', positionX: 650, positionY: 500 },
          { id: bridge, nodeType: 'scene',  status: 'completed', title: 'The Dissolving Bridge',        content: 'The bridge over the upward-flowing river is half gone — not broken, but faded, as if someone is erasing it. People stand on both banks, unable to cross. A child sits in the middle of what remains, drawing the bridge in a notebook. Every line she draws holds another inch of it in place. She looks up at you. "Can you draw?" she asks.', positionX: 150, positionY: 500 },
          { id: library,nodeType: 'scene',  status: 'completed', title: 'The Archive of Dreams',        content: 'The library holds every dream this city has been part of — millions of them, catalogued and cross-referenced. You find your own file: four hundred and thirty-seven entries, going back to when you were two years old. The last entry is from tonight. But below it, in ink that isn\'t dry yet, is one more entry — dated tomorrow. It describes a choice you haven\'t made yet.', positionX: 400, positionY: 500 },
          { id: end1,   nodeType: 'ending', status: 'completed', title: 'The Cartographer\'s Work',    content: 'You take the pen and begin to draw. Slowly, then faster, the city fills in around the edges of the map. Places you\'ve only glimpsed in dreams solidify. You draw through the night. When you wake, the map on your pillow is complete — every street, every district, every name. And on the back, in your handwriting: "See you tonight."', positionX: 150, positionY: 700 },
          { id: end2,   nodeType: 'ending', status: 'completed', title: 'The Bridge Holds',            content: 'You sit beside the child and draw. Your lines and hers meet in the middle of the bridge, which solidifies under your pencil. The people cross. The child hands you her notebook. "Keep drawing," she says. "The city needs people who remember it." You wake with the notebook in your lap — real, solid, and full of streets you\'ve never seen. Yet.', positionX: 400, positionY: 700 },
          { id: end3,   nodeType: 'ending', status: 'completed', title: 'The Tomorrow Entry',          content: 'You read the entry for tomorrow carefully. It says: you will choose to stay. You close the file and put it back. Then you walk out of the library into the city — the market, the tower, the upward river — and choose to understand it instead of complete it. Some cities exist to be explored, not finished. You go home each morning. You return every night.', positionX: 650, positionY: 700 },
        ],
        choices: [
          { sourceNodeId: start,  targetNodeId: market,  label: 'Fall asleep with the map',           orderIndex: 0 },
          { sourceNodeId: start,  targetNodeId: library, label: 'Look for answers in the archive',    orderIndex: 1 },
          { sourceNodeId: market, targetNodeId: bridge,  label: 'Follow the vendor\'s compass',       orderIndex: 0 },
          { sourceNodeId: market, targetNodeId: tower,   label: 'Head for the tower of clocks',       orderIndex: 1 },
          { sourceNodeId: tower,  targetNodeId: cartog,  label: 'Go inside',                          orderIndex: 0 },
          { sourceNodeId: tower,  targetNodeId: library, label: 'Retreat to the archive',             orderIndex: 1 },
          { sourceNodeId: cartog, targetNodeId: end1,    label: 'Take the pen and draw',              orderIndex: 0 },
          { sourceNodeId: cartog, targetNodeId: end3,    label: 'Refuse — this isn\'t your job',      orderIndex: 1 },
          { sourceNodeId: bridge, targetNodeId: end2,    label: 'Sit and draw with her',              orderIndex: 0 },
          { sourceNodeId: bridge, targetNodeId: cartog,  label: 'Go find whoever is in charge',       orderIndex: 1 },
          { sourceNodeId: library,targetNodeId: end3,    label: 'Read the tomorrow entry',            orderIndex: 0 },
          { sourceNodeId: library,targetNodeId: bridge,  label: 'Go find the dissolving bridge',     orderIndex: 1 },
        ],
      }
    },
  },

  // ── 5. DEEP WATER (Adventure / All Ages) ────────────────────────────────
  {
    adventure: {
      title: 'Deep Water',
      description: 'You\'re a marine biologist\'s assistant when the research submersible loses contact with the surface. Seven hundred metres down, something is watching the lights.',
      audience: 'all',
      tags: JSON.stringify(['Sci-Fi', 'Adventure', 'Mystery']),
    },
    nodes: () => {
      const start   = id(), power   = id(), hatch    = id()
      const contact = id(), current = id(), creature = id()
      const end1    = id(), end2    = id(), end3     = id()
      return {
        nodes: [
          { id: start,   nodeType: 'start',  status: 'completed', title: 'Seven Hundred Metres',         content: 'The submersible Nereid III is a good boat. Dr. Osei says this often, usually right before something goes wrong. You are the assistant. You have been down here three times. Each time the dark outside the viewport feels different — not empty, but patient. Then the comms array gives one long crackle and goes silent. The depth gauge reads 714 metres. The lights flicker.', positionX: 400, positionY: 100 },
          { id: power,   nodeType: 'scene',  status: 'completed', title: 'Power Failure',                content: 'Emergency lighting kicks in — a dim red that makes everything look like an old photograph. Dr. Osei runs diagnostics. Main power is intact; the failure is in the external array. Something hit it, or something pulled it. Through the viewport, a shape moves at the edge of your light cone. Large. Slow. It does not look like any of the three hundred species Dr. Osei has catalogued.', positionX: 150, positionY: 300 },
          { id: hatch,   nodeType: 'scene',  status: 'completed', title: 'The Sample Hatch',             content: 'The sub has a small external hatch used for collecting sediment samples — technically large enough for a person, though no one is supposed to exit at this depth without a hardsuit. The hardsuit is in the aft locker. The hatch is also where the damaged comms array is mounted. One of you could go out. Dr. Osei is already shaking his head.', positionX: 650, positionY: 300 },
          { id: contact, nodeType: 'scene',  status: 'completed', title: 'The Backup Radio',             content: 'There is a backup radio — low-frequency, short-range — that the sub uses for coordinating with divers. Osei rigged it once, years ago, to reach the surface from a hundred metres. "At seven hundred," he says, "maybe ten percent chance." He hands it to you. While you recalibrate it, the creature outside moves closer. You can hear it — a low harmonic resonance, almost musical.', positionX: 150, positionY: 500 },
          { id: current, nodeType: 'scene',  status: 'completed', title: 'Riding the Thermal',           content: 'The nav system shows a thermal column rising from a vent field two hundred metres east. If you can navigate into it, the column\'s upward flow could carry you to five hundred metres — shallow enough for the radio to reach the surface. The catch: you\'d need to power the thrusters at full, and something outside seems to be following the sub\'s electrical signature.', positionX: 650, positionY: 500 },
          { id: creature,nodeType: 'scene',  status: 'completed', title: 'The Bioluminescent Giant',    content: 'It presses against the viewport — not aggressively, but with what Osei, in a stunned whisper, calls "curiosity". It is forty metres long at least, with a body pattern of bioluminescent lights that pulse in sequences. Osei has his notebook out. His hand is shaking. "It\'s communicating," he breathes. "Those are patterns. It\'s responding to our running lights."', positionX: 400, positionY: 500 },
          { id: end1,    nodeType: 'ending', status: 'completed', title: 'Surfaced',                    content: 'The thermal column carries you up. At 490 metres, the backup radio crackles and the surface team answers. Rescue takes four hours. When you surface, blinking in daylight, Osei has filled eleven pages of notes. The footage from the external camera — two hours of a creature that science has no name for — will be argued about for years. You slept through most of the ascent.', positionX: 150, positionY: 700 },
          { id: end2,    nodeType: 'ending', status: 'completed', title: 'First Language',              content: 'You flash the running lights in response to the creature\'s patterns — simple repetition first, then variation. It responds. For forty minutes you have a conversation with something that has never spoken to a human being. When it finally pulls away into the dark, Osei is crying and you don\'t tease him for it. The rescue team, when they finally arrive, wants to know why you\'re both smiling.', positionX: 400, positionY: 700 },
          { id: end3,    nodeType: 'ending', status: 'completed', title: 'The Array',                  content: 'You suit up and go out the hatch. The cold is absolute, the pressure unreal. You fix the comms array by feel, your suit\'s light the only thing between you and complete darkness. Something brushes past — warm, vast, and gentle. You feel it more than see it. You get back inside. The comms array works. Osei has the footage. The creature is gone. You never saw it clearly enough to describe it, and somehow that feels right.', positionX: 650, positionY: 700 },
        ],
        choices: [
          { sourceNodeId: start,   targetNodeId: power,   label: 'Run diagnostics on the power',       orderIndex: 0 },
          { sourceNodeId: start,   targetNodeId: hatch,   label: 'Check the sample hatch',             orderIndex: 1 },
          { sourceNodeId: power,   targetNodeId: contact, label: 'Try the backup radio',               orderIndex: 0 },
          { sourceNodeId: power,   targetNodeId: creature,label: 'Observe the shape outside',          orderIndex: 1 },
          { sourceNodeId: hatch,   targetNodeId: end3,    label: 'Suit up and go outside',             orderIndex: 0 },
          { sourceNodeId: hatch,   targetNodeId: current, label: 'Use the thrusters instead',          orderIndex: 1 },
          { sourceNodeId: contact, targetNodeId: end1,    label: 'Broadcast and wait for rescue',      orderIndex: 0 },
          { sourceNodeId: contact, targetNodeId: creature,label: 'Investigate the creature first',     orderIndex: 1 },
          { sourceNodeId: current, targetNodeId: end1,    label: 'Power the thrusters and ascend',     orderIndex: 0 },
          { sourceNodeId: current, targetNodeId: creature,label: 'Hold position and watch the creature',orderIndex: 1 },
          { sourceNodeId: creature,targetNodeId: end2,    label: 'Try to communicate',                 orderIndex: 0 },
          { sourceNodeId: creature,targetNodeId: end3,    label: 'Fix the array while it\'s distracted',orderIndex: 1 },
        ],
      }
    },
  },

]

// ---------------------------------------------------------------------------
// Insert
// ---------------------------------------------------------------------------

async function seed() {
  console.log(`\nSeeding 5 new stories for ${USER_EMAIL}...\n`)

  for (const story of stories) {
    const adventureId = id()
    const shareToken = token()
    const { nodes: nodeList, choices: choiceList } = story.nodes()

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
