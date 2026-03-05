import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Plus, GitBranch, Share2, Sparkles, Play,
  MousePointerClick, BookOpen, ChevronRight,
  Settings, CheckCircle2, Pencil,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'How to Use StoryQuestor | Guide',
  description: 'Learn how to create branching interactive stories and how to play them on StoryQuestor.',
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center mt-0.5">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <div className="text-gray-600 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
      <span className="font-semibold">Tip:</span> {children}
    </div>
  )
}

export default function HowToPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <BookOpen size={14} />
          User Guide
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">How to Use StoryQuestor</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Everything you need to know to create your own branching stories and play through stories made by others.
        </p>
      </div>

      <div className="flex flex-col gap-8">

        {/* Creating Stories */}
        <Section icon={<Pencil size={20} />} title="Creating a Story">
          <Step number={1} title="Create a new story">
            Sign in, then click <strong>New Story</strong> on the home page. Give your story a title and an optional description — you can always change these later in settings.
          </Step>

          <Step number={2} title="Set your story's audience and tags">
            Click the <strong>Settings</strong> button in the editor toolbar to set:
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li><strong>Audience</strong> — All Ages, Teens, or Adults Only. This affects how AI images are generated for your scenes.</li>
              <li><strong>Tags</strong> — Keywords that describe your story (e.g. fantasy, mystery, romance). Press Enter after each tag.</li>
            </ul>
          </Step>

          <Step number={3} title="Add scenes to the canvas">
            Click <strong>Add Scene</strong> in the toolbar. A new scene card appears in the centre of your canvas. Click any scene card to open the editor panel on the right, where you can:
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Set the <strong>Scene Type</strong> — Start (where readers begin), Scene (a regular story moment), or Ending (a final outcome).</li>
              <li>Write a <strong>Title</strong> and <strong>Content</strong> for the scene.</li>
              <li>Mark the scene as <strong>Completed</strong> when you're done writing it.</li>
            </ul>
            <Tip>Every story needs exactly one <strong>Start</strong> scene and at least one <strong>Ending</strong> scene.</Tip>
          </Step>

          <Step number={4} title="Connect scenes with choices">
            Hover over a scene card — you'll see small connection handles appear on the edges. Drag from a handle on one scene to another scene to create a choice. A prompt will ask you to name the choice (e.g. "Go left" or "Open the door"). You can double-click the choice label later to rename it, or click it once to reveal a delete button.
            <Tip>Readers see choices in the order they were created. You can have up to three choices before the emoji indicators run out.</Tip>
          </Step>

          <Step number={5} title="Generate AI scene images">
            Open a completed scene in the editor panel and click <strong>Generate Image with AI</strong>. StoryQuestor will create a cinematic illustration based on your scene's title and content. You can regenerate up to two times per scene. Images are also generated automatically when you mark a scene as Completed.
          </Step>

          <Step number={6} title="Share your story">
            Back on the home page, click the <strong>Share</strong> button on your story card. This generates a unique public link you can send to anyone. Toggle it off at any time to make it private again. Enable sharing to also list your story on the <Link href="/explore" className="text-amber-600 hover:underline">Explore</Link> page.
          </Step>
        </Section>

        {/* Playing Stories */}
        <Section icon={<Play size={20} />} title="Playing a Story">
          <Step number={1} title="Find a story to play">
            Browse the <Link href="/explore" className="text-amber-600 hover:underline">Explore</Link> page to discover stories shared by creators. Click <strong>Play</strong> on any story card to open its landing page, then click <strong>Start Playing</strong>.
            <p className="mt-2">If someone shared a direct link with you, just open it — it will take you straight into the story.</p>
          </Step>

          <Step number={2} title="Read each scene">
            Each scene shows a title, illustrated image (if one was generated), and the story prose. Read through it to understand what's happening in the story before making a decision.
          </Step>

          <Step number={3} title="Make your choice">
            At the bottom of every scene you'll see up to three choice buttons. Each choice is marked with an emoji:
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>❤️ First choice</li>
              <li>😘 Second choice</li>
              <li>🔥 Third choice</li>
            </ul>
            Click a choice to move to the next scene. Your decisions shape which path through the story you experience.
          </Step>

          <Step number={4} title="Navigate and go back">
            Use the <strong>Back</strong> button in the top-left corner to undo your last choice and try a different path. Use <strong>Home</strong> to return to the main page at any time.
          </Step>

          <Step number={5} title="Reach an ending">
            When you arrive at an Ending scene, the story concludes with <em>— The End —</em>. Click <strong>Play Again</strong> to restart from the beginning and discover different outcomes — every story can have multiple endings depending on the choices you make.
          </Step>

          <Step number={6} title="Copy a scene for sharing">
            Each scene has a <strong>Copy for SMS</strong> button in the top-right. This copies the scene content and all available choices to your clipboard, formatted so you can paste it directly into a text message or chat.
          </Step>
        </Section>

        {/* Tips */}
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-amber-500" />
            Quick Tips
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2"><ChevronRight size={15} className="text-amber-400 shrink-0 mt-0.5" />Every story must have a <strong>Start</strong> scene or readers won't be able to begin.</li>
            <li className="flex items-start gap-2"><ChevronRight size={15} className="text-amber-400 shrink-0 mt-0.5" />Scenes marked as <strong>Completed</strong> are highlighted red on the canvas — blue means still in progress.</li>
            <li className="flex items-start gap-2"><ChevronRight size={15} className="text-amber-400 shrink-0 mt-0.5" />You can rearrange scenes freely by dragging them around the canvas. Positions are saved automatically.</li>
            <li className="flex items-start gap-2"><ChevronRight size={15} className="text-amber-400 shrink-0 mt-0.5" />The home page shows how many distinct <strong>endings are reachable</strong> — this counts all unique paths through your story.</li>
            <li className="flex items-start gap-2"><ChevronRight size={15} className="text-amber-400 shrink-0 mt-0.5" />AI images respect your audience setting — Adults Only stories will never generate images with minors.</li>
            <li className="flex items-start gap-2"><ChevronRight size={15} className="text-amber-400 shrink-0 mt-0.5" />You can delete a scene by opening it in the editor panel and clicking the trash icon — all connected choices are removed too.</li>
          </ul>
        </section>

        <div className="text-center py-6">
          <p className="text-gray-500 mb-5">Ready to start your first story?</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors">
              <Plus size={16} />
              Create a Story
            </Link>
            <Link href="/explore" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors">
              <Play size={16} />
              Browse Stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
