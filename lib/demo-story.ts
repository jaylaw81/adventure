import type { Node, Choice, Adventure } from '@/lib/schema'

export const DEMO_ADVENTURE_ID = 'demo'

export const DEMO_ADVENTURE: Adventure = {
  id: DEMO_ADVENTURE_ID,
  title: 'The Forest Path',
  description: 'A short choose-your-own-adventure demo story. Edit any scene, drag nodes, or add new ones — changes are saved in your browser.',
  userEmail: null,
  audience: 'all',
  tags: '["Fantasy","Adventure"]',
  isPublic: false,
  shareToken: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const DEMO_NODES: Node[] = [
  {
    id: 'demo-node-1',
    adventureId: DEMO_ADVENTURE_ID,
    title: 'The Forest Path',
    content: `You stand at the edge of an ancient forest as twilight settles over the land. The air smells of pine and damp earth. Two paths diverge before you.

To your left, a narrow trail leads toward a glowing cave carved into the hillside — a soft blue light pulses from somewhere deep within.

To your right, a mossy path follows the sound of a babbling silver stream winding through the trees.

Your lantern flickers. Whatever you decide, you must choose quickly before darkness falls.`,
    nodeType: 'start',
    status: 'completed',
    imageUrl: null,
    positionX: 380,
    positionY: 60,
  },
  {
    id: 'demo-node-2',
    adventureId: DEMO_ADVENTURE_ID,
    title: 'The Glowing Cave',
    content: `The cave mouth exhales a cool, mineral-scented breath. Strange blue crystals line the walls, casting everything in an otherworldly glow. Your footsteps echo as you venture deeper.

Halfway in, you spot two things: a narrow passage that spirals down into darkness — and faint scratching sounds that suggest you are not alone.

A moment later, a small creature emerges from the shadows. It has wide amber eyes and clutches a worn leather satchel. It doesn't look dangerous. In fact, it looks frightened.`,
    nodeType: 'scene',
    status: 'completed',
    imageUrl: null,
    positionX: 80,
    positionY: 300,
  },
  {
    id: 'demo-node-3',
    adventureId: DEMO_ADVENTURE_ID,
    title: 'The Silver Stream',
    content: `The stream catches the last light of day and turns it into ribbons of silver. Flat stepping-stones cross to the far bank where fireflies are beginning to wake.

As you follow the water downstream, you notice something strange: the stream flows uphill for a short stretch, defying gravity entirely, before resuming its natural course.

Beyond it, through a gap in the trees, you glimpse the warm glow of lanterns and hear the distant sound of laughter. Someone lives out here.`,
    nodeType: 'scene',
    status: 'in_progress',
    imageUrl: null,
    positionX: 680,
    positionY: 300,
  },
  {
    id: 'demo-node-4',
    adventureId: DEMO_ADVENTURE_ID,
    title: 'The Dragon\'s Secret',
    content: `The creature in the cave is a young dragon — no larger than a wolf — with scales the colour of midnight and eyes like molten gold. It cannot speak your language, but its meaning is clear enough.

It opens the satchel and pours out a heap of glittering objects: pocket watches, compasses, spectacles, and one very important-looking brass key.

It holds the key out to you. Somewhere in this forest, there is a lock that fits. You pocket the key, scratch the dragon under its chin (it rumbles with pleasure), and step back out into the night with a new purpose — and an unlikely ally.`,
    nodeType: 'ending',
    status: 'in_progress',
    imageUrl: null,
    positionX: 80,
    positionY: 540,
  },
  {
    id: 'demo-node-5',
    adventureId: DEMO_ADVENTURE_ID,
    title: 'The Hidden Village',
    content: `Through the gap in the trees you find a village that shouldn't exist — a dozen treehouses connected by rope bridges, lit by lanterns carved from hollowed acorns.

The villagers are the size of children but ancient in their eyes. They welcome you to their fire, press a warm bowl of something delicious into your hands, and — once you've eaten — explain that the uphill stream is a doorway.

Every evening it flows backwards for exactly one hour. Step in during that time and it will carry you to a world layered beneath this one, where the rules are different. They've been waiting for someone who would follow the water upstream instead of down.`,
    nodeType: 'ending',
    status: 'in_progress',
    imageUrl: null,
    positionX: 680,
    positionY: 540,
  },
]

export const DEMO_CHOICES: Choice[] = [
  {
    id: 'demo-choice-1',
    adventureId: DEMO_ADVENTURE_ID,
    sourceNodeId: 'demo-node-1',
    targetNodeId: 'demo-node-2',
    label: 'Enter the glowing cave',
    orderIndex: 0,
  },
  {
    id: 'demo-choice-2',
    adventureId: DEMO_ADVENTURE_ID,
    sourceNodeId: 'demo-node-1',
    targetNodeId: 'demo-node-3',
    label: 'Follow the silver stream',
    orderIndex: 1,
  },
  {
    id: 'demo-choice-3',
    adventureId: DEMO_ADVENTURE_ID,
    sourceNodeId: 'demo-node-2',
    targetNodeId: 'demo-node-4',
    label: 'Approach the creature',
    orderIndex: 0,
  },
  {
    id: 'demo-choice-4',
    adventureId: DEMO_ADVENTURE_ID,
    sourceNodeId: 'demo-node-2',
    targetNodeId: 'demo-node-1',
    label: 'Back to the path',
    orderIndex: 1,
  },
  {
    id: 'demo-choice-5',
    adventureId: DEMO_ADVENTURE_ID,
    sourceNodeId: 'demo-node-3',
    targetNodeId: 'demo-node-5',
    label: 'Walk toward the lanterns',
    orderIndex: 0,
  },
  {
    id: 'demo-choice-6',
    adventureId: DEMO_ADVENTURE_ID,
    sourceNodeId: 'demo-node-3',
    targetNodeId: 'demo-node-1',
    label: 'Return to the path',
    orderIndex: 1,
  },
]
