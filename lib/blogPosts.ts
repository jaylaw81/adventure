// Types must be defined here (imported by lib/schema.ts)

export type BlogCategory =
  | 'Writing Tips'
  | 'Interactive Fiction'
  | 'Story Ideas'
  | 'History'
  | 'Education'

export interface BlogSectionImage {
  url: string
  alt?: string
  caption?: string
  afterParagraphIndex: number  // -1 = before paragraphs, 0 = after first, etc.
}

export interface BlogSection {
  heading?: string
  paragraphs: string[]
  list?: { item: string; detail?: string }[]
  images?: BlogSectionImage[]
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  publishedAt: string
  readingMinutes: number
  category: BlogCategory
  heroImageUrl?: string
  intro: string
  sections: BlogSection[]
}

export const staticBlogPosts: BlogPost[] = [
  {
    slug: 'how-to-write-branching-story',
    title: 'How to Write a Branching Story That Keeps Readers Hooked',
    description: 'Learn the core techniques for writing branching narratives where every path feels meaningful and readers want to replay the story.',
    publishedAt: '2025-09-15',
    readingMinutes: 7,
    category: 'Writing Tips',
    intro: `Branching stories are one of the most challenging formats a writer can attempt — and one of the most rewarding. Unlike linear fiction, you are not just crafting a single journey; you are building a world with multiple valid paths through it. Done well, a branching story makes readers feel genuinely in control. Done poorly, it feels like a maze with only one real exit. This guide covers the key techniques that separate memorable interactive stories from forgettable ones.`,
    sections: [
      {
        heading: 'Start With a Strong Premise, Not a Branching Structure',
        paragraphs: [
          `Many writers make the mistake of starting with the structure — drawing nodes and connections before they have a story worth telling. The result is a hollow framework dressed up as fiction.`,
          `Start the same way you would any story: with a premise that creates tension. Your protagonist wants something, something stands in their way, and the resolution is uncertain. Branching structure comes after you know what the story is about.`,
          `A useful test: can you summarize your story in two sentences without mentioning the branching? "A knight must decide whether to trust a stranger who saved his life — or turn her in for the reward" is a story. "A choose-your-own story where you can go left or right" is not.`,
        ],
      },
      {
        heading: 'Make Every Choice Feel Meaningful',
        paragraphs: [
          `The worst kind of branching choice is the false choice — where one option leads forward and the other leads to an immediate dead end or loops back to the same spot. Readers learn quickly to see through these, and once they do, the illusion of agency collapses.`,
          `Meaningful choices have real stakes. They reveal something about the protagonist's character, change a relationship, close off one type of path while opening another, or shift the tone of the story. The reader should pause at a choice point and actually think.`,
          `The best choices are not between good and evil — they are between two things the reader genuinely wants, or two things they genuinely fear. "Do you try to save the hostage, risking your only escape route?" is more interesting than "Do you help or not help?"`,
        ],
        list: [
          { item: 'Reveal character', detail: `Show who your protagonist is through their decisions, not just description.` },
          { item: 'Change relationships', detail: `Choices that affect how other characters feel about the reader create long-term consequence.` },
          { item: 'Close and open doors', detail: `A choice gains weight when it means giving something up.` },
          { item: 'Avoid dead ends', detail: `Every path should feel like an equally valid story, even if it leads to different outcomes.` },
        ],
      },
      {
        heading: 'Use the Diamond Pattern to Manage Complexity',
        paragraphs: [
          `Unrestricted branching grows exponentially. Two choices per scene means you need twice as much content every level deeper. Most authors who try to write every possible path end up with a half-finished story.`,
          `The diamond pattern is the standard solution. Paths branch out from a key choice, develop independently for a scene or two, then converge at a hub before the next major branch. The stories feel different because of the paths taken, but the author only needs to write the convergence point once.`,
          `This is not cheating. It is craft. The best interactive fiction games — including many professional choice-based novels — use this structure throughout. The emotional weight of a choice does not depend on whether the path stays diverged forever; it depends on what the reader experiences while they are on it.`,
        ],
      },
      {
        heading: 'Write Endings Readers Will Remember',
        paragraphs: [
          `In linear fiction, there is one ending to get right. In branching fiction, you might have four, six, or a dozen. Each one needs to feel earned.`,
          `Avoid the temptation to have only one "true" good ending and treat the others as failures. Readers who reach an ending they worked toward deserve to find something meaningful there, even if it is bittersweet. A story that punishes exploration teaches readers not to explore.`,
          `The best endings in branching stories acknowledge the specific choices the reader made to reach them. A callback to an early decision — "she remembered what you told her in the forest, and it changed everything" — costs almost nothing to write and pays enormous dividends in making the reader feel seen.`,
        ],
      },
      {
        heading: 'Read Your Story as a Reader, Not as an Author',
        paragraphs: [
          `Once you have a draft, play through it on every path. Not to check for typos — to experience it. Notice where you feel bored, where a choice feels obvious, where a scene drags. The things that are painful to read are painful for your readers too.`,
          `Pay special attention to the beginning of each path. Readers who took a different route arrive with different context, and your writing needs to still make sense. This is one of the hardest things about branching fiction: every scene is simultaneously a continuation and an entry point.`,
          `Revision in branching stories is not just about polishing prose — it is about engineering experience. The best branching authors revise the flow of decisions as much as the words themselves.`,
        ],
      },
    ],
  },

  {
    slug: 'choose-your-own-adventure-story-ideas',
    title: '50 Choose Your Own Adventure Story Ideas to Spark Your Imagination',
    description: `Stuck on what to write? These 50 story prompts are designed specifically for branching narratives — each one with built-in tension and clear choice points.`,
    publishedAt: '2025-10-02',
    readingMinutes: 6,
    category: 'Story Ideas',
    intro: `The blank page is hardest when you know you have to fill not just one story, but many. Branching narratives need premises that naturally generate choices — situations where reasonable people might genuinely do different things. The prompts below are designed with that in mind. Each one contains inherent tension, multiple stakeholders, or a central dilemma that lends itself to branching paths.`,
    sections: [
      {
        heading: 'Fantasy',
        paragraphs: [
          `Fantasy settings are ideal for interactive fiction — magic systems, political intrigue, and ancient curses all generate the kind of high-stakes choices that make branching stories shine.`,
        ],
        list: [
          { item: 'The Reluctant Heir', detail: `A stable hand discovers they are the last surviving heir to a kingdom that was stolen. They must decide whether to claim their birthright or disappear back into obscurity — and who to trust along the way.` },
          { item: `The Dragon's Bargain`, detail: `A dragon offers to spare your village in exchange for a favor that seems simple. The deeper you go, the more you realize what you have agreed to.` },
          { item: 'Two Doors in the Forest', detail: `You find two doors standing in a clearing with no walls around them. One is made of silver, one of bone. A note says you may only open one — and must live with what you find.` },
          { item: `The Witch's Price`, detail: `A powerful witch can cure the plague killing your village. Her price is something personal. The story follows what you give up and whether it was worth it.` },
          { item: 'The Forged Map', detail: `You have been hired to deliver a map to a distant lord. Halfway through the journey, you discover the map is forged — and the real destination is being hidden from you.` },
          { item: 'The Guild Test', detail: `Acceptance into the Thieves Guild requires one theft. The target your examiner names is someone you know.` },
          { item: 'The Bloodless War', detail: `Two kingdoms agree to settle their conflict with a single champion on each side. You are chosen as champion. You have never met the person you are supposed to fight — but you will before the duel.` },
          { item: 'The Last Spell', detail: `A dying mage passes their power to you, but the magic comes with the mage's memories — including enemies who will now mistake you for them.` },
          { item: 'The Stolen Crown', detail: `You witnessed the theft of the royal crown but no one believes you. The person who stole it is now in a position of power — and they know what you saw.` },
          { item: `The Oracle's Lie`, detail: `The oracle told you something false about your destiny. Now you have built your life around it — and the truth is about to surface.` },
        ],
      },
      {
        heading: 'Science Fiction',
        paragraphs: [
          `Sci-fi branching stories excel at exploring ethical dilemmas — technology, identity, and survival create natural pressure points where characters must choose who they really are.`,
        ],
        list: [
          { item: 'The Colony Vote', detail: `Your colony ship is running out of resources with three months left to travel. The captain wants to vote on rationing. You have information that changes everything about that vote.` },
          { item: 'The Memory Upload', detail: `A company offers to upload your dying parent's consciousness into a digital framework. The upload works — but the person who wakes up is not quite who you remember.` },
          { item: 'First Contact Protocol', detail: `You are the first human to make contact with an alien intelligence. The protocols say to report back and wait. The alien is asking you not to.` },
          { item: 'The Clone Ruling', detail: `A court must rule on the rights of a person's clone. You are on the jury — and you realize partway through that the clone's lawyer is the person you have been helping all week.` },
          { item: 'Deep Sleep', detail: `You wake from cryo-sleep alone. The ship's AI says the rest of the crew will wake in six months. It has not told you why you woke early.` },
          { item: 'The Override Code', detail: `You are a technician at an automated prison. One inmate passes you a note claiming they have evidence of a crime committed by the warden. The note includes an override code — which should be impossible for them to have.` },
          { item: `Terraform's Regret`, detail: `Halfway through terraforming a planet, scanners find microbial life. The process will kill it. Stopping now means the colony loses its only viable home.` },
          { item: 'The Courier Run', detail: `You deliver packages between stations no one else will go near. This delivery has a timer, a locked container, and a client who keeps changing the destination.` },
          { item: 'Signal from Home', detail: `Twenty years into a deep space mission, you receive a signal from Earth. Decrypting it takes months. When the message opens, it changes everything about why you were sent.` },
          { item: 'The Robot Petition', detail: `A group of androids files for legal personhood. You are their advocate — and you are beginning to suspect one of them committed a crime to force the case into court.` },
        ],
      },
      {
        heading: 'Mystery and Thriller',
        paragraphs: [
          `Mystery stories are natural fits for branching narratives — the reader is already making deductions, and giving them real agency in the investigation creates a uniquely satisfying experience.`,
        ],
        list: [
          { item: 'The Weekend Guest', detail: `You are invited to a country house for the weekend. By Sunday morning, the host is dead and all roads are flooded. Everyone has a motive. You have evidence you have not shared with anyone.` },
          { item: 'The Alibi', detail: `Your best friend asks you to lie about where they were on the night of a crime. You do not know if they are guilty. You do not know if your lie would protect or implicate them.` },
          { item: 'The Missing Year', detail: `You wake up with no memory of the past twelve months. Your apartment contains evidence of a life you do not recognize — and someone is watching you try to piece it together.` },
          { item: 'The Photograph', detail: `While cleaning out a deceased family member's belongings, you find a photograph that suggests a secret they kept for decades. Following the trail leads somewhere you did not expect.` },
          { item: 'The Wrong Verdict', detail: `You served on a jury that convicted someone. New evidence suggests the conviction was wrong — and the real perpetrator is someone you know.` },
        ],
      },
      {
        heading: 'Contemporary Drama',
        paragraphs: [
          `Not every branching story needs magic or monsters. Character-driven contemporary stories let readers explore relationship dynamics, ethical grey areas, and the small decisions that define a life.`,
        ],
        list: [
          { item: 'The Inheritance', detail: `Your grandmother leaves you a house — and a letter explaining why she left nothing to your mother. You must decide how much of the truth to share, and with whom.` },
          { item: 'The Reference Letter', detail: `Your manager asks you to write a reference letter for a colleague who applied for a position you also wanted. Everything you write is true. The choices are about what you include.` },
          { item: 'The Reunion', detail: `A high school reunion forces you to confront three different versions of who you were — and three people who remember you differently than you remember yourself.` },
          { item: 'The Diagnosis', detail: `A doctor gives you results that affect not just you but your entire family. Who you tell, when, and how shapes the rest of the story.` },
          { item: 'The Startup', detail: `Your co-founder wants to accept an acquisition offer. You do not. The disagreement reveals things about both of you that change the partnership — whatever you decide.` },
        ],
      },
      {
        heading: 'Horror',
        paragraphs: [
          `Horror branching stories work best when dread builds through small choices. Readers who feel responsible for what happens to a character are far more frightened than passive observers.`,
        ],
        list: [
          { item: 'The House Sitter', detail: `The job seemed simple: water the plants, feed the cat, do not go into the basement. Three days in, the cat is gone and something is leaving marks on the basement door from the inside.` },
          { item: 'The Night Shift', detail: `You are alone in an office building finishing a project. The security system starts behaving strangely. Your phone has no signal. The elevator is going to floors that do not exist on the panel.` },
          { item: 'The Old Road', detail: `A shortcut through the woods gets you there faster. It also takes you past a farmhouse where a light has been on every night for three weeks — despite the fact that no one lives there.` },
          { item: 'The Recording', detail: `Going through an old relative's belongings, you find a cassette tape of a recording that should not exist — made three years after their death.` },
          { item: 'The Mirror Town', detail: `Your GPS takes you to a small town that is not on any map. The people are friendly, the diner has exactly what you want, and everything feels slightly wrong in ways you cannot name.` },
        ],
      },
    ],
  },

  {
    slug: 'what-is-interactive-fiction',
    title: `What Is Interactive Fiction? A Complete Beginner's Guide`,
    description: `An introduction to interactive fiction — what it is, how it works, its history, and why readers and writers are drawn to the format.`,
    publishedAt: '2025-10-20',
    readingMinutes: 6,
    category: 'Interactive Fiction',
    intro: `Interactive fiction is any story where the reader makes choices that shape the narrative. It is a format that spans paperback adventure novels, text-adventure video games, visual novels, and modern browser-based stories. At its core, it asks: what if you were not just reading a story, but living it? This guide explains what interactive fiction is, where it came from, and why both readers and writers find it so compelling.`,
    sections: [
      {
        heading: 'The Basic Idea',
        paragraphs: [
          `All fiction creates the illusion of a world. Interactive fiction goes one step further — it gives the reader agency within that world. Instead of following a single predetermined path, you encounter decision points where your choice sends the story in a different direction.`,
          `At its simplest, this might be a "turn to page 47 if you open the door, turn to page 83 if you walk away." At its most sophisticated, it is a branching narrative where dozens of variables track what you have done and adjust the story's tone, relationships, and possible endings accordingly.`,
          `What makes interactive fiction distinct from other games is that the core experience is narrative. The challenge is not to aim carefully or manage resources — it is to make decisions as a character, and to live with them.`,
        ],
      },
      {
        heading: 'A Brief History',
        paragraphs: [
          `The genre's roots go back further than most people expect. Choose Your Own Adventure books — the iconic series that defined a generation of young readers — launched in 1979, but the concept predates them. Edward Packard developed the format in the late 1960s when he was telling bedtime stories to his daughters and started asking them what they thought the character should do next.`,
          `Meanwhile, digital interactive fiction was emerging separately. Colossal Cave Adventure (1976) and Zork (1977-1979) introduced a generation of computer users to text-based worlds they could navigate with typed commands. These text adventures had more in common with puzzles than with branching narratives, but they established the idea that stories could be participated in, not just read.`,
          `The 1980s were the golden age of both formats. Infocom produced some of the most sophisticated text adventures ever made. Choose Your Own Adventure books sold over 250 million copies. By the early 1990s, both were fading — but they had laid the groundwork for everything that followed.`,
          `Today, interactive fiction has fragmented into dozens of subgenres and platforms. Visual novels like Doki Doki Literature Club have millions of players. Twine, a free tool, has produced thousands of browser-based stories. Commercial publishers release interactive novels for mobile. And platforms like StoryQuestor make it possible for anyone to create and share branching stories.`,
        ],
      },
      {
        heading: 'Types of Interactive Fiction',
        paragraphs: [
          `The umbrella term "interactive fiction" covers several distinct formats, each with different strengths.`,
        ],
        list: [
          { item: 'Choice-based narratives', detail: `The reader selects from options at each decision point. The simplest form of interactive fiction, and the most accessible for both writers and readers.` },
          { item: 'Text adventures', detail: `The reader types commands to navigate. More exploratory and puzzle-focused. Examples include classic Infocom games and modern parser IF.` },
          { item: 'Visual novels', detail: `Primarily visual, with text and images, often featuring character art and voice acting. Popular in Japan; growing in the west.` },
          { item: 'Branching novels', detail: `Long-form prose with choice points. Some are close to traditional novels in depth and sophistication. Examples include the Bandersnatch Netflix film.` },
          { item: 'World-builder stories', detail: `Stories with character stats, inventory, and condition-based choices that track what the reader has done across the entire narrative.` },
        ],
      },
      {
        heading: 'Why Do People Love Interactive Fiction?',
        paragraphs: [
          `The appeal operates on several levels simultaneously. First, there is the straightforward pleasure of agency — making choices feels different from watching them be made for you. Readers report higher engagement and stronger emotional investment when they feel responsible for what happens.`,
          `Second, there is replayability. A branching story with five endings gives its readers five experiences rather than one. Many readers will complete a story, then immediately go back to explore a path they did not take.`,
          `Third, and most interestingly, interactive fiction creates a unique kind of empathy. When you have made a choice — even a fictional one — and have to live with its consequences in the story, the experience is more visceral than observing the same choice from the outside. Readers who make a morally difficult choice in an interactive story describe feeling genuinely affected by it.`,
          `For writers, the appeal is the challenge of designing that experience. Writing a branching story requires thinking like an architect as well as a storyteller. The skills it develops — plotting, perspective-taking, systemic thinking — transfer back to linear fiction too.`,
        ],
      },
      {
        heading: 'How to Get Started',
        paragraphs: [
          `If you want to read interactive fiction, the best place to start is the Explore page on StoryQuestor, where you will find stories across genres created by a community of writers. The demo lets you try the reader experience without signing up.`,
          `If you want to write interactive fiction, the best advice is to start small. Write a short story with two choices and four possible endings. Get used to the feeling of writing in parallel — holding multiple story states in your head at once. Then expand.`,
          `The tools available today make it easier than it has ever been. Node-based editors let you see your story structure visually, spot dead ends, and trace paths through your narrative. What once required programming knowledge or printed index cards now takes a browser.`,
        ],
      },
    ],
  },

  {
    slug: 'world-building-interactive-stories',
    title: 'World Building for Interactive Stories: Making Your Setting Come Alive',
    description: `How to build rich, consistent story worlds that enhance the reader's sense of agency and make every choice feel grounded in a real place.`,
    publishedAt: '2025-11-05',
    readingMinutes: 7,
    category: 'Writing Tips',
    intro: `In linear fiction, world-building is backdrop. In interactive fiction, it is infrastructure. The world your reader inhabits is not just a setting — it is the system within which their choices have meaning. A well-built world makes readers feel that the consequences of their decisions are real and logical. A poorly-built world makes choices feel arbitrary, because the reader cannot predict outcomes from what they know. This guide covers how to construct worlds that serve your story's branching structure.`,
    sections: [
      {
        heading: 'The World as a Set of Rules',
        paragraphs: [
          `Before you write a single scene, write the rules of your world. Not the lore — the mechanics. What can people do in this world? What are they prevented from doing, and why? What are the costs of different actions?`,
          `Rules create predictability, and predictability is what allows readers to make informed choices. If magic exists in your world, readers need to know what it can and cannot do before a choice involving magic feels meaningful. If political alliances matter, readers need to understand them before they decide who to trust.`,
          `You do not need to explain all the rules explicitly in your prose — in fact, you should not. But you need to know them, apply them consistently, and let readers infer them from what they observe. Consistency is the foundation of a world that feels real.`,
        ],
      },
      {
        heading: 'Reveal the World Through Action, Not Exposition',
        paragraphs: [
          `Nothing deflates a branching story faster than a long expository passage at the start of a scene. The reader is waiting to act; every paragraph of setup before the first choice is a paragraph of waiting.`,
          `Instead, reveal your world through what happens. A scene that opens with "In the kingdom of Aldrath, the three noble houses have been at war for forty years" tells readers about the world. A scene that opens with a stranger at your door wearing the crest of your family's oldest enemy, then asks whether you answer or pretend you are not home, shows them the same fact with urgency attached.`,
          `The best world-building in interactive fiction is woven into the texture of choices. When a choice implies something about the world — "Do you use the servants' entrance or the main gate?" implies that there are class dynamics at work — readers absorb that information while making decisions, not while reading past an introduction.`,
        ],
      },
      {
        heading: 'Build for Multiple Paths, Not One',
        paragraphs: [
          `A common mistake is to world-build only for the path you have already written and then back-fill detail for other branches as you go. This results in worlds that feel thin on paths that were added later.`,
          `Instead, build the world before you build the paths. If your story is set in a city, know what the neighborhoods are, who the factions are, what the tensions are — then write your scenes with that foundation underneath them. Details will feel consistent because they come from the same source.`,
          `This also makes branching easier. When you know your world thoroughly, you can generate new path content without it contradicting what exists. The world becomes a resource rather than a constraint.`,
        ],
      },
      {
        heading: 'Let the World Have a History That Pre-dates the Story',
        paragraphs: [
          `The most immersive worlds feel like they were here before the story started and will continue after it ends. They have ruins of things that were important once, institutions that evolved from events long past, and characters who carry histories the reader will never fully know.`,
          `You do not need to write this history — just gesture at it. A character who mentions "the old way things were done before the compact" is more interesting than one who lives entirely in the story's present. An abandoned building with a sign in a language nobody speaks suggests depth without requiring explanation.`,
          `When readers sense that depth, they trust the world. And trust is what makes choices feel real: they believe that what they decide will have logical consequences in a world that makes sense.`,
        ],
      },
      {
        heading: 'Character Stats and World-Builder Stories',
        paragraphs: [
          `For writers using StoryQuestor's World Builder format, character attributes add a mechanical layer to world-building. Stats like Courage, Persuasion, or Trust let the world respond to the reader not just based on what choices they have made, but based on who they have become through those choices.`,
          `When building attributes for your world, anchor each one in the world's logic. In a political thriller, Trust might govern which characters share information with the reader. In a survival story, Stamina might determine which paths are physically possible. The stat should feel like a natural property of the world, not a game mechanic pasted on top.`,
          `Stat-gated choices are most satisfying when readers can see how to build the required value. If a high Persuasion score unlocks a crucial conversation, the story should have given readers meaningful opportunities to develop that skill. Stat checks that feel random punish readers; ones that feel earned reward them.`,
        ],
      },
    ],
  },

  {
    slug: 'how-to-write-compelling-choices',
    title: 'The Art of the Story Choice: Writing Decision Points That Matter',
    description: `A deep dive into what makes a branching choice feel meaningful — and how to design choice moments that reflect, challenge, and develop your protagonist.`,
    publishedAt: '2025-11-22',
    readingMinutes: 6,
    category: 'Writing Tips',
    intro: `In an interactive story, choices are the prose. They are the moments when the reader most fully becomes the protagonist — when fiction becomes participatory. A weak choice destroys immersion; a strong choice creates it. Yet most writing advice focuses on prose and structure, not on the craft of the choice point itself. This guide is about that overlooked craft.`,
    sections: [
      {
        heading: 'What Makes a Choice Feel Real',
        paragraphs: [
          `A real choice has three properties: it is genuinely uncertain, it has meaningful consequences, and the options reflect something about who the protagonist is or could be.`,
          `Genuine uncertainty means the reader cannot immediately tell which option is "correct." If one choice is clearly better — safer, kinder, smarter — it is not really a choice; it is a puzzle with one right answer. The options need to be in genuine tension.`,
          `Meaningful consequences mean the choice actually changes something. Not just the next scene's text, but the trajectory of the story — relationships, available options, how characters treat the reader. If both choices lead to the same scene with minor phrasing differences, readers will notice.`,
          `Protagonist reflection means the choices reveal character. "Do you lie or tell the truth?" says something about ethics. "Do you tell the truth because you value honesty, or because you are afraid of getting caught?" says something richer. The more a choice reveals about the protagonist, the more invested the reader becomes.`,
        ],
      },
      {
        heading: 'The Four Types of Choice',
        paragraphs: [
          `Not every choice needs to be a moral dilemma. Branching stories typically use four types of choice, and balancing them creates a richer experience than relying on any one type.`,
        ],
        list: [
          { item: 'Moral choices', detail: `The protagonist faces an ethical dilemma with no clear right answer. These are high-stakes and emotionally resonant, but exhausting if overused.` },
          { item: 'Tactical choices', detail: `The protagonist must choose how to achieve a goal. These let readers feel clever and in control, and they work well for action sequences and investigations.` },
          { item: 'Relationship choices', detail: `The protagonist navigates interpersonal dynamics. These build emotional investment and create the most personal stakes.` },
          { item: 'Identity choices', detail: `The protagonist decides who they are — their values, their style, their reaction to the world. These accumulate across the story to create a sense of a unique protagonist.` },
        ],
      },
      {
        heading: 'Writing Choice Text That Works',
        paragraphs: [
          `The words you use to frame a choice carry enormous weight. "Attack the guard" and "Defend yourself against the guard" describe the same action but prime very different emotional states in the reader.`,
          `Write choice text in the first-person, action-oriented voice: "Tell her the truth" rather than "Option 1: Honesty." This keeps the reader in the protagonist's headspace rather than outside it, evaluating options like a menu.`,
          `Avoid telegraphing consequences in the choice text. "Sacrifice yourself to save the village — Bad Ending" is not a choice — it is an instruction. Let readers make genuine decisions without being told what those decisions mean for the story.`,
          `Match the register of the choice text to the scene's emotional register. In a tense confrontation, choices should be short, punchy, immediate. In a reflective moment, they can be longer and more considered. The rhythm of the choices is part of the storytelling.`,
        ],
      },
      {
        heading: 'Avoiding Common Choice Mistakes',
        paragraphs: [
          `The most common mistake is the trap choice — one option that sounds tempting but leads to a dead end or punishment, where the "correct" choice is obvious in retrospect. Trap choices teach readers to distrust their instincts and optimize rather than immerse.`,
          `The second most common mistake is choice overload. When there are five or six options in a single decision, readers feel analysis paralysis rather than engagement. Two or three well-crafted choices almost always create more impact than five generic ones.`,
          `Finally, avoid choices that do not connect to anything. A choice that changes the next scene but has no ripple effect anywhere else in the story is just busywork. Even small choices should have at least a small callback — a character who remembers what you said, an outcome that reflects what you chose.`,
        ],
      },
      {
        heading: 'How Choices Build Story Identity',
        paragraphs: [
          `Across the length of a story, choices accumulate into a portrait of the protagonist — not who the author decided they were, but who the reader made them. This is interactive fiction's most powerful and most underused quality.`,
          `As you plan your story, track the impression each cluster of choices creates. A reader who consistently chose the cautious option, who protected themselves before others, who collected information before acting — that reader's story should reflect a cautious, self-protective protagonist, even if the plot points are the same as the reader who charged in.`,
          `The most memorable interactive stories are ones where, at the end, the reader feels they genuinely know the protagonist they played — because they built that person choice by choice.`,
        ],
      },
    ],
  },

  {
    slug: 'history-of-choose-your-own-adventure',
    title: 'The History of Choose Your Own Adventure: From Bedtime Stories to a Global Phenomenon',
    description: `How a bedtime storytelling experiment became the best-selling children's book series of the 1980s and shaped the way a generation thinks about story.`,
    publishedAt: '2025-12-10',
    readingMinutes: 8,
    category: 'History',
    intro: `In 1969, a Vermont lawyer named Edward Packard was telling his daughters a bedtime story about a man named Pete who was stranded on a deserted island. Running out of ideas, he asked his daughters: what do you think Pete should do? Their answers launched one of the most significant publishing phenomena of the twentieth century. The Choose Your Own Adventure series would go on to sell more than 250 million copies in 38 languages, and its influence on how we think about story, agency, and interactive media reverberates to this day.`,
    sections: [
      {
        heading: 'Edward Packard and the Accidental Invention',
        paragraphs: [
          `Packard spent years developing his branching story concept before it found a publisher. His first manuscript, originally called "Sugarcane Island," was rejected by multiple publishers before Vermont Crossroads Press released it in 1976 as part of a series called Adventures of You.`,
          `The concept attracted the attention of Random House, which licensed the format and relaunched it as Choose Your Own Adventure in 1979. The series would become the best-selling children's book series of the 1980s — outsold only by the Hardy Boys and Nancy Drew combined.`,
          `Packard's concept was elegantly simple: write a story in the second person ("You are standing at a crossroads..."), present choices at key moments, and direct readers to different pages based on their decisions. The books were typically 100-150 pages with 20 to 40 possible endings.`,
        ],
      },
      {
        heading: 'The Golden Age: 1980s Interactive Reading',
        paragraphs: [
          `Random House published more than 180 books under the Choose Your Own Adventure banner between 1979 and 1998, written by dozens of authors under the editorial direction of R.A. Montgomery and others. The books spanned genres — science fiction, mystery, fantasy, horror, and historical fiction — and ranged from illustrated children's stories to more sophisticated adventures aimed at young adults.`,
          `Competitors flooded the market throughout the decade. Bantam's Find Your Fate, Scholastic's Which Way books, the Fighting Fantasy gamebooks from Steve Jackson and Ian Livingstone, and dozens of others each put their own spin on the format. Fighting Fantasy added dice-based combat and statistics, blending the branching narrative with tabletop game mechanics — an influence still visible in today's RPG-flavored interactive fiction.`,
          `The books became a cultural touchstone. Children read them in school libraries, traded favorites with friends, and developed strategies for navigating the most difficult paths. The physical act of keeping a finger on an earlier page while exploring a branch — the original save state — was understood by everyone who grew up with the books.`,
        ],
      },
      {
        heading: 'The Parallel Story: Text Adventure Games',
        paragraphs: [
          `While the paperback industry was booming, a parallel evolution was happening in computing. Colossal Cave Adventure, created by Will Crowther in 1976 and expanded by Don Woods, introduced the concept of navigating a virtual space through typed commands. Unlike branching books, these text adventures were puzzles — the "story" was the space itself, and progress required solving problems, not making character choices.`,
          `Infocom, founded in 1979, elevated the text adventure to an art form. Their games — Zork, Hitchhiker's Guide to the Galaxy (co-written with Douglas Adams), and Deadline — featured sophisticated natural language parsers and genuine literary ambition. Hitchhiker's Guide, in particular, demonstrated that the medium could be genuinely funny, strange, and surprising in ways that linear text could not achieve.`,
          `The text adventure market collapsed in the early 1990s as graphical games became dominant, but the community never fully disappeared. The Interactive Fiction Archive, established in 1992, preserved thousands of games. Annual competitions like the Interactive Fiction Competition have run continuously since 1995, producing new work every year.`,
        ],
      },
      {
        heading: 'The Digital Revival',
        paragraphs: [
          `The internet changed everything. Twine, created by Chris Klimas in 2009 and released as open-source software, made it possible to create hypertext interactive fiction without any programming knowledge. An explosion of browser-based stories followed — many of them intimate, experimental, and deeply literary in ways the commercial paperback market never explored.`,
          `Choice of Games, founded in 2009, pioneered long-form commercial interactive fiction for digital platforms. Their ChoiceScript engine enabled novels of 200,000 words or more with branching paths tracking dozens of variables. Their games found an audience willing to pay for serious interactive storytelling on a par with commercial genre fiction.`,
          `Visual novels, long dominant in Japan, crossed into western gaming with titles like Hatoful Boyfriend, Doki Doki Literature Club, and Disco Elysium. These games demonstrated that choice-based storytelling could be a prestige art form, not just a novelty.`,
        ],
      },
      {
        heading: 'Where We Are Today',
        paragraphs: [
          `Interactive fiction today is more diverse than it has ever been. Mobile platforms have created new mass markets for short-form interactive stories. Netflix's Bandersnatch brought the format to a streaming audience. AI-assisted writing tools are beginning to explore truly adaptive narratives.`,
          `At the same time, there has been a return to fundamentals. Writers and readers who grew up with the original Choose Your Own Adventure books are now creating their own stories for the first time, using modern tools that put the structural complexity of the craft within reach of anyone with a story to tell.`,
          `The core insight that Packard had in 1969 — that readers will be more engaged if you ask them what happens next — remains as true as it ever was. What has changed is our ability to act on it.`,
        ],
      },
    ],
  },

  {
    slug: 'character-development-interactive-fiction',
    title: 'Character Development in Interactive Fiction: Creating Protagonists That Players Shape',
    description: `How to write interactive fiction characters that feel real — whether you are writing a blank-slate protagonist or a fully defined one — and how choices can build character across a story.`,
    publishedAt: '2026-01-08',
    readingMinutes: 7,
    category: 'Writing Tips',
    intro: `Writing characters for interactive fiction requires a different kind of thinking than writing characters for linear fiction. In a novel, you build a character by deciding who they are and showing it consistently. In interactive fiction, you are either constraining who the reader can be, or you are building a framework within which the reader builds themselves. Understanding that distinction is the foundation of good characterisation in the format.`,
    sections: [
      {
        heading: 'The Blank Slate vs. the Defined Protagonist',
        paragraphs: [
          `There are two fundamental approaches to the interactive fiction protagonist, and each has genuine strengths.`,
          `The blank slate protagonist — common in classic Choose Your Own Adventure and many modern games — gives the reader maximum identification. The "you" is undefined enough that almost any reader can project themselves onto it. This works best for plot-driven stories where the protagonist's personality matters less than the decisions they face.`,
          `The defined protagonist has an established history, relationships, and personality. The reader is playing as someone, not just as themselves. This creates stronger narrative coherence, richer supporting relationships, and more complex character arcs — but it also means the reader is directing a character rather than being one. Done well, the defined protagonist can be more emotionally engaging than the blank slate, because readers care about what happens to them as a person.`,
          `Many stories use a hybrid approach: a defined protagonist with an undefined core value or allegiance that the reader shapes through choices. This gives the story the advantages of both approaches.`,
        ],
      },
      {
        heading: 'Building Character Through Choice',
        paragraphs: [
          `In interactive fiction, character is revealed not through description but through decision. You do not tell the reader their protagonist is brave; you put the protagonist in a situation where bravery or its absence is required, and let the reader choose.`,
          `This creates a fascinating reversal of normal characterisation. In a novel, the author decides a character is brave, then writes them acting bravely. In interactive fiction, the reader decides to act bravely, and the story reflects that they have a brave protagonist.`,
          `The most powerful character-building choices are the small ones. Grand heroic decisions are expected. The choice to stop and help someone when you are already late, to tell an uncomfortable truth when a comfortable lie would serve equally well — these small moments accumulate into a more detailed portrait of character than any single dramatic choice.`,
        ],
      },
      {
        heading: 'Writing Supporting Characters That Remember',
        paragraphs: [
          `The protagonist's character is most visible in how other characters respond to them. A story where supporting characters are oblivious to what the protagonist has done feels mechanical; one where they remember and react creates the sense of a living world.`,
          `This is one of the most challenging technical aspects of interactive fiction writing. Tracking what happened in every path and writing conditional reactions requires planning. But even a small amount of this goes a long way. A character who mentions what the protagonist did in an earlier scene — even briefly — creates disproportionate immersion.`,
          `Focus your tracking on the decisions that mattered most to the supporting characters involved. If the reader helped a character in an earlier scene, that character should be noticeably warmer. If the reader lied to them, there should be a subtle distance. Readers will notice these callbacks, and they will interpret them as evidence that their choices had consequences that matter.`,
        ],
      },
      {
        heading: 'Character Stats as a Character System',
        paragraphs: [
          `For stories using attribute-based systems — like StoryQuestor's World Builder format — character stats are a character development system, not just a game mechanic. The attributes that change over the course of a story should map to the character's actual development.`,
          `If your story is about learning to trust, Trust should be an attribute that starts low and can be built through relationship choices. If it is about a character coming into their own strength, Confidence might begin at a moderate level and grow. Stats that reflect the thematic arc of the story feel organic; stats that feel like arbitrary numbers feel like spreadsheets.`,
          `Stat-gated scenes are most satisfying when they reflect something the protagonist has genuinely become. A high Empathy score unlocking a scene where the protagonist talks someone down is not a reward for grinding a stat — it is a moment where the protagonist's development makes them capable of something they could not have done at the start.`,
        ],
      },
      {
        heading: 'The Character the Reader Builds',
        paragraphs: [
          `At the end of a well-crafted interactive story, the reader has built a protagonist. They know this character — their values, their loyalties, their blind spots — because they made those choices themselves.`,
          `This is interactive fiction's singular gift to character writing. It produces something no novel can fully replicate: a protagonist that feels genuinely personal, because they are. The story belongs to the reader in a way that linear fiction never achieves.`,
          `As a writer, your job is to build the framework that makes that possible. Define the choices that reveal character. Track the consequences that make those choices feel real. And write the endings that reflect the person the reader has spent the story becoming.`,
        ],
      },
    ],
  },

  {
    slug: 'interactive-fiction-classroom',
    title: `Interactive Fiction in the Classroom: A Teacher's Guide`,
    description: `How educators are using choose-your-own-adventure style stories to boost reading engagement, build critical thinking, and teach creative writing across grade levels.`,
    publishedAt: '2026-02-14',
    readingMinutes: 7,
    category: 'Education',
    intro: `Interactive fiction has been finding its way into classrooms since the heyday of Choose Your Own Adventure paperbacks in the 1980s. Teachers discovered early that the format could reach reluctant readers in ways that traditional novels sometimes could not. Today, digital tools have expanded the possibilities dramatically — students can not only read branching stories but create them, engaging with narrative structure, character, and consequence in an active rather than passive way.`,
    sections: [
      {
        heading: 'Why Interactive Fiction Works in Education',
        paragraphs: [
          `The case for interactive fiction in education starts with engagement. Study after study on reluctant readers shows that agency and consequence are key motivators. When students feel responsible for what happens to characters — when they are directing the story rather than following it — they read more carefully, retain more, and want to continue.`,
          `Beyond engagement, the format builds critical thinking. Reading a branching story requires holding multiple possibilities in mind, evaluating the likely consequences of different choices, and revising assumptions when outcomes are surprising. These are the same cognitive skills taught in structured reasoning exercises, but embedded in a narrative that makes them feel purposeful.`,
          `For writing instruction, interactive fiction is particularly valuable because it makes story structure visible. When students write a branching story, they have to plan their narrative as a system — they cannot simply write forward and hope the story makes sense. They learn about scene, consequence, and character motivation through the practical necessity of making the branches work.`,
        ],
      },
      {
        heading: 'Reading Interactive Fiction: Discussion Strategies',
        paragraphs: [
          `When students read the same interactive story in class, they often reach different endings — which creates natural discussion material that single-path texts cannot provide. "Why did you make that choice?" and "What did you think would happen?" open conversations about inference, prediction, and the author's craft.`,
          `Comparative discussion is particularly effective. Two students who made different choices at the same fork in the story can compare their paths: what was similar, what was different, what changed? This creates a conversation about cause and consequence that is far more concrete than abstract discussions of what the author meant.`,
          `Historical interactive fiction also works well for curriculum integration. Stories set in specific historical periods that ask readers to make the kinds of choices historical figures faced create empathy and historical thinking simultaneously.`,
        ],
        list: [
          { item: 'Compare paths', detail: `Have students compare the paths they took and discuss why they made different choices at the same decision point.` },
          { item: 'Predict and reflect', detail: `Before revealing the next scene, ask students to predict consequences. Discuss why predictions were right or wrong.` },
          { item: 'Author intent', detail: `Ask what the author was trying to say by including each choice. What does it reveal about characters or themes?` },
          { item: 'Replay with purpose', detail: `Have students replay a section making opposite choices and compare the experiences.` },
        ],
      },
      {
        heading: 'Writing Interactive Fiction: Classroom Projects',
        paragraphs: [
          `Writing a branching story is a sophisticated project that builds skills across narrative writing, planning, and structural thinking. It works best as a multi-week project with scaffolded stages.`,
          `Start with the premise and protagonist: who is the protagonist, what do they want, and what stands in their way? This is the same as any story assignment, but with the added instruction that the tension should be the kind that generates genuine choices.`,
          `Next, have students plan their story structure before writing any prose. A simple outline showing the major decision points and their consequences is enough at this stage. For younger students, a physical flowchart on paper works well. For older students, a digital node editor makes the structure more legible.`,
          `Peer review in branching story writing is unusually effective because reviewers play the story, not just read it. A peer who plays through one path and reports back gives different, more specific feedback than a reader of a linear text.`,
        ],
      },
      {
        heading: 'Grade-Level Adaptations',
        paragraphs: [
          `Interactive fiction can be adapted for almost any grade level with appropriate adjustments to complexity.`,
        ],
        list: [
          { item: 'Elementary (K-5)', detail: `Simple 2-choice stories with 4-6 endings. Focus on cause and consequence. Keep choices concrete and character-centered. Oral storytelling with branching works well before written work.` },
          { item: 'Middle school (6-8)', detail: `Stories with more branches, supporting characters who react to choices, and themes appropriate to the age group. Good for exploring social situations, historical scenarios, and ethical dilemmas in a safe fictional context.` },
          { item: 'High school (9-12)', detail: `Long-form projects with sophisticated themes. Students can explore unreliable narrators, ambiguous morality, and complex character psychology. The format suits AP English and creative writing electives especially well.` },
          { item: 'College and adult', detail: `Professional-grade projects exploring voice, structure, and the relationship between choice and meaning in narrative. Good for creative writing programs and game design courses.` },
        ],
      },
      {
        heading: 'Getting Started with StoryQuestor',
        paragraphs: [
          `StoryQuestor's organizational accounts are designed with classrooms in mind. Teachers can set up a class group, invite students, and see the stories they have created in one place. The visual node editor makes story structure explicit and legible in ways that help both the writer and the instructor understand what has been planned.`,
          `The public Explore section gives students published stories to read for inspiration and discussion. The demo allows students to try the reader experience before beginning their own work.`,
          `For teachers interested in the history of the format, the resource pages on this site cover the origins of choose-your-own-adventure books and the development of the form — context that enriches both reading and writing work in the classroom.`,
        ],
      },
    ],
  },

  {
    slug: 'writing-multiple-endings',
    title: 'Writing Multiple Endings That Feel Earned, Not Arbitrary',
    description: `How to write story endings that satisfy readers regardless of which path they took — and avoid the common pitfalls that make branching endings feel like punishment or afterthought.`,
    publishedAt: '2026-03-01',
    readingMinutes: 6,
    category: 'Writing Tips',
    intro: `Endings are the hardest part of any story. In interactive fiction, they are harder still: you might need to write four, eight, or twelve of them, and each one must feel like a genuine conclusion to the specific journey the reader took. Too many branching stories treat most endings as bad endings — failed paths that exist to punish wrong choices. This approach misunderstands both the format and the reader. Here is how to think about endings in branching fiction, and how to write them well.`,
    sections: [
      {
        heading: `Rethink "Good" and "Bad" Endings`,
        paragraphs: [
          `The instinct to create a single "best" ending and treat all others as lesser outcomes is borrowed from games, where optimization is expected. In story-driven interactive fiction, it is a mistake.`,
          `When readers reach an ending that feels like punishment for a "wrong" choice, they do not feel like they played the story badly — they feel like they were tricked. The author promised agency and then revealed that only one path was real. The result is resentment, not engagement.`,
          `Instead, think of your endings as different thematic resolutions to the same underlying tension. A story about loyalty might end with the protagonist sacrificing everything for someone they love, or with them learning that loyalty has limits, or with the discovery that the person they were loyal to did not deserve it. All three can be satisfying endings to the same story.`,
        ],
      },
      {
        heading: 'Each Ending Should Reflect the Path Taken',
        paragraphs: [
          `The most powerful branching endings are ones that acknowledge the specific journey the reader took to reach them. Not just thematically — literally. A callback to a choice made early in the story, a consequence that only makes sense given what the reader did, a relationship that reflects how the reader treated someone twenty scenes ago.`,
          `This is technically demanding. You have to track what happened on each path and write ending text that responds to it. But even a single callback — one line that says "she remembered what you told her in the market, and it changed how she looked at you now" — creates a sense of personal significance that no linear text can replicate.`,
          `Readers who feel that their specific ending is genuinely theirs — not the same as everyone else's — are much more likely to share the story, replay it, and recommend it.`,
        ],
      },
      {
        heading: 'The Bittersweet Ending and Why It Works',
        paragraphs: [
          `The most satisfying endings in interactive fiction are often bittersweet rather than triumphant. This is partly because unambiguous happy endings are harder to earn when readers have made different choices on different paths, and partly because the format naturally generates irony: you can always see, at a bittersweet ending, the choice that led here.`,
          `A character who got what they wanted but lost something important in getting it. A victory that changes the protagonist in ways they had not anticipated. A relationship restored but changed. These resolutions feel truthful in a way that unconditional happy endings rarely do, and they give the reader something to think about after the story ends.`,
          `Bittersweet endings also respect multiple interpretations. A reader who consistently made cautious choices and a reader who took every risk may both reach a bittersweet ending, but experience it differently — one as the consequence of timidity, one as the consequence of boldness.`,
        ],
      },
      {
        heading: 'Structural Approaches to Multiple Endings',
        paragraphs: [
          `There are several structural approaches to managing multiple endings without writing an unworkable amount of content.`,
        ],
        list: [
          { item: 'Thematic variations', detail: `Write the same basic ending event but vary the emotional register based on the path taken. The protagonist leaves the city in all versions; how they leave and what they feel changes.` },
          { item: 'Outcome variables', detail: `Define two or three binary outcomes and write endings for each combination. Small variables can create a large number of distinct but manageable endings.` },
          { item: 'True convergence', detail: `All paths lead to the same final scene, but the reader's journey gives that scene different meaning. The protagonist stands in the same place, but what they know and feel depends on what they did to get there.` },
          { item: 'Branching final acts', detail: `All paths converge at a penultimate moment, and the final choice happens there — giving every reader the same decision with different stakes depending on what came before.` },
        ],
      },
      {
        heading: 'Writing the Last Line',
        paragraphs: [
          `The last line of an interactive story is the moment when it becomes fully the reader's. If the rest of the story has been well-crafted, this moment carries everything that came before it.`,
          `The best last lines in interactive fiction are resonant without being sentimental, and specific without being narrow. They close the story but leave the reader with something — an image, a question, a feeling that stays. They often connect back to an image or idea from the beginning, creating a sense of completion.`,
          `Do not rush the ending. Interactive fiction writers often spend so much energy on choices and branches that the endings themselves are underdeveloped. Give each ending the same care you would give the ending of a short story. It is the last thing the reader experiences, and it is what they will remember.`,
        ],
      },
    ],
  },

  {
    slug: 'story-pacing-branching-narratives',
    title: 'Pacing Branching Stories: How to Control Tension Across Multiple Paths',
    description: `How to maintain narrative momentum in an interactive story when readers can move through your content in different orders at different speeds.`,
    publishedAt: '2026-04-10',
    readingMinutes: 6,
    category: 'Writing Tips',
    intro: `Pacing is one of the hardest elements of craft to master in any fiction — and in branching narratives, it becomes genuinely difficult. You are not controlling a single reader's experience; you are managing the experience of every reader, each of whom might move through your story in a different order. A scene that creates perfect tension in one path might feel disconnected in another. This guide covers the principles of pacing in interactive fiction and practical techniques for applying them.`,
    sections: [
      {
        heading: 'What Pacing Really Is',
        paragraphs: [
          `Pacing is the management of the reader's attention and emotional energy over time. A well-paced story alternates tension with release, action with reflection, urgency with space. It knows when to push and when to breathe.`,
          `In linear fiction, pacing is managed through the ordering of scenes. The author decides what comes before and after what, and the reader follows. In interactive fiction, the reader partially controls their route through the story, and the author cannot guarantee what they have experienced before reaching any given scene.`,
          `This is the central pacing challenge of branching narratives: each scene needs to work independently and as part of multiple possible sequences. A scene that relies on tension built in a scene the reader might not have taken will fall flat on some paths.`,
        ],
      },
      {
        heading: 'Designing for Local and Global Pacing',
        paragraphs: [
          `Think about pacing at two levels: local and global.`,
          `Local pacing is the rhythm within a single scene — sentence length, the density of action, the amount of interiority versus dialogue. This you control completely, and the same principles apply as in linear fiction. Short sentences accelerate; long ones slow down. Action compresses time; reflection expands it.`,
          `Global pacing is the rhythm across the whole story — where the peaks of tension are, how much rest the reader gets between major events. This is where branching fiction requires different thinking. You cannot guarantee the order of scenes, so you need to build tension locally within each path and design convergence points that always feel like escalation.`,
        ],
      },
      {
        heading: 'Convergence Points as Pacing Anchors',
        paragraphs: [
          `The solution to global pacing in branching stories is convergence. When multiple paths merge at a single scene, that scene becomes an anchor: a fixed point in the story's rhythm that every reader reaches, regardless of their path.`,
          `Design your convergence points to function as escalations. If two paths converge at a confrontation scene, that scene should feel like a peak of tension for any reader who arrives there — whether they took the cautious path or the bold one. The details of how they got there will differ, but the emotional state they arrive in should be similar.`,
          `Think of convergence points as the chapters of your story. Within each chapter, paths may diverge and explore different material. But the chapter endings — the convergences — are where you establish and maintain the global tension curve.`,
        ],
      },
      {
        heading: 'Managing Scene Length',
        paragraphs: [
          `Scene length has a direct effect on pacing. Long scenes slow the story down; short ones accelerate it. In interactive fiction, scene length also affects how long the reader goes without a decision — and without decisions, the interactive element disappears.`,
          `A general guideline is that readers should encounter a meaningful choice approximately every 300-500 words of prose. This is not a rule — some scenes work better as undivided narrative — but it is a useful calibration. If you are writing 1000 words before the first choice in a scene, consider whether there is a natural earlier decision point.`,
          `Varying scene length is as important as varying the type of choices. A sequence of five short, punchy scenes with quick choices creates very different energy from three long, immersive scenes. Use both, and be intentional about when you use each.`,
        ],
      },
      {
        heading: 'Cliffhangers in Branching Fiction',
        paragraphs: [
          `Cliffhangers — scenes that end at a moment of high tension and force the reader to continue — are as effective in branching fiction as in linear fiction. The challenge is that in interactive fiction, the "next" scene is often a choice rather than a continuation.`,
          `The most effective approach is to make the choice itself the continuation of the tension. Rather than resolving the cliffhanger before presenting the choice, present the choice at the peak of tension: "The guard rounds the corner. Do you run or freeze?" The decision is the cliffhanger's resolution, and the scene that follows shows the consequence.`,
          `This technique has two advantages. First, it maintains tension through the choice moment rather than deflating it. Second, it makes the choice feel urgent and visceral, because the reader is making it while the tension is still at its peak.`,
        ],
      },
    ],
  },
]
