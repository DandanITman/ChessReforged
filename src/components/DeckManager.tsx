"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useEditorStore } from "@/lib/store/editor";
import { type ArmyDeck } from "@/lib/chess/deckSystem";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Check, 
  X, 
  Calendar,
  Target,
  Crown,
  Sword
} from "lucide-react";

interface DeckManagerProps {
  playerLevel: number;
}

export default function DeckManager({ playerLevel }: DeckManagerProps) {
  const color = useEditorStore((s) => s.color);
  const currentDeck = useEditorStore((s) => s.currentDeck);
  const budget = useEditorStore((s) => s.budget);
  const getDecksForColor = useEditorStore((s) => s.getDecksForColor);
  const createDeck = useEditorStore((s) => s.createDeck);
  const deleteDeck = useEditorStore((s) => s.deleteDeck);
  const switchToDeck = useEditorStore((s) => s.switchToDeck);
  const renameDeck = useEditorStore((s) => s.renameDeck);
  const duplicateDeck = useEditorStore((s) => s.duplicateDeck);
  const initializeForLevel = useEditorStore((s) => s.initializeForLevel);

  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");

  // Initialize budget for player level
  React.useEffect(() => {
    initializeForLevel(playerLevel);
  }, [playerLevel, initializeForLevel]);

  const decks = getDecksForColor(color);

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    
    createDeck(newDeckName.trim(), newDeckDescription.trim() || undefined);
    setNewDeckName("");
    setNewDeckDescription("");
    setShowCreateForm(false);
  };

  const handleStartEdit = (deck: ArmyDeck) => {
    setEditingDeckId(deck.id);
    setEditName(deck.name);
    setEditDescription(deck.description);
  };

  const handleSaveEdit = () => {
    if (!editingDeckId || !editName.trim()) return;
    
    renameDeck(editingDeckId, editName.trim(), editDescription.trim());
    setEditingDeckId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleCancelEdit = () => {
    setEditingDeckId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleDuplicate = (deckId: string) => {
    const sourceDeck = decks.find(d => d.id === deckId);
    if (sourceDeck) {
      duplicateDeck(deckId, `${sourceDeck.name} (Copy)`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
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
    <div className="space-y-4">
      {/* Header with Budget Info */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-medium">Budget: {budget} points</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Level {playerLevel} {playerLevel < 13 ? `(+${playerLevel - 1} bonus)` : "(max bonus)"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{color === 'w' ? 'White' : 'Black'} Armies</span>
        </div>
      </div>

      {/* Current Deck Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Active Deck</label>
        <Select value={currentDeck?.id || ""} onValueChange={switchToDeck}>
          <SelectTrigger>
            <SelectValue placeholder="Select a deck..." />
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

      {/* Deck Management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Deck Management</h3>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            New Deck
          </Button>
        </div>

        {/* Create New Deck Form */}
        {showCreateForm && (
          <Card className="p-3 border-dashed">
            <div className="space-y-2">
              <Input
                placeholder="Deck name..."
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="h-8"
              />
              <Input
                placeholder="Description (optional)..."
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                className="h-8"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateDeck} disabled={!newDeckName.trim()}>
                  <Check className="h-3 w-3 mr-1" />
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowCreateForm(false)}>
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Deck List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {decks.map((deck) => {
            const stats = getDeckStats(deck);
            const isEditing = editingDeckId === deck.id;
            const isCurrent = currentDeck?.id === deck.id;

            return (
              <Card key={deck.id} className={`p-3 ${isCurrent ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 font-medium"
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="h-8"
                      placeholder="Description..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit} disabled={!editName.trim()}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{deck.name}</h4>
                        {isCurrent && <Sword className="h-3 w-3 text-primary" />}
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          stats.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {stats.totalCost}/{budget}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{deck.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{stats.pieceCount} pieces</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(deck.lastModified)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(deck)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicate(deck.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {decks.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteDeck(deck.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
