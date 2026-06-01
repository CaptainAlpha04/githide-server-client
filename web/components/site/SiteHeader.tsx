import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  variant?: "light" | "dark";
}

export function SiteHeader({ variant = "light" }: SiteHeaderProps) {
  const isDark = variant === "dark";

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold tracking-wide ${
            isDark ? "bg-amber-300 text-slate-900" : "bg-slate-900 text-white"
          }`}
        >
          GH
        </div>
        <div>
          <p
            className={`font-display text-2xl ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Githide
          </p>
          <p
            className={`text-xs uppercase tracking-[0.3em] ${
              isDark ? "text-amber-200" : "text-slate-500"
            }`}
          >
            Secrets, Git-Style
          </p>
        </div>
      </Link>
      <nav className="flex flex-wrap items-center gap-5">
        <Link
          className={`text-sm font-medium ${
            isDark
              ? "text-slate-200 hover:text-white"
              : "text-slate-700 hover:text-slate-900"
          }`}
          href="/docs"
        >
          Docs
        </Link>
        <Link
          className={`text-sm font-medium ${
            isDark
              ? "text-slate-200 hover:text-white"
              : "text-slate-700 hover:text-slate-900"
          }`}
          href="/login"
        >
          Try Githide
        </Link>
        <Button
          asChild
          className={
            isDark
              ? "bg-amber-300 text-slate-900 hover:bg-amber-200"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }
        >
          <Link
            href="https://github.com/CaptainAlpha04/githide"
            className="text-inherit"
          >
            Download
          </Link>
        </Button>
      </nav>
    </header>
  );
}
