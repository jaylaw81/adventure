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

export async function generateSceneImage(
  title: string,
  content: string,
  audience: string = 'all'
): Promise<string> {
  const text = `${title} ${content}`.trim().slice(0, 200)
  const config = audienceConfig[audience] ?? audienceConfig.all
  const prompt = `cinematic illustration, vivid colors, highly detailed: ${text}${config.suffix}`

  const result = await hf.textToImage({
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    inputs: prompt,
    parameters: { width: 1024, height: 576, negative_prompt: config.negativePrompt },
  })

  const arrayBuf = await (result as unknown as Blob).arrayBuffer()
  const buffer = Buffer.from(arrayBuf)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}
