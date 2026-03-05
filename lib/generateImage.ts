import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY!)

export async function generateSceneImage(title: string, content: string): Promise<string> {
  const text = `${title} ${content}`.trim().slice(0, 200)
  const prompt = `cinematic storybook illustration, vivid colors, highly detailed: ${text}`

  const result = await hf.textToImage({
    model: 'stabilityai/stable-diffusion-xl-base-1.0',
    inputs: prompt,
    parameters: { width: 1024, height: 576 },
  })

  const arrayBuf = await (result as unknown as Blob).arrayBuffer()
  const buffer = Buffer.from(arrayBuf)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}
