<script setup lang="ts">
import { useRouter } from 'vue-router'
import Badge from '../components/ui/badge/Badge.vue'
import Button from '../components/ui/button/Button.vue'
import Card from '../components/ui/card/Card.vue'
import CardContent from '../components/ui/card/CardContent.vue'
import CardHeader from '../components/ui/card/CardHeader.vue'
import CardTitle from '../components/ui/card/CardTitle.vue'
import Separator from '../components/ui/separator/Separator.vue'

const features = [
  { title: 'Authentication', desc: 'Password plus Google sign-in, rotating sessions, and guarded routes.' },
  { title: 'Task Management', desc: 'Posting, editing, search, filters, cancel, and delete with state guards.' },
  { title: 'Proposal Flow', desc: 'Bids with ratings, in-place editing, withdrawal, and owner assignment.' },
  { title: 'Assignment Logic', desc: 'Owners assign from proposals through controlled lifecycle actions.' },
  { title: 'Submission + Completion', desc: 'Taskers submit, owners confirm, and both sides stay in sync live.' },
  { title: 'Review System', desc: 'One rating and comment per completed task, averaged transactionally.' },
  { title: 'Realtime Updates', desc: 'Server-sent events drive toasts, feed pills, and detail refreshes.' },
  { title: 'Validation', desc: 'Zod schemas on both ends with machine codes and field-level errors.' },
]

const techHighlights = [
  'Models real business rules instead of only basic CRUD.',
  'Keyset pagination keeps feeds stable across sorts and filters.',
  'Guarded state transitions make concurrency safe on the backend.',
  'SSE pushes notifications with polling fallback when streams drop.',
  'Served OpenAPI spec tracks the implementation.',
]

const futureItems = [
  'Direct chat between task owners and taskers.',
  'Payment escrow on assignment.',
  'Admin dispute flow for contested tasks.',
  'Task expiration reminders.',
]

const techStack = ['Vue 3', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn-vue', 'Reka UI', 'Lucide', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Zod', 'SSE']

const router = useRouter()

const githubLink = "https://github.com/alexander213213/task-front"

function goToApp() {
  router.push("/auth/login")
}

function openGithub() {
  window.open(githubLink, "_blank")
}
</script>

