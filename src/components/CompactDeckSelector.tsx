"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditorStore } from "@/lib/store/editor";
import { type ArmyDeck } from "@/lib/chess/deckSystem";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  X,
  Target
} from "lucide-react";

interface CompactDeckSelectorProps {
  playerLevel: number;
}

export default function CompactDeckSelector({ playerLevel }: CompactDeckSelectorProps) {
  const color = useEditorStore((s) => s.color);
  const currentDeck = useEditorStore((s) => s.currentDeck);
  const budget = useEditorStore((s) => s.budget);
  const validation = useEditorStore((s) => s.validation);
  const getDecksForColor = useEditorStore((s) => s.getDecksForColor);
  const createDeck = useEditorStore((s) => s.createDeck);
  const deleteDeck = useEditorStore((s) => s.deleteDeck);
  const switchToDeck = useEditorStore((s) => s.switchToDeck);
  const duplicateDeck = useEditorStore((s) => s.duplicateDeck);
  const initializeForLevel = useEditorStore((s) => s.initializeForLevel);
  const clear = useEditorStore((s) => s.clear);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  // Initialize budget for player level
  React.useEffect(() => {
    initializeForLevel(playerLevel);
  }, [playerLevel, initializeForLevel]);

  const decks = getDecksForColor(color);

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    
    createDeck(newDeckName.trim());
    setNewDeckName("");
    setShowCreateForm(false);
  };

  const handleDuplicate = () => {
    if (!currentDeck) return;
    duplicateDeck(currentDeck.id, `${currentDeck.name} (Copy)`);
  };

  const handleDelete = () => {
    if (!currentDeck || decks.length <= 1) return;
    deleteDeck(currentDeck.id);
  };

  const getDeckStats = (deck: ArmyDeck) => {
    const pieces = Object.values(deck.placed).filter(p => p?.color === color);
    const totalCost = pieces.reduce((sum, piece) => {
      if (!piece) return sum;
      const costs = { p: 1, n: 3, b: 3, r: 5, q: 8, k: 0 };
      return sum + (costs[piece.type] || 0);
    }, 0);
    
    return {
      pieceCount: pieces.length,
      totalCost,
      isValid: totalCost <= budget && pieces.some(p => p?.type === 'k')
    };
  };

  return (
    <div className="space-y-3">
      {/* Deck Selector Row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Deck:</span>
          <Select value={currentDeck?.id || ""} onValueChange={switchToDeck}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select deck..." />
            </SelectTrigger>
            <SelectContent>
              {decks.map((deck) => {
                const stats = getDeckStats(deck);
                return (
                  <SelectItem key={deck.id} value={deck.id}>
                    <div className="flex items-center gap-2">
                      <span>{deck.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        stats.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {stats.totalCost}/{budget}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCreateForm(true)}
            className="h-8 px-2"
            title="Create new deck"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDuplicate}
            disabled={!currentDeck}
            className="h-8 px-2"
            title="Clone current deck"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={!currentDeck || decks.length <= 1}
            className="h-8 px-2 text-red-500 hover:text-red-700"
            title="Delete current deck"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Create New Deck Form */}
      {showCreateForm && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed bg-muted/50">
          <Input
            placeholder="New deck name..."
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            className="h-8 flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateDeck();
              if (e.key === 'Escape') setShowCreateForm(false);
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleCreateDeck} disabled={!newDeckName.trim()} className="h-8">
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowCreateForm(false)} className="h-8">
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Budget and Controls Row */}
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-medium">Budget: {budget} points</span>
            <span className="text-muted-foreground">
              (Level {playerLevel}{playerLevel < 13 ? ` +${playerLevel - 1}` : ' max'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Remaining:</span>
            <span className={`font-semibold ${validation.remaining >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {validation.remaining}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => clear()}>
          Clear Army
        </Button>
      </div>
    </div>
  );
}
