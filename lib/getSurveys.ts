import { db } from './db'
import { surveyConfigs } from './schema'
import { SURVEYS, type SurveyDef } from './surveys'

export async function getSurveys(): Promise<SurveyDef[]> {
  try {
    const configs = await db.select().from(surveyConfigs)
    const hardcodedSlugs = new Set(SURVEYS.map(s => s.slug))

    // Hardcoded surveys merged with any DB overrides
    const merged = SURVEYS.map(survey => {
      const override = configs.find(c => c.slug === survey.slug)
      if (!override) return survey
      return {
        slug: override.slug,
        title: override.title,
        intro: override.intro,
        surveyKind: override.surveyKind as SurveyDef['surveyKind'],
        minDaysBetweenShows: override.minDaysBetweenShows,
        dismissCooldownDays: override.dismissCooldownDays,
        questions: override.questions,
        active: override.active,
      }
    })

    // DB-only surveys (created via the editor, not in the hardcoded list)
    const dbOnly: SurveyDef[] = configs
      .filter(c => !hardcodedSlugs.has(c.slug))
      .map(c => ({
        slug: c.slug,
        title: c.title,
        intro: c.intro,
        surveyKind: c.surveyKind as SurveyDef['surveyKind'],
        minDaysBetweenShows: c.minDaysBetweenShows,
        dismissCooldownDays: c.dismissCooldownDays,
        questions: c.questions,
        active: c.active,
      }))

    return [...merged, ...dbOnly]
  } catch {
    return SURVEYS
  }
}
