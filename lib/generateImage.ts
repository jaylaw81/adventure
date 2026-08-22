import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY!)

const audienceConfig: Record<string, { suffix: string; negativePrompt: string }> = {
  all: {
    suffix: ', family-friendly, wholesome, safe for children, colorful storybook style',
    negativePrompt: 'violence, gore, nudity, sexual content, adult themes',
  },
  teens: {
    suffix: ', appropriate for teenagers, no explicit content',
    negativePrompt: 'nudity, sexual content, graphic violence, gore',
  },
  adults: {
    suffix: ', adults only, mature themes, all characters are adults',
    negativePrompt: 'children, child, kids, kid, boy, girl, baby, infant, toddler, minor, underage, young, juvenile, teen, adolescent, youth',
  },
}

export async function generateCharacterAvatar(
  name: string,
  description: string | null,
  characterType: 'hero' | 'foe',
  audience: string = 'all'
): Promise<string> {
  const config = audienceConfig[audience] ?? audienceConfig.all
  const desc = description?.trim().slice(0, 120) || ''
  const prompt = characterType === 'foe'
    ? `villain portrait, ${name}, ${desc}, menacing fantasy antagonist, dramatic lighting, detailed face and upper body, dark atmosphere, professional fantasy character art${config.suffix}`
    : `character portrait, ${name}, ${desc}, RPG hero, fantasy adventure, soft dramatic lighting, detailed face and upper body, professional character illustration${config.suffix}`

  const result = await hf.textToImage({
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    inputs: prompt,
    parameters: { width: 1024, height: 1024, negative_prompt: config.negativePrompt },
  })

  const arrayBuf = await (result as unknown as Blob).arrayBuffer()
  const buffer = Buffer.from(arrayBuf)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

export async function generateSceneImage(
  title: string,
  content: string,
  audience: string = 'all',
  dimensions: { width: number; height: number } = { width: 1024, height: 576 }
): Promise<string> {
  const text = `${title} ${content}`.trim().slice(0, 200)
  const config = audienceConfig[audience] ?? audienceConfig.all
  const prompt = `cinematic illustration, vivid colors, highly detailed: ${text}${config.suffix}`

  const result = await hf.textToImage({
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    inputs: prompt,
    parameters: { ...dimensions, negative_prompt: config.negativePrompt },
  })

  const arrayBuf = await (result as unknown as Blob).arrayBuffer()
  const buffer = Buffer.from(arrayBuf)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

// Storybook page illustrations: square, so they read well in either the
// left or right half of a page spread.
export async function generateStorybookPageImage(
  title: string,
  content: string,
  audience: string = 'all'
): Promise<string> {
  return generateSceneImage(title, content, audience, { width: 1024, height: 1024 })
}

// Storybook cover art: portrait, book-cover proportions.
export async function generateStorybookCoverImage(
  title: string,
  description: string,
  audience: string = 'all'
): Promise<string> {
  const text = `${title} ${description}`.trim().slice(0, 200)
  const config = audienceConfig[audience] ?? audienceConfig.all
  const prompt = `book cover art, ${text}, elegant illustrated cover, title composition, painterly, professional book cover design${config.suffix}`

  const result = await hf.textToImage({
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    inputs: prompt,
    parameters: { width: 768, height: 1024, negative_prompt: config.negativePrompt },
  })

  const arrayBuf = await (result as unknown as Blob).arrayBuffer()
  const buffer = Buffer.from(arrayBuf)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}
