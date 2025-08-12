import Link from "next/link";

export default function PlayBotPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Play vs Bot</h1>
      <p className="text-sm text-muted-foreground">Choose your options before you start.</p>
      <div className="flex gap-3">
        <Link href="/play/bot/setup" className="px-4 py-2 rounded bg-blue-600 text-white font-medium">Open Setup</Link>
        <Link href="/play/bot/match" className="px-4 py-2 rounded bg-green-600 text-white font-medium">Start Match</Link>
      </div>
    </section>
  );
}