import ChessBoard from "@/components/ChessBoard";

export default function EditorPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Board Editor</h1>
      <p className="text-sm text-muted-foreground">
        Place pieces within your budget and first two ranks. Validation coming next.
      </p>
      <ChessBoard />
    </section>
  );
}