import { Link } from 'react-router-dom';
import { Button, Card } from '@/design-system';

const features = [
  { title: 'Authentication', description: 'JWT, refresh tokens, MFA, OTP, email verification, session management — everything you need out of the box.' },
  { title: 'Authorization', description: 'RBAC with dynamic roles, permissions, policies, and guards. Fine-grained access control at every level.' },
  { title: 'User Management', description: 'Users, teams, organizations, invitations, profiles, and account settings. Multi-tenant ready.' },
  { title: 'AI Integration', description: 'GROQ API integration with streaming, prompt management, conversation history, and tool calling.' },
  { title: 'Notifications', description: 'Email, in-app, and push notifications with templates and user preferences.' },
  { title: 'File Management', description: 'S3-compatible storage with uploads, downloads, image optimization, and validation.' },
  { title: 'Dashboard & Analytics', description: 'Widgets, charts, recent activities, and statistics to monitor your application.' },
  { title: 'Billing', description: 'Subscriptions, invoices, payments, coupons, taxes, refunds, and usage tracking.' },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-50">
              Build production-ready SaaS
              <span className="text-primary-600"> in days</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              RyoFramework is an AI-first framework that converts business requirements into production-grade code.
              Authentication, billing, teams, AI — all built-in and ready to deploy.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/app/signup"><Button size="lg" className="px-8">Start building</Button></Link>
              <Link to="/docs"><Button variant="secondary" size="lg" className="px-8">Read the docs</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
              Everything you need to ship
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Every SaaS shares the same building blocks. We ship them so you can focus on what makes your product unique.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} variant="outlined" className="hover:shadow-md transition-shadow">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{feature.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
              Production-ready from day one
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Docker, CI/CD, testing, security, monitoring — every project ships with enterprise infrastructure.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { stat: '70%', label: 'Faster development' },
              { stat: '100%', label: 'TypeScript/JS' },
              { stat: '15+', label: 'Built-in modules' },
              { stat: 'Zero', label: 'Config boilerplate' },
            ].map((item) => (
              <Card key={item.label} className="text-center">
                <p className="text-3xl font-bold text-primary-600">{item.stat}</p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{item.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
              Built for developers
            </h2>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Clean architecture. Strict TypeScript. SOLID principles. Every line feels like it was written by a senior engineer.
            </p>
            <div className="mt-10">
              <Link to="/app/signup"><Button size="lg" className="px-8">Get started free</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
