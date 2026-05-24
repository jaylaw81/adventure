export type QuestionType = 'stars' | 'nps' | 'multiple_choice' | 'yes_no_maybe' | 'text'

export interface SurveyQuestion {
  key: string
  text: string
  type: QuestionType
  options?: string[]
  required: boolean
  helper?: string
}

export interface SurveyDef {
  slug: string
  title: string
  intro: string
  questions: SurveyQuestion[]
  surveyKind: 'quantitative' | 'qualitative'
  minDaysBetweenShows: number
  dismissCooldownDays: number
}

export const SURVEYS: SurveyDef[] = [
  {
    slug: 'happiness',
    title: 'How are we doing?',
    intro: 'Your answers directly shape what we build next — this takes about 60 seconds and genuinely helps.',
    surveyKind: 'qualitative',
    minDaysBetweenShows: 30,
    dismissCooldownDays: 7,
    questions: [
      {
        key: 'overall_rating',
        text: 'How happy are you with StoryQuestor overall?',
        type: 'stars',
        required: true,
      },
      {
        key: 'likes',
        text: "What's working well for you?",
        type: 'text',
        required: false,
        helper: 'Canvas editor, sharing, story structure…',
      },
      {
        key: 'improvements',
        text: 'What could be better or feels frustrating?',
        type: 'text',
        required: false,
        helper: 'Navigation, missing features, confusing parts…',
      },
    ],
  },
  {
    slug: 'willingness_to_pay',
    title: 'A quick question about value',
    intro: "We're thinking about optional premium features. Your honest input helps us make the right call — and makes sure we never charge for what should stay free.",
    surveyKind: 'quantitative',
    minDaysBetweenShows: 60,
    dismissCooldownDays: 14,
    questions: [
      {
        key: 'would_pay',
        text: 'Would you pay for premium features on StoryQuestor?',
        type: 'yes_no_maybe',
        required: true,
      },
      {
        key: 'price_range',
        text: 'What monthly price would feel right for a premium plan?',
        type: 'multiple_choice',
        options: ['Under $5/mo', '$5–$10/mo', '$10–$20/mo', 'Over $20/mo', "I wouldn't pay"],
        required: false,
      },
      {
        key: 'premium_features',
        text: 'What would make it worth paying for?',
        type: 'text',
        required: false,
        helper: 'AI credits, collaboration, custom domains, reader analytics…',
      },
    ],
  },
  {
    slug: 'feature_request',
    title: 'Help us prioritize',
    intro: 'We have more ideas than time. Your picks decide what gets built — responses like yours are the single biggest input into our roadmap.',
    surveyKind: 'quantitative',
    minDaysBetweenShows: 45,
    dismissCooldownDays: 10,
    questions: [
      {
        key: 'top_feature',
        text: 'Which feature would you most like us to add next?',
        type: 'multiple_choice',
        options: [
          'Collaboration / co-authoring',
          'Mobile app',
          'Audio narration',
          'More AI image styles',
          'Export to PDF / offline reading',
          'Reader analytics (plays, paths, completion)',
        ],
        required: true,
      },
      {
        key: 'recommend_likelihood',
        text: 'How likely are you to recommend StoryQuestor to a friend?',
        type: 'nps',
        required: false,
      },
      {
        key: 'other_ideas',
        text: 'Any other features or ideas you wish we had?',
        type: 'text',
        required: false,
        helper: 'The weirder the idea, the better…',
      },
    ],
  },
]

export function getSurvey(slug: string): SurveyDef | undefined {
  return SURVEYS.find(s => s.slug === slug)
}
