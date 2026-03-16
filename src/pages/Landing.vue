<script setup lang="ts">
import { useRouter } from 'vue-router'

const features = [
  { title: 'Authentication',         desc: 'JWT-based authentication and protected application flows.' },
  { title: 'Task Management',        desc: 'Task creation, viewing, filtering, and state-aware actions.' },
  { title: 'Proposal Flow',          desc: 'Taskers can submit proposals and owners can review them.' },
  { title: 'Assignment Logic',       desc: 'Owners can assign taskers through controlled lifecycle actions.' },
  { title: 'Submission + Completion',desc: 'Task progression is enforced through valid workflow transitions.' },
  { title: 'Review System',          desc: 'Ratings and comments are tied to completed tasks only.' },
  { title: 'Validation',             desc: 'Schema validation helps protect request and data integrity.' },
  { title: 'Frontend Structure',     desc: 'Reusable forms, dialogs, drawers, and state-driven views.' },
]

const techHighlights = [
  'Models real business rules instead of only basic CRUD.',
  'Uses guarded task state transitions for backend safety.',
  'Includes transactional logic for reviews and rating updates.',
  'Connects frontend flows to realistic backend constraints.',
  'Shows practical full-stack decision-making and scope control.',
]

const futureItems = [
  'Add SSE for real-time task and proposal updates.',
  'Add direct chat between task owners and taskers.',
  'Add notifications for important workflow changes.',
  'Continue polishing UX and deployment readiness.',
]

const techStack = ['Vue 3','TypeScript','Vite','Naive UI','Node.js','Express','PostgreSQL','Prisma','Zod','JWT']

const router = useRouter()

const githubLink = "https://github.com/alexander213213/task-api"

function goToApp() {
    router.push("/auth/login")
}
</script>

