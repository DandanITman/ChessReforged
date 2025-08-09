import { Sword, Bot, Users, Settings, Puzzle, ShoppingBag } from "lucide-react";
import { NavTile } from "@/components/NavTile";

export default function Home() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NavTile href="/play/bot" title="Play vs Bot" description="Practice against an AI opponent." icon={Bot} />
      <NavTile href="/play/online" title="Play Online" description="Face other players (stub)." icon={Users} />
      <NavTile href="/editor" title="Board Editor" description="Assemble your army within a points budget." icon={Sword} />
      <NavTile href="/shop" title="Shop" description="Open packs and unlock pieces (stub)." icon={ShoppingBag} />
      <NavTile href="/achievements" title="Achievements" description="Track your progress (stub)." icon={Puzzle} />
      <NavTile href="/settings" title="Settings" description="Preferences and accessibility." icon={Settings} />
    </div>
  );
}
