import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GRID_SIZE = 15;
const CELL_SIZE = 30;

const generateMaze = () => {
  const maze = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
  
  // Add trees to create a maze-like structure
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (i % 2 === 1 && j % 2 === 1) {
        maze[i][j] = 1; // Place a tree
      }
    }
  }

  // Create paths
  for (let i = 1; i < GRID_SIZE - 1; i += 2) {
    for (let j = 1; j < GRID_SIZE - 1; j += 2) {
      const direction = Math.floor(Math.random() * 4);
      if (direction === 0 && i > 1) maze[i-1][j] = 1;
      if (direction === 1 && i < GRID_SIZE - 2) maze[i+1][j] = 1;
      if (direction === 2 && j > 1) maze[i][j-1] = 1;
      if (direction === 3 && j < GRID_SIZE - 2) maze[i][j+1] = 1;
    }
  }

  // Ensure start and end are clear
  maze[0][0] = 0;
  maze[GRID_SIZE-1][GRID_SIZE-1] = 0;

  return maze;
};

const SlothRescueGame = () => {
  const [maze, setMaze] = useState(generateMaze());
  const [slothPosition, setSlothPosition] = useState({ x: 0, y: 0 });
  const [babyPosition] = useState({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 });
  const [monkeys, setMonkeys] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);

  const moveSloth = useCallback((dx, dy) => {
    setSlothPosition(prev => {
      const newX = Math.max(0, Math.min(GRID_SIZE - 1, prev.x + dx));
      const newY = Math.max(0, Math.min(GRID_SIZE - 1, prev.y + dy));
      if (maze[newY][newX] === 0) {
        return { x: newX, y: newY };
      }
      return prev;
    });
  }, [maze]);

  const handleKeyDown = useCallback((e) => {
    if (gameOver || gameWon) return;
    
    switch (e.key) {
      case 'ArrowUp': moveSloth(0, -1); break;
      case 'ArrowDown': moveSloth(0, 1); break;
      case 'ArrowLeft': moveSloth(-1, 0); break;
      case 'ArrowRight': moveSloth(1, 0); break;
      case ' ': moveSloth(1, -1); break; // Diagonal jump
      default: break;
    }
  }, [gameOver, gameWon, moveSloth]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameOver || gameWon) return;

      // Move monkeys down
      setMonkeys(prev => prev.map(monkey => {
        const newY = monkey.y + 1;
        return maze[newY] && maze[newY][monkey.x] === 0 ? { ...monkey, y: newY } : null;
      }).filter(Boolean));

      // Add new monkey
      if (Math.random() < 0.1) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        if (maze[0][x] === 0) {
          setMonkeys(prev => [...prev, { x, y: 0 }]);
        }
      }

      // Check collisions
      if (monkeys.some(monkey => monkey.x === slothPosition.x && monkey.y === slothPosition.y)) {
        setGameOver(true);
      }

      // Check win condition
      if (slothPosition.x === babyPosition.x && slothPosition.y === babyPosition.y) {
        setGameWon(true);
      }

      setScore(prev => prev + 1);
    }, 500);

    return () => clearInterval(gameLoop);
  }, [slothPosition, monkeys, gameOver, gameWon, maze, babyPosition.x, babyPosition.y]);

  const resetGame = () => {
    setMaze(generateMaze());
    setSlothPosition({ x: 0, y: 0 });
    setMonkeys([]);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100">
      <h1 className="text-3xl font-bold mb-4">Sloth Rescue Game</h1>
      <div className="mb-4">Score: {score}</div>
      <div 
        className="relative"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          backgroundColor: '#4a8c3c',
          border: '2px solid #2c5a21'
        }}
      >
        {maze.map((row, y) => 
          row.map((cell, x) => (
            cell === 1 && (
              <div
                key={`${x}-${y}`}
                className="absolute bg-brown-800"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE
                }}
              >
                🌳
              </div>
            )
          ))
        )}

        {/* Sloth */}
        <div
          className="absolute bg-brown-500 rounded-full flex items-center justify-center"
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: slothPosition.x * CELL_SIZE,
            top: slothPosition.y * CELL_SIZE,
            transition: 'all 0.2s'
          }}
        >
          🦥
        </div>

        {/* Baby Sloth */}
        <div
          className="absolute bg-brown-300 rounded-full flex items-center justify-center"
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: babyPosition.x * CELL_SIZE,
            top: babyPosition.y * CELL_SIZE
          }}
        >
          🍼
        </div>

        {/* Monkeys */}
        {monkeys.map((monkey, index) => (
          <div
            key={index}
            className="absolute bg-brown-700 rounded-full flex items-center justify-center"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: monkey.x * CELL_SIZE,
              top: monkey.y * CELL_SIZE
            }}
          >
            🐒
          </div>
        ))}
      </div>

      {(gameOver || gameWon) && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{gameWon ? 'Congratulations!' : 'Game Over'}</AlertTitle>
          <AlertDescription>
            {gameWon ? 'You saved the baby sloth!' : 'You were caught by a monkey.'}
            <br />
            Your score: {score}
          </AlertDescription>
          <button 
            onClick={resetGame}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Play Again
          </button>
        </Alert>
      )}

      <div className="mt-4 text-sm">
        Use arrow keys to move, space to jump diagonally. Navigate through the trees, avoid monkeys, and reach the baby sloth!
      </div>
    </div>
  );
};

export default SlothRescueGame;