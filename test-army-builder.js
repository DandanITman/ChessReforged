// Simple test script to verify army builder functionality
// Run this in the browser console on the editor page

console.log("Testing Army Builder functionality...");

// Test 1: Check if new decks are created empty
console.log("Test 1: Creating a new deck...");
const createButton = document.querySelector('button[title="Create new deck"]');
if (createButton) {
  createButton.click();
  setTimeout(() => {
    const nameInput = document.querySelector('input[placeholder="New deck name..."]');
    if (nameInput) {
      nameInput.value = "Test Empty Deck";
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      const confirmButton = nameInput.parentElement.querySelector('button');
      if (confirmButton) {
        confirmButton.click();
        console.log("✓ New deck created");
      }
    }
  }, 100);
} else {
  console.log("✗ Create button not found");
}

// Test 2: Check if Clear Army works
setTimeout(() => {
  console.log("Test 2: Testing Clear Army...");
  const clearButton = document.querySelector('button:contains("Clear Army")') || 
                     Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Clear Army'));
  if (clearButton) {
    clearButton.click();
    console.log("✓ Clear Army button clicked");
  } else {
    console.log("✗ Clear Army button not found");
  }
}, 1000);

// Test 3: Check piece selection and placement
setTimeout(() => {
  console.log("Test 3: Testing piece selection...");
  const pieceButtons = document.querySelectorAll('button img[alt*="Pawn"]');
  if (pieceButtons.length > 0) {
    const pawnButton = pieceButtons[0].parentElement;
    pawnButton.click();
    console.log("✓ Pawn selected");
    
    // Try to click a board square
    setTimeout(() => {
      const boardSquares = document.querySelectorAll('[role="button"][aria-label*="a2"]');
      if (boardSquares.length > 0) {
        boardSquares[0].click();
        console.log("✓ Board square clicked");
      } else {
        console.log("✗ Board square not found");
      }
    }, 100);
  } else {
    console.log("✗ Piece buttons not found");
  }
}, 2000);

console.log("Test script loaded. Results will appear above.");
