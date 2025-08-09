import ChessBoard from "@/components/ChessBoard";

export default function PlayBotPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Play vs Bot</h1>
      <p className="text-sm text-muted-foreground">
        Bot logic coming in a later milestone. For now, interact with the board locally.
      </p>
      <ChessBoard />
    </section>
  );
}