<template>
  <div class="landing-page">

    <section class="hero">
      <div class="hero-eyebrow">
        <n-tag :bordered="true" round class="hero-tag">Portfolio Demo</n-tag>
        <div class="eyebrow-line" />
      </div>

      <n-grid :cols="2" :x-gap="64" class="hero-body" responsive="self" :collapsed-cols="1" :collapsed="false">
        <n-gi>
          <div class="hero-left">
            <h1>
              Task marketplace demo
              <span class="accent-text">built to showcase full-stack workflow</span>
            </h1>

            <n-text class="hero-description" depth="3">
              This project demonstrates the essential lifecycle operations of a task
              marketplace, including task creation, proposal submission, task
              assignment, work submission, completion, and reviews.
            </n-text>

            <n-text class="hero-subtext" depth="3">
              It is intentionally scoped as a portfolio project. Some features were
              deliberately deferred to fit the project timeline, including
              Server-Sent Events for real-time updates and direct chat between task
              owners and taskers.
            </n-text>

            <n-space :size="12" style="margin-top: 32px">
              <n-button type="primary" class="primary-btn" @click="goToApp">Explore Demo</n-button>
              <n-button tag="a" :href="githubLink" ghost class="secondary-btn">View Source</n-button>
            </n-space>
          </div>
        </n-gi>

        <n-gi>
          <n-space vertical :size="20">
            <div class="hero-stats">
              <div class="stat-item">
                <n-statistic label="core states" tabular-nums>
                  <template #default><span class="stat-value">4</span></template>
                </n-statistic>
              </div>
              <n-divider vertical class="stat-divider" />
              <div class="stat-item">
                <n-statistic label="stack app" tabular-nums>
                  <template #default><span class="stat-value">full</span></template>
                </n-statistic>
              </div>
              <n-divider vertical class="stat-divider" />
              <div class="stat-item">
                <n-statistic label="portfolio scoped" tabular-nums>
                  <template #default><span class="stat-value">demo</span></template>
                </n-statistic>
              </div>
            </div>

            <div class="preview-shell">
              <div class="preview-top">
                <span class="preview-dot" />
                <span class="preview-dot" />
                <span class="preview-dot" />
                <n-text class="preview-title-bar" depth="3">task-marketplace / lifecycle</n-text>
              </div>

              <div class="preview-panel">
                <div class="preview-header">
                  <div>
                    <p class="section-label">Lifecycle</p>
                    <h3>Core task flow</h3>
                  </div>
                  <n-tag size="small" class="status-tag">DEMO</n-tag>
                </div>

                <n-space justify="center" align="center" :size="8" :wrap="true">
                  <div class="flow-state">OPEN</div>
                  <span class="flow-arrow">→</span>
                  <div class="flow-state">ASSIGNED</div>
                  <span class="flow-arrow">→</span>
                  <div class="flow-state">SUBMITTED</div>
                  <span class="flow-arrow">→</span>
                  <div class="flow-state success">COMPLETED</div>
                </n-space>

                <n-text class="preview-copy" depth="3">
                  The app models business rules around valid state transitions,
                  assignment flow, submission confirmation, and post-completion
                  reviews.
                </n-text>
              </div>

              <div class="preview-panel">
                <p class="section-label" style="margin-bottom: 12px">Deferred for future update</p>
                <n-space vertical :size="12">
                  <div class="deferred-item">
                    <span class="deferred-bullet" />
                    <n-text depth="3">Real-time updates with Server-Sent Events</n-text>
                  </div>
                  <div class="deferred-item">
                    <span class="deferred-bullet" />
                    <n-text depth="3">Direct chat between owners and taskers</n-text>
                  </div>
                </n-space>
              </div>
            </div>
          </n-space>
        </n-gi>
      </n-grid>
    </section>

    <div class="info-strip">
      <div class="info-strip-item">
        <n-text class="info-strip-label" depth="3">Purpose</n-text>
        <n-text class="info-strip-value">Portfolio demonstration</n-text>
      </div>
      <n-divider vertical class="strip-divider" />
      <div class="info-strip-item">
        <n-text class="info-strip-label" depth="3">Focus</n-text>
        <n-text class="info-strip-value">Core marketplace lifecycle</n-text>
      </div>
      <n-divider vertical class="strip-divider" />
      <div class="info-strip-item">
        <n-text class="info-strip-label" depth="3">Goal</n-text>
        <n-text class="info-strip-value">Show full-stack engineering decisions</n-text>
      </div>
    </div>

    <section class="content-section scope-section">
      <div class="scope-heading">
        <p class="section-label">Project Scope</p>
        <h2>What this demo is meant to show</h2>
      </div>
      <n-grid :cols="2" :x-gap="16" :y-gap="16" class="scope-cards" responsive="self" :collapsed-cols="1">
        <n-gi>
          <n-card class="content-card" :bordered="true">
            <template #header><span class="card-title">Deliberately scoped</span></template>
            <n-text depth="3">
              This application focuses on the essential user and system flows of a
              task marketplace rather than aiming for production completeness in a
              single iteration.
            </n-text>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card class="content-card" :bordered="true">
            <template #header><span class="card-title">Built to demonstrate engineering skill</span></template>
            <n-text depth="3">
              The current implementation is enough to show backend lifecycle
              handling, authentication, validation, data consistency, and frontend
              interaction design.
            </n-text>
          </n-card>
        </n-gi>
      </n-grid>
    </section>

    <section class="content-section">
      <div class="section-heading">
        <p class="section-label">Workflow</p>
        <h2>Implemented marketplace lifecycle</h2>
      </div>

      <div class="workflow-strip">
        <n-grid :cols="4" :x-gap="0" responsive="self" :collapsed-cols="2">
          <n-gi>
            <div class="workflow-card">
              <div class="workflow-number">01</div>
              <h3>Open</h3>
              <n-text depth="3">Users can create tasks, define rewards, and publish them for others to browse.</n-text>
            </div>
          </n-gi>
          <n-gi>
            <div class="workflow-card">
              <div class="workflow-number">02</div>
              <h3>Assigned</h3>
              <n-text depth="3">Taskers can submit proposals and task owners can assign a selected worker.</n-text>
            </div>
          </n-gi>
          <n-gi>
            <div class="workflow-card">
              <div class="workflow-number">03</div>
              <h3>Submitted</h3>
              <n-text depth="3">Assigned taskers can mark their work as submitted for owner review.</n-text>
            </div>
          </n-gi>
          <n-gi>
            <div class="workflow-card featured-card">
              <div class="workflow-number">04</div>
              <h3>Completed</h3>
              <n-text depth="3">Owners can confirm completion and leave a rating or review after the task is finalized.</n-text>
            </div>
          </n-gi>
        </n-grid>
      </div>

      <n-alert class="rule-box" :show-icon="false" :bordered="false">
        <n-text depth="3">
          <strong style="color: #c8cdd8">Business rules included:</strong>
          open tasks may be cancelled, assigned or submitted tasks may be
          reopened, and reviews are only allowed after completion.
        </n-text>
      </n-alert>
    </section>

    <section class="content-section">
      <div class="section-heading">
        <p class="section-label">Feature Coverage</p>
        <h2>Included in the current build</h2>
      </div>

      <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="self" :collapsed-cols="2">
        <n-gi v-for="feature in features" :key="feature.title">
          <n-card class="content-card" :bordered="true">
            <template #header><span class="card-title">{{ feature.title }}</span></template>
            <n-text depth="3">{{ feature.desc }}</n-text>
          </n-card>
        </n-gi>
      </n-grid>
    </section>

    <section class="content-section">
      <n-grid :cols="2" :x-gap="16" :y-gap="16" responsive="self" :collapsed-cols="1" class="highlights-grid">
        <n-gi>
          <n-card class="highlights-card" :bordered="true">
            <template #header>
              <div>
                <p class="section-label" style="margin-bottom: 6px">Technical Highlights</p>
                <span class="card-title">Why this works as a strong portfolio project</span>
              </div>
            </template>
            <n-ul class="detail-list">
              <n-li v-for="item in techHighlights" :key="item">
                <n-text depth="3">{{ item }}</n-text>
              </n-li>
            </n-ul>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card class="highlights-card muted-card" :bordered="true">
            <template #header>
              <div>
                <p class="section-label" style="margin-bottom: 6px">Future Improvements</p>
                <span class="card-title">Planned next steps</span>
              </div>
            </template>
            <n-ul class="detail-list">
              <n-li v-for="item in futureItems" :key="item">
                <n-text depth="3">{{ item }}</n-text>
              </n-li>
            </n-ul>
          </n-card>
        </n-gi>
      </n-grid>
    </section>

    <section class="content-section stack-section">
      <div class="stack-heading">
        <p class="section-label">Tech Stack</p>
        <h2>Tools used in this project</h2>
      </div>
      <n-space :size="10" :wrap="true" justify="center" class="stack-tag-row">
        <n-tag v-for="tech in techStack" :key="tech" round class="stack-tag">{{ tech }}</n-tag>
      </n-space>
    </section>

    <section class="cta-section">
      <n-card class="cta-card" :bordered="true">
        <div class="cta-inner">
          <div class="cta-accent-col">
            <div class="cta-accent-line" />
          </div>
          <div class="cta-content">
            <p class="section-label">Explore</p>
            <h2>See the demo and inspect the implementation</h2>
            <n-text depth="3" class="cta-copy">
              This project is meant to demonstrate my skills as a full-stack
              developer through a realistic marketplace workflow and a
              deliberately scoped product build.
            </n-text>
            <n-space :size="12" style="margin-top: 28px" :wrap="true">
              <n-button type="primary" class="primary-btn" @click="goToApp">Open App</n-button>
              <n-button tag="a" :href="githubLink" ghost class="secondary-btn">GitHub Repository</n-button>
            </n-space>
          </div>
        </div>
      </n-card>
    </section>

  </div>
