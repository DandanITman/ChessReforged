"use client";

import Link from "next/link";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Crown, Zap, Target, Swords, Star } from "lucide-react";
import { useEditorStore } from "@/lib/store/editor";

export default function PlayBotPage() {
  const [side, setSide] = React.useState<'w' | 'b'>('w');
  const [difficulty, setDifficulty] = React.useState<'easy' | 'normal' | 'hard'>('normal');
  const [selectedDeckId, setSelectedDeckId] = React.useState<string>('');
  const [opponentDeckId, setOpponentDeckId] = React.useState<string>('');

  // Get decks from editor store
  const allDecks = useEditorStore((s) => s.decks);
  const playerDecks = React.useMemo(() => allDecks.filter(d => d.color === side), [allDecks, side]);
  const opponentDecks = React.useMemo(() => allDecks.filter(d => d.color !== side), [allDecks, side]);

  // Auto-select main deck when side changes, but only if no deck is currently selected
  React.useEffect(() => {
    // Only auto-select if we don't have a valid selection for the current side
    const currentDeckValid = selectedDeckId && playerDecks.some(d => d.id === selectedDeckId);

    if (!currentDeckValid) {
      const mainDeck = playerDecks.find(d => d.isMain);
      if (mainDeck) {
        setSelectedDeckId(mainDeck.id);
      } else if (playerDecks.length > 0) {
        setSelectedDeckId(playerDecks[0].id);
      } else {
        setSelectedDeckId('');
      }
    }
  }, [side, playerDecks, selectedDeckId]);

  // Auto-select opponent main deck when side changes
  React.useEffect(() => {
    const currentOpponentDeckValid = opponentDeckId && opponentDecks.some(d => d.id === opponentDeckId);

    if (!currentOpponentDeckValid) {
      const mainDeck = opponentDecks.find(d => d.isMain);
      if (mainDeck) {
        setOpponentDeckId(mainDeck.id);
      } else if (opponentDecks.length > 0) {
        setOpponentDeckId(opponentDecks[0].id);
      } else {
        setOpponentDeckId('');
      }
    }
  }, [side, opponentDecks, opponentDeckId]);

  const href = `/play/bot/match?as=${side}&d=${difficulty}&deck=${selectedDeckId}&opponentDeck=${opponentDeckId}`;

  const difficultyInfo = {
    easy: { color: "bg-green-500", description: "Perfect for beginners", rating: "800-1200" },
    normal: { color: "bg-blue-500", description: "Balanced challenge", rating: "1200-1600" },
    hard: { color: "bg-red-500", description: "Expert level play", rating: "1600-2000" }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          Play vs Bot
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Challenge our AI opponents and improve your skills. Choose your settings and start playing immediately.
        </p>
      </div>

      {/* Setup Options */}
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Choose Your Side
            </CardTitle>
            <CardDescription>Select which color you&apos;d like to play as</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={side === 'w' ? 'default' : 'outline'}
                onClick={() => setSide('w')}
                className="flex-1"
              >
                <div className="w-4 h-4 bg-white border-2 border-gray-800 rounded mr-2"></div>
                Play as White
              </Button>
              <Button
                variant={side === 'b' ? 'default' : 'outline'}
                onClick={() => setSide('b')}
                className="flex-1"
              >
                <div className="w-4 h-4 bg-gray-800 rounded mr-2"></div>
                Play as Black
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Difficulty Level
            </CardTitle>
            <CardDescription>Choose the AI strength that matches your skill level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['easy', 'normal', 'hard'] as const).map(d => (
                <div
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    difficulty === d
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold capitalize">{d}</span>
                      <Badge className={`${difficultyInfo[d].color} text-white`}>
                        {difficultyInfo[d].rating}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {difficultyInfo[d].description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5" />
              Choose Your Army
            </CardTitle>
            <CardDescription>Select which deck you&apos;d like to use for this match</CardDescription>
          </CardHeader>
          <CardContent>
            {playerDecks.length > 0 ? (
              <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a deck..." />
                </SelectTrigger>
                <SelectContent>
                  {playerDecks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      <div className="flex items-center gap-2">
                        <span>{deck.name}</span>
                        {deck.isMain && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No decks available for {side === 'w' ? 'White' : 'Black'}.</p>
                <p className="text-sm mt-1">
                  Visit the <Link href="/army-builder" className="text-primary hover:underline">Army Builder</Link> to create your first deck.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opponent Army Selection */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Choose Opponent Army
            </CardTitle>
            <CardDescription>Select which deck the bot will use against you</CardDescription>
          </CardHeader>
          <CardContent>
            {opponentDecks.length > 0 ? (
              <Select value={opponentDeckId} onValueChange={setOpponentDeckId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select opponent deck..." />
                </SelectTrigger>
                <SelectContent>
                  {opponentDecks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      <div className="flex items-center gap-2">
                        <span>{deck.name}</span>
                        {deck.isMain && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No decks available for {side === 'w' ? 'Black' : 'White'}.</p>
                <p className="text-sm mt-1">
                  Visit the <Link href="/army-builder" className="text-primary hover:underline">Army Builder</Link> to create opponent decks.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start Game Button */}
        <div className="text-center">
          <Link href={href}>
            <Button
              size="lg"
              className="px-8 py-4 text-lg gradient-card text-white border-0 hover:scale-105 transition-transform"
              disabled={(playerDecks.length > 0 && !selectedDeckId) || (opponentDecks.length > 0 && !opponentDeckId)}
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Game
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}