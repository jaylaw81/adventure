// Per-genre intro copy for /explore/[tag] category pages. Keyed by the exact
// STORY_TAGS spelling. Genuinely varied per tag so these pages don't read as
// duplicate template content to search engines.
const TAG_INTROS: Record<string, string> = {
  Adventure: 'Set out on a journey where every fork in the road is yours to choose. These adventure stories put you in charge of the quest, the risks, and the way it ends.',
  Comedy: "Interactive fiction doesn't have to take itself seriously. These comedy stories are built for laughs — pick the wrong choice on purpose and see where the chaos leads.",
  Crime: 'Step into the case. These crime stories hand you the clues and the consequences — follow the evidence, cut corners, or cross a line you can\'t walk back.',
  Drama: 'Character-driven stories where the stakes are personal. Every choice in these drama stories shapes a relationship, a secret, or a life.',
  Dystopian: 'Broken worlds, hard choices. These dystopian stories drop you into a society gone wrong and let your decisions decide whether you survive it — or become part of the problem.',
  'Fairy Tale': 'Familiar tales, rewritten around your choices. These fairy tale stories let you steer the fable — happily ever after is never guaranteed.',
  Fantasy: 'Magic, myth, and worlds beyond this one. These fantasy stories let you wield the sword, cast the spell, or strike the bargain — the outcome is entirely up to you.',
  Historical: 'Live through moments the history books only summarize. These historical stories put you inside real eras and events, choice by choice.',
  Horror: "Dread you can steer into — or away from. These horror stories put every survival decision in your hands, and not every choice leads out alive.",
  Mystery: 'Piece together the truth one decision at a time. These mystery stories reward sharp choices — follow the wrong lead and the case slips away.',
  'Non-Fiction': 'Interactive stories grounded in real subjects and real stakes. Explore true topics through choices that shape how the story unfolds.',
  'Post-Apocalyptic': 'The world already ended — now what? These post-apocalyptic stories test what you\'ll do to survive when the rules are gone.',
  Romance: 'Every conversation is a choice, and every choice changes the relationship. These romance stories let you write the chemistry yourself.',
  'Sci-Fi': 'Future worlds, impossible tech, and choices with real consequences. These sci-fi stories let you decide how humanity — or you — gets through it.',
  Steampunk: 'Gears, airships, and alternate history. These steampunk stories let you navigate an industrial world built on invention and your own choices.',
  Supernatural: 'Something is out there, and your choices decide how close you get. These supernatural stories blend the everyday with the unexplainable.',
  Thriller: 'No time to think — only to choose. These thriller stories move fast, and every decision either buys you time or runs it out.',
  Western: 'Dust, standoffs, and hard choices under an open sky. These western stories put the draw, the deal, and the getaway entirely in your hands.',
}

/** Genre intro paragraph for a tag's category page. Falls back to a generic line for freeform/legacy tags. */
export function getTagIntro(tag: string): string {
  return TAG_INTROS[tag]
    ?? `Browse free ${tag.toLowerCase()} interactive stories from the StoryQuestor community. Every story branches — the choices you make decide how it ends.`
}

export interface TagFaqItem {
  question: string
  answer: string
}

/** Short, genuinely useful FAQ for a tag's category page — also rendered as FAQPage structured data. */
export function getTagFaq(tag: string): TagFaqItem[] {
  const lower = tag.toLowerCase()
  return [
    {
      question: `What are ${lower} interactive stories?`,
      answer: `${tag} interactive stories are branching choose-your-own-adventure fiction — instead of reading a fixed plot, you make choices at key moments that change what happens next and how the story ends.`,
    },
    {
      question: `Are these ${lower} stories free to read?`,
      answer: `Yes. Every public story on StoryQuestor, including all ${lower} stories, is free to read with no account required.`,
    },
    {
      question: `Can I write my own ${lower} story?`,
      answer: `Yes — StoryQuestor's story editor lets you write and publish your own branching ${lower} story, complete with multiple endings and reader choices.`,
    },
  ]
}