</template>


<style scoped>
.landing-page {
  min-height: 100vh;
  width: 100%;
  background: rgba(17, 18, 22, 0.98);
  color: #d7d9df;
  padding: 0;
}

.hero-tag,
.status-tag,
.stack-tag {
  --n-border: 1px solid rgba(86, 214, 187, 0.35) !important;
  --n-text-color: #56d6bb !important;
  --n-color: rgba(86, 214, 187, 0.06) !important;
}

.content-card,
.highlights-card,
.cta-card {
  --n-color: rgba(12, 13, 17, 0.42) !important;
  --n-border-color: rgba(120, 123, 134, 0.16) !important;
  --n-border-radius: 0 !important;
  --n-padding-bottom: 20px !important;
  --n-padding-top: 22px !important;
  --n-padding-left: 22px !important;
  --n-padding-right: 22px !important;
  --n-title-font-size: 1.08rem !important;
  --n-title-text-color: #eef1f6 !important;
  --n-title-font-weight: 600 !important;
}

.highlights-card {
  --n-padding-bottom: 26px !important;
  --n-padding-left: 26px !important;
  --n-padding-right: 26px !important;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.highlights-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, rgba(86, 214, 187, 0.7) 0%, rgba(86, 214, 187, 0.1) 60%, transparent 100%);
}

.muted-card::before {
  background: linear-gradient(90deg, rgba(120, 123, 134, 0.4) 0%, transparent 60%) !important;
}

.cta-card {
  --n-padding-bottom: 0 !important;
  --n-padding-top: 0 !important;
  --n-padding-left: 0 !important;
  --n-padding-right: 0 !important;
}