<template>
  <div class="min-h-screen w-full bg-background text-foreground">
    <section class="border-b px-6 pb-14 pt-10 md:px-12">
      <div class="mb-9 flex items-center gap-4">
        <Badge variant="outline">Portfolio Demo</Badge>
        <Separator class="flex-1" />
      </div>

      <div class="grid gap-12 lg:grid-cols-2">
        <div class="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h1 class="mb-4 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Task marketplace demo
            <span class="block text-primary">built to showcase full-stack workflow</span>
          </h1>
          <p class="mb-3 max-w-[560px] leading-8 text-muted-foreground">
            This project demonstrates the lifecycle of a task marketplace: posting,
            proposals, assignment, submission, completion, reviews, and live updates
            pushed over server-sent events.
          </p>
          <div class="mt-8 flex gap-3">
            <Button @click="goToApp">Explore Demo</Button>
            <Button variant="outline" @click="openGithub">View Source</Button>
          </div>
        </div>

        <div class="grid content-start gap-5">
          <div class="flex items-stretch rounded-lg border bg-card">
            <div class="flex-1 px-5 py-4">
              <p class="text-xs text-muted-foreground">core states</p>
              <p class="font-semibold uppercase tracking-wide">4</p>
            </div>
            <Separator orientation="vertical" />
            <div class="flex-1 px-5 py-4">
              <p class="text-xs text-muted-foreground">updates</p>
              <p class="font-semibold uppercase tracking-wide">live</p>
            </div>
            <Separator orientation="vertical" />
            <div class="flex-1 px-5 py-4">
              <p class="text-xs text-muted-foreground">scope</p>
              <p class="font-semibold uppercase tracking-wide">demo</p>
            </div>
          </div>

          <div class="rounded-lg border bg-card">
            <div class="flex items-center gap-2 border-b px-4 py-3">
              <span class="h-2 w-2 rounded-full bg-muted-foreground/70" />
              <span class="h-2 w-2 rounded-full bg-muted-foreground/70" />
              <span class="h-2 w-2 rounded-full bg-muted-foreground/70" />
              <span class="ml-2 font-mono text-xs text-muted-foreground">task-marketplace / lifecycle</span>
            </div>
            <div class="grid gap-4 p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-widest text-primary">Lifecycle</p>
                  <h3 class="mt-1 text-lg font-semibold">Core task flow</h3>
                </div>
                <Badge variant="outline">Demo</Badge>
              </div>
              <div class="flex flex-wrap items-center justify-center gap-2">
                <span class="border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">OPEN</span>
                <span class="text-muted-foreground">→</span>
                <span class="border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">ASSIGNED</span>
                <span class="text-muted-foreground">→</span>
                <span class="border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">SUBMITTED</span>
                <span class="text-muted-foreground">→</span>
                <span class="border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">COMPLETED</span>
              </div>
              <p class="text-sm leading-7 text-muted-foreground">
                Valid transitions are enforced on both ends: assignment needs a
                proposal, reviews need completion, and every change streams to
                whoever is affected.
              </p>
            </div>
          </div>

          <div class="rounded-lg border bg-card p-5">
            <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Live in this build</p>
            <ul class="grid gap-3">
              <li class="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Realtime toasts and feed updates over SSE
              </li>
              <li class="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Google sign-in with password-proof linking
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <div class="grid divide-y divide-border border-b sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div v-for="item in [
        { label: 'Purpose', value: 'Portfolio demonstration' },
        { label: 'Focus', value: 'Core marketplace lifecycle' },
        { label: 'Goal', value: 'Show full-stack engineering decisions' },
      ]" :key="item.label" class="flex flex-col gap-1.5 px-6 py-5 md:px-12">
        <p class="text-xs uppercase tracking-widest text-muted-foreground">{{ item.label }}</p>
        <p>{{ item.value }}</p>
      </div>
    </div>

    <section class="px-6 py-14 md:px-12">
      <p class="text-xs font-semibold uppercase tracking-widest text-primary">Workflow</p>
      <h2 class="mb-7 mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Implemented marketplace lifecycle</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card v-for="step in [
          { n: '01', t: 'Open', d: 'Users create tasks, define rewards, and publish them for others to browse.' },
          { n: '02', t: 'Assigned', d: 'Taskers propose and owners assign a selected worker.' },
          { n: '03', t: 'Submitted', d: 'Assigned taskers submit work for owner review.' },
          { n: '04', t: 'Completed', d: 'Owners confirm and leave a rating with a comment.' },
        ]" :key="step.n">
          <CardContent class="grid gap-2 pt-6">
            <span class="w-fit border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">{{ step.n }}</span>
            <h3 class="font-semibold">{{ step.t }}</h3>
            <p class="text-sm text-muted-foreground">{{ step.d }}</p>
          </CardContent>
        </Card>
      </div>
      <div class="mt-4 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        <strong class="text-foreground">Business rules included:</strong>
        open tasks may be cancelled, assigned or submitted tasks may be reopened, and reviews are only allowed after completion.
      </div>
    </section>

    <section class="px-6 pb-14 md:px-12">
      <p class="text-xs font-semibold uppercase tracking-widest text-primary">Feature coverage</p>
      <h2 class="mb-7 mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Included in the current build</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card v-for="feature in features" :key="feature.title">
          <CardHeader>
            <CardTitle class="text-base">{{ feature.title }}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">{{ feature.desc }}</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <section class="grid gap-4 px-6 pb-14 md:px-12 lg:grid-cols-2">
      <Card class="relative overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/70 via-primary/10 to-transparent" />
        <CardHeader>
          <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Technical highlights</p>
          <CardTitle>Why this works as a strong portfolio project</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="grid gap-2.5">
            <li v-for="item in techHighlights" :key="item" class="text-sm leading-7 text-muted-foreground">{{ item }}</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Future improvements</p>
          <CardTitle>Planned next steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="grid gap-2.5">
            <li v-for="item in futureItems" :key="item" class="text-sm leading-7 text-muted-foreground">{{ item }}</li>
          </ul>
        </CardContent>
      </Card>
    </section>

    <section class="grid justify-items-center gap-6 px-6 pb-8 md:px-12">
      <div class="text-center">
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">Tech stack</p>
        <h2 class="mb-6 mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Tools used in this project</h2>
      </div>
      <div class="flex max-w-3xl flex-wrap justify-center gap-2.5">
        <Badge v-for="tech in techStack" :key="tech" variant="outline">{{ tech }}</Badge>
      </div>
    </section>

    <section class="px-6 pb-14 md:px-12">
      <Card>
        <div class="grid gap-6 p-8 text-center md:p-10">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-primary">Explore</p>
            <h2 class="mx-auto mt-2 max-w-2xl text-3xl font-semibold tracking-tight">See the demo and inspect the implementation</h2>
            <p class="mx-auto mt-3 max-w-xl leading-7 text-muted-foreground">
              A realistic marketplace workflow in a deliberately scoped build, with
              the API contract, realtime behavior, and auth flows all exercised.
            </p>
          </div>
          <div class="flex flex-wrap justify-center gap-3">
            <Button @click="goToApp">Open App</Button>
            <Button variant="outline" @click="openGithub">GitHub Repository</Button>
          </div>
        </div>
      </Card>
    </section>
  </div>
</template>
