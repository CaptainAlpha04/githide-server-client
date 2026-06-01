import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";

const featureCards = [
  {
    title: "Git hooks included",
    body: "Auto-encrypt on commit and auto-decrypt on pull so secrets never touch Git history.",
  },
  {
    title: "Team-ready sync",
    body: "One command to share .env files with collaborators across environments.",
  },
  {
    title: "Server you own",
    body: "Run the Githide server anywhere. Your data, your storage, your rules.",
  },
];

const steps = [
  "Initialize and set password",
  "Encrypt and sync secrets",
  "Collaborators pull and decrypt",
];



export default function Home() {
  return (
    <main className="landing-surface">
      <div className="landing-grid">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
          <SiteHeader />

          <section className="mt-16 grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-6 fade-in-up">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
                Parallel version control for secrets
              </p>
              <h1 className="font-display text-4xl leading-tight text-slate-900 md:text-6xl">
                Ship code with Git. Sync secrets with Githide.
              </h1>
              <p className="text-lg text-slate-600">
                Githide is a version control system for secret files that runs
                alongside Git. Push code as usual and Githide securely syncs
                your .env files to your server so collaborators always pull the
                latest values without touching Git history.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/docs">Read the docs</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-400">
                  <Link href="/login">Try Githide</Link>
                </Button>
                <Button asChild variant="ghost" className="text-slate-700">
                  <Link href="https://github.com/CaptainAlpha04/githide">
                    Download CLI
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="text-slate-700">
                  <Link href="https://github.com/CaptainAlpha04/githide-server-client">
                    Server repo
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-amber-100">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                <span>Workflow</span>
                <span>githide sync</span>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4 text-slate-100">
                <pre className="text-sm leading-6 text-slate-100">
{`githide init
githide login
githide sync

# Git stays clean
git add .
git commit -m "feature"
git push`}
                </pre>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-800">What you get</p>
                <ul className="space-y-1">
                  <li>Encrypted blobs stored on your server</li>
                  <li>Shared .env updates across every collaborator</li>
                  <li>Zero secret files in Git history</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-20 grid gap-6 md:grid-cols-3 stagger">
            {featureCards.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm"
              >
                <h3 className="font-display text-xl text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </section>

          <section className="mt-20 grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">
                How it works
              </p>
              <h2 className="font-display text-3xl text-slate-900 md:text-4xl">
                Keep secrets in sync without slowing down Git.
              </h2>
              <p className="text-base text-slate-600">
                Githide tracks files listed in .githide, encrypts them with a
                per-repo password, and syncs encrypted blobs to your server. The
                files are automatically ignored by Git while staying accessible
                to collaborators who have the password.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" className="border-slate-400">
                  <Link href="/docs">Read docs</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/login">Open dashboard</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-base text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 rounded-3xl border border-slate-200 bg-slate-950 px-8 py-12 text-slate-100">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-amber-300">
                  Ready to ship
                </p>
                <h3 className="font-display text-3xl">Githide keeps secrets out of Git.</h3>
                <p className="mt-3 text-sm text-slate-300">
                  Start with the docs, install the CLI, and point it at your server.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-amber-300 text-slate-900 hover:bg-amber-200">
                  <Link href="/docs">Documentation</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-black">
                  <Link href="https://github.com/CaptainAlpha04/githide">
                    Download CLI
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-black">
                  <Link href="https://github.com/CaptainAlpha04/githide-server-client">
                    Server repo
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <footer className="mt-16 flex flex-col gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>Built for teams that ship fast and keep secrets safe.</p>
            <div className="flex gap-4">
              <Link className="hover:text-slate-700" href="/docs">
                Docs
              </Link>
              <Link className="hover:text-slate-700" href="/login">
                Dashboard
              </Link>
              <Link
                className="hover:text-slate-700"
                href="https://github.com/CaptainAlpha04/githide"
              >
                CLI
              </Link>
              <Link
                className="hover:text-slate-700"
                href="https://github.com/CaptainAlpha04/githide-server-client"
              >
                Server
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
