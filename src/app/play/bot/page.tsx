import BotChessBoard from "@/components/BotChessBoard";

export default function PlayBotPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Play vs Bot</h1>
      <p className="text-sm text-muted-foreground">
        Choose your side and play against the AI bot! The bot uses a simple evaluation function to make strategic moves.
      </p>
      <BotChessBoard />
    </section>
  );
}