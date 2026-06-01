import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";

const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Quick start", href: "#quick-start" },
  { label: "Configuration", href: "#configuration" },
  { label: "CLI", href: "#cli" },
  { label: "Security", href: "#security" },
  { label: "Deployment", href: "#deployment" },
];

const commands = [
  { cmd: "githide init", desc: "Initialize a repo and set encryption password" },
  { cmd: "githide login", desc: "Authenticate with Firebase" },
  { cmd: "githide sync", desc: "Upload and download encrypted secrets" },
  { cmd: "githide status", desc: "Show pending changes and sync state" },
  { cmd: "githide encrypt", desc: "Manually encrypt tracked files" },
  { cmd: "githide decrypt", desc: "Manually decrypt tracked files" },
  { cmd: "githide endpoint set-url <url>", desc: "Point at your server" },
  { cmd: "githide endpoint enable", desc: "Enable syncing" },
  { cmd: "githide doctor", desc: "Diagnose hooks and config issues" },
];

const toc = [
  { label: "Why Githide", href: "#overview" },
  { label: "Install + init", href: "#quick-start" },
  { label: "Track files", href: "#configuration" },
  { label: "Commands", href: "#cli" },
  { label: "Security model", href: "#security" },
];

export default function DocsPage() {
  return (
    <main className="landing-surface">
      <div className="landing-grid">
        <div className="mx-auto w-full max-w-6xl px-6 py-8">
          <SiteHeader />

          <section className="mt-10 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Documentation
                </p>
                <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
                  Keep secrets in sync without Git history.
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Githide encrypts locally, syncs encrypted blobs to your server,
                  and keeps secret files out of Git history.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
                  <Link href="/login">Try Githide</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-400">
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
          </section>

          <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr_200px]">
            <aside className="hidden lg:block">
              <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Docs
                </p>
                <nav className="mt-4 space-y-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block text-slate-600 hover:text-slate-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="space-y-10">
              <section id="overview" className="space-y-4">
                <h2 className="font-display text-2xl text-slate-900">Overview</h2>
                <p className="text-base text-slate-600">
                  Githide is a version control system for secret files that runs
                  parallel to Git. It encrypts files locally using AES-256-GCM,
                  syncs encrypted blobs to your server, and keeps secrets out of
                  Git history while making them easy to share with collaborators.
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Architecture
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {[
                      "Encrypt locally with a shared password",
                      "Sync encrypted blobs to your server",
                      "Auto-decrypt on pull for collaborators",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="quick-start" className="space-y-4">
                <h2 className="font-display text-2xl text-slate-900">Quick start</h2>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                  <pre className="text-sm leading-6 text-slate-900">
{`# install locally
FIREBASE_API_KEY=<your-firebase-web-api-key> cargo install --path .

# initialize in a repo
githide init
githide login

# point to your server
githide endpoint set-url https://your-server.com
githide endpoint enable
githide sync`}
                  </pre>
                </div>
                <ol className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <li>1. Deploy the Githide server and copy the URL.</li>
                  <li>2. Install the CLI and initialize the repo.</li>
                  <li>3. Authenticate and enable the endpoint.</li>
                  <li>4. Run githide sync to upload encrypted secrets.</li>
                </ol>
              </section>

              <section id="configuration" className="space-y-4">
                <h2 className="font-display text-2xl text-slate-900">Configuration</h2>
                <p className="text-base text-slate-600">
                  Add secret files to .githide. Everything listed is encrypted
                  and added to .gitignore automatically.
                </p>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-5">
                  <pre className="text-sm leading-6 text-slate-900">
{`# .githide
.env
.env.staging
config/secrets.yaml
creds/`}
                  </pre>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Hooks",
                      body: "Install once with githide init. Hooks keep Git clean automatically.",
                    },
                    {
                      title: "Storage",
                      body: "Use the HTTP server or GitHub-backed storage for encrypted blobs.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-200 bg-white/70 p-5"
                    >
                      <h3 className="font-display text-lg text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="cli" className="space-y-4">
                <h2 className="font-display text-2xl text-slate-900">CLI commands</h2>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-[0.3em] text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Command</th>
                        <th className="px-4 py-3">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {commands.map((row) => (
                        <tr key={row.cmd} className="text-slate-700">
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {row.cmd}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="security" className="space-y-4">
                <h2 className="font-display text-2xl text-slate-900">Security model</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    "AES-256-GCM encryption with random nonces",
                    "Argon2id key derivation from shared password",
                    "Firebase auth with short-lived tokens",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-sm text-slate-100">
                  Secrets are encrypted locally, stored as encrypted blobs, and
                  never committed to Git. Only collaborators with the shared
                  password can decrypt after syncing.
                </div>
              </section>

              <section id="deployment" className="space-y-4">
                <h2 className="font-display text-2xl text-slate-900">Deployment</h2>
                <p className="text-base text-slate-600">
                  Deploy the server anywhere you can host a Node service. The
                  web dashboard connects to the same Firebase project.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" className="border-slate-400">
                    <Link href="https://github.com/CaptainAlpha04/githide-server-client">
                      Server repo
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/login">Open dashboard</Link>
                  </Button>
                  <Button asChild variant="ghost" className="text-slate-700">
                    <Link href="https://github.com/CaptainAlpha04/githide/wiki">
                      GitHub wiki
                    </Link>
                  </Button>
                </div>
              </section>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  On this page
                </p>
                <nav className="mt-4 space-y-3">
                  {toc.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block text-slate-600 hover:text-slate-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>
          </div>

          <footer className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>Need more details? Visit the GitHub wiki for extended docs.</p>
            <Link
              className="text-slate-700 hover:text-slate-900"
              href="https://github.com/CaptainAlpha04/githide/wiki"
            >
              Open GitHub wiki
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