.rule-box {
  --n-color: rgba(10, 11, 15, 0.42) !important;
  --n-border: 1px solid rgba(120, 123, 134, 0.16) !important;
  --n-border-radius: 0 !important;
  margin-top: 0 !important;
}

.hero-stats :deep(.n-statistic-label) {
  color: #8d93a1 !important;
  font-size: 0.82rem !important;
  text-transform: lowercase;
}

.hero-stats :deep(.n-statistic-value) {
  color: #eef1f6 !important;
}

.stat-divider {
  --n-color: rgba(120, 123, 134, 0.18) !important;
  height: 100% !important;
  align-self: stretch !important;
}

.strip-divider {
  --n-color: rgba(120, 123, 134, 0.1) !important;
  align-self: stretch !important;
}

.detail-list {
  margin: 12px 0 0 !important;
  padding-left: 18px !important;
}

.detail-list :deep(.n-li) {
  line-height: 1.9 !important;
  color: #a9afbd !important;
}

.primary-btn {
  --n-color: #56d6bb !important;
  --n-color-hover: #67ddc4 !important;
  --n-color-pressed: #46c8ad !important;
  --n-text-color: #111318 !important;
  --n-border: 1px solid #56d6bb !important;
  font-weight: 600;
}

.secondary-btn {
  --n-text-color: #56d6bb !important;
  --n-border: 1px solid rgba(86, 214, 187, 0.35) !important;
  --n-border-hover: 1px solid rgba(86, 214, 187, 0.55) !important;
  --n-border-pressed: 1px solid rgba(86, 214, 187, 0.55) !important;
}

.section-label {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #56d6bb;
  font-weight: 600;
}

.card-title {
  color: #eef1f6;
  font-size: 1.08rem;
  font-weight: 600;
}

.hero {
  width: 100%;
  box-sizing: border-box;
  padding: 40px 48px 56px;
  border-bottom: 1px solid rgba(120, 123, 134, 0.14);
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
}

.eyebrow-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(86, 214, 187, 0.3) 0%, transparent 100%);
}

.hero-body {
  width: 100%;
}

.hero-left {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.hero-left h1 {
  margin: 0 0 16px;
  font-size: clamp(2.6rem, 5vw, 4.4rem);
  line-height: 1.04;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: #eef1f6;
}

.accent-text {
  display: block;
  color: #56d6bb;
}

.hero-description {
  display: block;
  line-height: 1.85;
  font-size: 1rem;
  max-width: 560px;
  margin-bottom: 12px;
}

.hero-subtext {
  display: block;
  line-height: 1.85;
  font-size: 1rem;
  max-width: 560px;
}

.hero-stats {
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(120, 123, 134, 0.18);
  background: rgba(12, 13, 17, 0.45);
  padding: 0;
}

.stat-item {
  flex: 1;
  padding: 16px 20px;
}

.stat-value {
  font-size: 1.05rem;
  font-weight: 600;
  color: #eef1f6;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.preview-shell {
  border: 1px solid rgba(120, 123, 134, 0.16);
  background: rgba(8, 9, 12, 0.55);
}

.preview-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(120, 123, 134, 0.12);
}

.preview-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 999px;
  background: rgba(111, 117, 131, 0.7);
}

.preview-title-bar {
  margin-left: 8px;
  font-size: 0.78rem !important;
  font-family: monospace;
  letter-spacing: 0.02em;
}

.preview-panel:nth-of-type(1) {
    display: grid;
}

.preview-panel {
  padding: 20px;
  border-bottom: 1px solid rgba(120, 123, 134, 0.12);
}

.preview-panel:last-child { border-bottom: none; }

.preview-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.preview-header div:nth-child(1) {
    grid-column: 2 / span 1;
    align-self: center;
    justify-self: center;
}

.preview-header .status-tag {
    grid-column: 3 / span 1;
    align-self: center;
    justify-self: end;
}

.preview-header h3 {
  margin: 6px 0 0;
  font-size: 1.15rem;
  color: #eef1f6;
}

