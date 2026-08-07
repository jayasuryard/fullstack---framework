import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Shield, Users, CreditCard, FileText, ChevronRight, Sparkles } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Authentication', desc: 'JWT + opaque refresh rotation, lockout', color: 'from-blue-500 to-cyan-500' },
  { icon: FileText, title: 'Background Jobs', desc: 'Redis queue, 3 retries, progress', color: 'from-violet-500 to-purple-500' },
  { icon: Zap, title: 'Realtime', desc: 'WebSocket hub, live job channels', color: 'from-emerald-500 to-teal-500' },
  { icon: Users, title: 'Roles & Access', desc: 'role guards, read-only levels', color: 'from-orange-500 to-amber-500' },
  { icon: CreditCard, title: 'Payments', desc: 'Razorpay adapter, unwired by default', color: 'from-pink-500 to-rose-500' },
  { icon: Sparkles, title: 'Generators', desc: 'module, model, migration scripts', color: 'from-indigo-500 to-blue-500' },
];

const codeSnippet = `import { enqueueJob } from './helpers/queue/jobQueue.js';

const { jobId } = await enqueueJob(
  'invoice:send-pdf',
  { invoiceId },
  { userId: req.user.id }
);

// live progress → emitToChannel('job:' + jobId, ...)`;

function TypewriterCode() {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < codeSnippet.length) {
      const timeout = setTimeout(() => {
        setDisplayed(codeSnippet.slice(0, idx + 1));
        setIdx(idx + 1);
      }, 18);
      return () => clearTimeout(timeout);
    }
  }, [idx]);

  return (
    <pre className="text-sm font-mono leading-relaxed overflow-hidden">
      <code>{displayed}<span className="inline-block w-0.5 h-4 bg-primary-400 animate-pulse ml-0.5 align-middle" /></code>
    </pre>
  );
}

export default function Hero() {
  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="mx-auto max-w-7xl h-16 flex items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-lg shadow-primary-500/25">
              SF
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">SaaS Framework</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Docs', to: '/docs/introduction' },
              { label: 'Architecture', to: '/docs/architecture' },
              { label: 'Frontend', to: '/docs/frontend/overview' },
              { label: 'Backend', to: '/docs/backend/overview' },
              { label: 'AI/ML', to: '/docs/ai/overview' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 hero-glow grid-pattern overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-32 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative mx-auto max-w-5xl px-5 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800/50 text-primary-700 dark:text-primary-300 text-xs font-medium mb-8 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            Production SaaS Framework
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Build SaaS apps{' '}
            <span className="text-gradient">in days</span>,{' '}
            <br className="hidden sm:block" />
            not months
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
            Express 5 + Prisma 7 backend, React 19 frontend, Redis queue and realtime.
            Auth, jobs, and deployment are production-ready; your product is the modules.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link to="/docs/introduction" className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold text-sm shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:from-primary-500 hover:to-primary-600 transition-all">
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/docs/architecture" className="group flex items-center gap-2 px-7 py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all">
              View Architecture
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Code snippet */}
          <div className="mt-16 mx-auto max-w-lg animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl shadow-neutral-200/50 dark:shadow-black/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-neutral-400 font-mono ml-2">app.js</span>
              </div>
              <div className="p-5 text-left bg-neutral-50 dark:bg-[#0c0c0e]">
                <TypewriterCode />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Everything you need</h2>
            <p className="mt-3 text-neutral-500 dark:text-neutral-400">Every SaaS shares the same building blocks. We ship them.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group relative p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-black/30 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">Ready to build?</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">Dive into the documentation and start building production-ready SaaS applications today.</p>
          <Link to="/docs/introduction" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:from-primary-500 hover:to-primary-600 transition-all">
            Start Reading
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-[10px] font-bold text-white">SF</div>
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">&copy; {new Date().getFullYear()} SaaS Framework. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/docs/introduction" className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors">Docs</Link>
            <Link to="/docs/architecture" className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors">Architecture</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
