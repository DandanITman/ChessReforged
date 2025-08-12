const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create pieces directory if it doesn't exist
const piecesDir = path.join(__dirname, 'public', 'pieces');

// Chess piece definitions with solid black pieces
const blackPieces = {
    // Black pieces - now completely solid and opaque
    'b-r': { symbol: '♜', fill: '#1a1a1a', stroke: '#000000', strokeWidth: 3 },
    'b-n': { symbol: '♞', fill: '#1a1a1a', stroke: '#000000', strokeWidth: 3 },
    'b-b': { symbol: '♝', fill: '#1a1a1a', stroke: '#000000', strokeWidth: 3 },
    'b-q': { symbol: '♛', fill: '#1a1a1a', stroke: '#000000', strokeWidth: 3 },
    'b-k': { symbol: '♚', fill: '#1a1a1a', stroke: '#000000', strokeWidth: 3 },
    'b-p': { symbol: '♟', fill: '#1a1a1a', stroke: '#000000', strokeWidth: 3 }
};

// Generate only black pieces with solid, opaque appearance
Object.entries(blackPieces).forEach(([name, config]) => {
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    
    // Clear background (transparent)
    ctx.clearRect(0, 0, 256, 256);
    
    // Set high-quality rendering
    ctx.antialias = 'subpixel';
    ctx.quality = 'best';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Set font - much larger for 256x256 canvas
    ctx.font = 'bold 200px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Apply styling for solid black pieces
    ctx.fillStyle = config.fill;
    ctx.strokeStyle = config.stroke;
    ctx.lineWidth = config.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Draw the piece with multiple passes for solid appearance
    const x = 128, y = 128; // Center of 256x256 canvas
    
    // Multiple fill passes for solid appearance
    ctx.fillText(config.symbol, x, y);
    ctx.fillText(config.symbol, x, y); // Second pass for solidity
    
    // Stroke for definition
    ctx.strokeText(config.symbol, x, y);
    
    // Save as PNG with maximum quality
    const buffer = canvas.toBuffer('image/png', { 
        compressionLevel: 9, 
        filters: canvas.PNG_FILTER_NONE,
        palette: undefined,
        backgroundIndex: undefined,
        resolution: 300 // High DPI
    });
    const filePath = path.join(piecesDir, `${name}.png`);
    fs.writeFileSync(filePath, buffer);
    
    console.log(`Generated solid ${name}.png (256x256)`);
});

console.log('All solid black chess piece PNGs generated successfully!');