.flow-state {
  padding: 9px 13px;
  border: 1px solid rgba(86, 214, 187, 0.28);
  color: #56d6bb;
  background: rgba(86, 214, 187, 0.04);
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.flow-state.success { color: #8de0ce; }

.flow-arrow {
  color: #6d7480;
  flex-shrink: 0;
}

.preview-copy {
  display: block;
  margin-top: 16px;
  line-height: 1.8;
  font-size: 0.95rem;
}

.deferred-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deferred-bullet {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #56d6bb;
}

.info-strip {
  display: flex;
  align-items: stretch;
  border-top: 1px solid rgba(120, 123, 134, 0.1);
  border-bottom: 1px solid rgba(120, 123, 134, 0.1);
  background: rgba(10, 11, 15, 0.45);
}

.info-strip-item {
  flex: 1;
  padding: 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-strip-label {
  font-size: 0.78rem !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.info-strip-value {
  font-size: 1rem !important;
  color: #e6e9ef !important;
}

.content-section {
  width: 100%;
  box-sizing: border-box;
  padding: 56px 48px 24px;
}

.section-heading {
  margin-bottom: 28px;
}

.section-heading h2 {
  margin: 8px 0 0;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 600;
  color: #eef1f6;
  letter-spacing: -0.03em;
}

.scope-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.scope-heading {
  text-align: center;
}

.scope-heading h2 {
  margin: 8px 0 0;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 600;
  color: #eef1f6;
  letter-spacing: -0.03em;
}

.scope-cards { width: 100%; }

.workflow-strip {
  border: 1px solid rgba(120, 123, 134, 0.16);
}

.workflow-card {
  padding: 26px 22px;
  border-right: 1px solid rgba(120, 123, 134, 0.16);
  background: rgba(12, 13, 17, 0.42);
  height: 100%;
  box-sizing: border-box;
}

.workflow-card:last-child { border-right: none; }

.featured-card {
  background: rgba(86, 214, 187, 0.03);
  border-left: 2px solid rgba(86, 214, 187, 0.3);
}

.workflow-card h3 {
  margin: 0 0 8px;
  color: #eef1f6;
  font-size: 1.08rem;
  font-weight: 600;
}

.workflow-number {
  display: inline-block;
  margin-bottom: 14px;
  padding: 5px 10px;
  border: 1px solid rgba(86, 214, 187, 0.22);
  color: #56d6bb;
  background: rgba(86, 214, 187, 0.04);
  font-size: 0.78rem;
  font-weight: 600;
}

.stack-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding-bottom: 32px;
}

.stack-heading {
  text-align: center;
}

.stack-heading h2 {
  margin: 8px 0 0;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 600;
  color: #eef1f6;
  letter-spacing: -0.03em;
}

.stack-tag-row { width: 100%; justify-content: center; }

.highlights-grid :deep(.n-grid) {
  align-items: stretch;
}

.highlights-grid :deep(.n-gi) {
  display: flex;
  flex-direction: column;
}

.highlights-grid .highlights-card {
  flex: 1;
}

.cta-section {
  padding: 0 48px 56px;

}

.cta-inner {
  display: grid;
  grid-template-columns: 56px 1fr;
}

.cta-accent-col {
  border-right: 1px solid rgba(120, 123, 134, 0.14);
  display: flex;
  align-items: stretch;
  padding: 36px 0;
}

.cta-accent-line {
  width: 2px;
  margin: 0 auto;
  background: linear-gradient(180deg, transparent 0%, rgba(86, 214, 187, 0.5) 30%, rgba(86, 214, 187, 0.5) 70%, transparent 100%);
}

.cta-content {
  padding: 36px 40px 36px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cta-content h2 {
  margin: 8px 0 12px;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  color: #eef1f6;
  letter-spacing: -0.03em;
  font-weight: 600;
  max-width: 640px;
}

.cta-copy {
  display: block;
  line-height: 1.85;
  max-width: 600px;
}

@media (max-width: 1200px) {
}

@media (max-width: 900px) {
  .hero,
  .content-section,
  .cta-section {
    padding-left: 24px;
    padding-right: 24px;
  }

  .info-strip { flex-direction: column; }
  .info-strip-item { padding: 18px 24px; }
  .strip-divider { display: none !important; }

  .workflow-card { border-right: none; border-bottom: 1px solid rgba(120, 123, 134, 0.16); }
  .workflow-card:last-child { border-bottom: none; }

  .cta-inner { grid-template-columns: 1fr; }
  .cta-accent-col { display: none; }
  .cta-content { padding: 28px 24px; }
}

@media (max-width: 760px) {
  .hero,
  .content-section,
  .cta-section {
    padding-left: 16px;
    padding-right: 16px;
  }

  .hero h1 { font-size: clamp(2.2rem, 10vw, 3.2rem); }

  .info-strip-item { padding: 16px; }
}
</style>