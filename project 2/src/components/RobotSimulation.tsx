import React, { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

const WAREHOUSE_SIZE = 500;
const ROBOT_SIZE = 30;
const SPEED = 5;
const MOVE_TIME = 100; // 0.1 seconds in ms
const STOP_TIME = 2000; // 2 seconds in ms

export const RobotSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [path, setPath] = useState<Position[]>([{ x: 0, y: 0 }]);
  const [isMoving, setIsMoving] = useState(true);
  const target: Position = { x: (7 * WAREHOUSE_SIZE) / 10, y: (9 * WAREHOUSE_SIZE) / 10 };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e5e7eb';
    for (let i = 0; i <= 10; i++) {
      const pos = (i * WAREHOUSE_SIZE) / 10;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, WAREHOUSE_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(WAREHOUSE_SIZE, pos);
      ctx.stroke();
    }
  };

  const drawPath = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    path.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x + ROBOT_SIZE / 2, point.y + ROBOT_SIZE / 2);
      } else {
        ctx.lineTo(point.x + ROBOT_SIZE / 2, point.y + ROBOT_SIZE / 2);
      }
    });
    ctx.stroke();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, WAREHOUSE_SIZE, WAREHOUSE_SIZE);

    // Draw grid
    drawGrid(ctx);

    // Draw path
    drawPath(ctx);

    // Draw target
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(
      target.x + ROBOT_SIZE / 2,
      target.y + ROBOT_SIZE / 2,
      ROBOT_SIZE / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw robot
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(position.x, position.y, ROBOT_SIZE, ROBOT_SIZE);
  };

  const calculateMovement = (): Position => {
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { x: 0, y: 0 };

    const moveX = (dx / distance) * SPEED;
    const moveY = (dy / distance) * SPEED;

    return { x: moveX, y: moveY };
  };

  const updatePosition = (movement: Position) => {
    const newX = Math.max(
      0,
      Math.min(position.x + movement.x, WAREHOUSE_SIZE - ROBOT_SIZE)
    );
    const newY = Math.max(
      0,
      Math.min(position.y + movement.y, WAREHOUSE_SIZE - ROBOT_SIZE)
    );

    setPosition({ x: newX, y: newY });
    setPath((prev) => [...prev, { x: newX, y: newY }]);
  };

  useEffect(() => {
    let moveInterval: NodeJS.Timeout;
    let stopTimeout: NodeJS.Timeout;

    const animate = () => {
      if (isMoving) {
        const movement = calculateMovement();
        const distance = Math.sqrt(
          Math.pow(target.x - position.x, 2) + Math.pow(target.y - position.y, 2)
        );

        if (distance < SPEED) {
          setPosition({ x: target.x, y: target.y });
        } else {
          updatePosition(movement);
        }

        stopTimeout = setTimeout(() => {
          setIsMoving(false);
          moveInterval = setTimeout(() => {
            setIsMoving(true);
          }, STOP_TIME);
        }, MOVE_TIME);
      }
    };

    const frameId = requestAnimationFrame(animate);
    draw();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(stopTimeout);
      clearTimeout(moveInterval);
    };
  }, [position, isMoving]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Warehouse Robot Simulation
        </h1>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={WAREHOUSE_SIZE}
            height={WAREHOUSE_SIZE}
            className="bg-white"
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Robot Status: {isMoving ? 'Moving' : 'Stopped'}</p>
          <p>
            Position: ({(position.x / WAREHOUSE_SIZE * 10).toFixed(1)}m,{' '}
            {(position.y / WAREHOUSE_SIZE * 10).toFixed(1)}m)
          </p>
        </div>
      </div>
    </div>
  );
};