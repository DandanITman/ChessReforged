"use client";

import { useProfileStore } from "@/lib/store/profile";
import { Card } from "@/components/ui/card";

export default function AchievementsPage() {
  const achievements = useProfileStore((s) => s.achievements);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Achievements</h1>
      <p className="text-sm text-muted-foreground">
        A showcase of your accomplishments. This is a local stub, progress will sync server-side in a later milestone.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {achievements.map((a) => {
          const pct = Math.min(100, Math.round((a.progress / a.goal) * 100));
          return (
            <Card key={a.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{a.title}</div>
                <div className={`text-xs ${a.achieved ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {a.achieved ? "Achieved" : `${a.progress}/${a.goal}`}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{a.description}</p>
              <div className="h-2 w-full rounded bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${pct}%` }}
                  aria-label={`Progress ${pct}%`}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}