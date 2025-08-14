"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditorStore } from "@/lib/store/editor";
import { useNotificationStore } from "@/lib/store/notifications";
import { type ArmyDeck } from "@/lib/chess/deckSystem";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Target,
  Save,
  Star
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
  const saveDeck = useEditorStore((s) => s.saveDeck);
  const setMainDeck = useEditorStore((s) => s.setMainDeck);

  const addNotification = useNotificationStore((s) => s.addNotification);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [showCloneConfirm, setShowCloneConfirm] = useState(false);

  // Initialize budget for player level
  React.useEffect(() => {
    initializeForLevel(playerLevel);
  }, [playerLevel, initializeForLevel]);

  const decks = getDecksForColor(color);

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;

    const newDeckId = createDeck(newDeckName.trim());
    console.log("Created new deck:", newDeckId);
    setNewDeckName("");
    setShowCreateForm(false);

    addNotification({
      type: "success",
      message: `Deck "${newDeckName.trim()}" created successfully!`,
      duration: 3000,
    });
  };

  const handleDuplicate = () => {
    if (!currentDeck) return;
    const newDeckId = duplicateDeck(currentDeck.id, `${currentDeck.name} (Copy)`);
    addNotification({
      type: "success",
      message: `Deck "${currentDeck.name}" was cloned successfully!`,
      duration: 3000,
    });
  };

  const handleCloneClick = () => {
    setShowCloneConfirm(true);
  };

  const handleDelete = () => {
    if (!currentDeck || decks.length <= 1) return;
    deleteDeck(currentDeck.id);
  };

  const handleDeckChange = (deckId: string) => {
    switchToDeck(deckId);
  };

  const handleSave = () => {
    if (!currentDeck) return;
    saveDeck();
    addNotification({
      type: "success",
      message: `Deck "${currentDeck.name}" saved successfully!`,
      duration: 3000,
    });
  };

  const handleSetMain = () => {
    if (!currentDeck) return;
    setMainDeck(currentDeck.id);
    addNotification({
      type: "success",
      message: `"${currentDeck.name}" set as main deck for ${color === 'w' ? 'White' : 'Black'}!`,
      duration: 3000,
    });
  };

  const getDeckStats = (deck: ArmyDeck) => {
    const pieces = Object.values(deck.placed).filter(p => p?.color === color);
    const totalCost = pieces.reduce((sum, piece) => {
      if (!piece) return sum;
      const costs = {
        // Standard pieces
        p: 1, n: 3, b: 3, r: 5, q: 8, k: 0,
        // Custom pieces
        l: 6, s: 2, d: 8, c: 5, e: 4, w: 7, a: 3, h: 5, m: 4, t: 7
      };
      return sum + (costs[piece.type as keyof typeof costs] || 0);
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
          <Select value={currentDeck?.id || ""} onValueChange={handleDeckChange}>
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
                      {deck.isMain && (
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      )}
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
            onClick={handleSave}
            disabled={!currentDeck}
            className="h-8 px-2"
            title="Save current deck"
          >
            <Save className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSetMain}
            disabled={!currentDeck || currentDeck.isMain}
            className="h-8 px-2 text-yellow-600 hover:text-yellow-700"
            title="Set as main deck"
          >
            <Star className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCloneClick}
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
        <Button variant="outline" size="sm" onClick={() => {
          clear();
          addNotification({
            type: "success",
            message: "Army cleared successfully!",
            duration: 2000,
          });
        }}>
          Clear Army
        </Button>
      </div>

      {/* Clone Confirmation Dialog */}
      <ConfirmDialog
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        title="Clone Deck"
        description={`Are you sure you want to clone "${currentDeck?.name}"? This will create a copy of the deck.`}
        confirmText="Clone"
        cancelText="Cancel"
        onConfirm={handleDuplicate}
      />
    </div>
  );
}
