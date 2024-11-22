import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

function Board() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [availableMoves, setAvailableMoves] = useState<Square[]>([]);

  // Handle piece selection when clicked
  const handlePieceClick = (piece: string, sourceSquare: Square) => {
    const currentPiece = game.get(sourceSquare);
    if (currentPiece && currentPiece.color === game.turn()) {
      setSelectedSquare(sourceSquare);
      const moves = game.moves({ square: sourceSquare, verbose: true });
      const destinations = moves.map((move) => move.to as Square);
      setAvailableMoves(destinations);
    } else {
      setSelectedSquare(null);
      setAvailableMoves([]);
    }
  };

  // Handle piece drag start
  const handlePieceDragBegin = (_piece: string, sourceSquare: Square) => {
    const piece = game.get(sourceSquare);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(sourceSquare);
      const moves = game.moves({ square: sourceSquare, verbose: true });
      const destinations = moves.map((move) => move.to as Square);
      setAvailableMoves(destinations);
    }
  };

  // Handle piece drop (either drag or click move)
  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    const moveDetails = { from: sourceSquare, to: targetSquare };

    if (availableMoves.includes(targetSquare)) {
      const piece = game.get(sourceSquare);
    
      // Normal move
      const move = game.move(moveDetails);
      if (move) setGame(new Chess(game.fen()));
    }

    // Reset selection
    setSelectedSquare(null);
    setAvailableMoves([]);
    return true;
  };



  // Highlight squares
  const customSquareStyles = availableMoves.reduce<Record<string, Record<string, string | number>>>(
    (styles, square) => {
      const piece = game.get(square);
      if (piece && piece.color !== game.turn()) {
        styles[square] = { backgroundColor: 'rgba(255, 0, 0, 0.5)' }; // Enemy pieces
      } else {
        styles[square] = { backgroundColor: 'rgba(0, 255, 0, 0.5)' }; // Empty valid squares
      }
      return styles;
    },
    {}
  );

  // Highlight selected square
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = { backgroundColor: 'rgba(0, 0, 255, 0.5)' };
  }

  const highlightKingIfInCheck = () => {
    const board = game.board();
    let checkSquareStyles: Record<string, Record<string, string>> = {};

    // If the game is in check, check for both kings independently
    if (game.inCheck()) {
      const whiteKingSquare = board
        .flat()
        .find((square) => square?.type === 'k' && square?.color === 'w')
        ?.square;

      if (whiteKingSquare && game.turn() === 'w') {
        checkSquareStyles[whiteKingSquare] = { backgroundColor: 'rgba(255, 165, 0, 0.7)' };
      }

      const blackKingSquare = board
        .flat()
        .find((square) => square?.type === 'k' && square?.color === 'b')
        ?.square;

      if (blackKingSquare && game.turn() === 'b') {
        checkSquareStyles[blackKingSquare] = { backgroundColor: 'rgba(255, 165, 0, 0.7)' };
      }
    }

    return checkSquareStyles;
  };

  // Merge styles: highlight squares for valid moves, selected square, and the king's square in check
  const finalSquareStyles = {
    ...customSquareStyles,
    ...highlightKingIfInCheck(),  // Check if any king is in check and highlight accordingly
  };

  // Handle click on highlighted squares to move the piece
  const handleSquareClick = (targetSquare: Square) => {
    if (availableMoves.includes(targetSquare) && selectedSquare) {
      handlePieceDrop(selectedSquare, targetSquare); // Move piece on click
    }
  };

  return (
    <div>
      <h1>Chess Game</h1>
      <Chessboard
        position={game.fen()}
        boardWidth={500}
        onPieceClick={handlePieceClick}
        onPieceDragBegin={handlePieceDragBegin}
        onPieceDrop={handlePieceDrop}
        customSquareStyles={finalSquareStyles}
        onSquareClick={handleSquareClick} // Allow move by clicking highlighted squares
      />
    </div>
  );
}

export default Board;
