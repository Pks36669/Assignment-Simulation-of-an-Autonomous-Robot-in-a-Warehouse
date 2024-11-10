import pygame
import math
import time
from typing import Tuple

class WarehouseRobot:
    def __init__(self, start: Tuple[int, int], target: Tuple[int, int]):
        # Initialize Pygame
        pygame.init()
        
        # Constants
        self.WAREHOUSE_SIZE = (1000, 1000)  # 10m x 10m (100 pixels = 1 meter)
        self.ROBOT_SIZE = 30
        self.SPEED = 10  # 0.1 m/s * 100 pixels/meter
        self.MOVE_TIME = 0.1  # seconds
        self.STOP_TIME = 2  # seconds
        
        # Set up display
        self.screen = pygame.display.set_mode(self.WAREHOUSE_SIZE)
        pygame.display.set_caption("Warehouse Robot Simulation")
        
        # Robot properties
        self.position = [start[0] * 100, start[1] * 100]  # Convert to pixels
        self.target = [target[0] * 100, target[1] * 100]  # Convert to pixels
        self.path = []
        
        # Colors
        self.WHITE = (255, 255, 255)
        self.BLACK = (0, 0, 0)
        self.RED = (255, 0, 0)
        self.GREEN = (0, 255, 0)
        self.BLUE = (0, 0, 255)
        
    def calculate_movement(self) -> Tuple[float, float]:
        dx = self.target[0] - self.position[0]
        dy = self.target[1] - self.position[1]
        distance = math.sqrt(dx**2 + dy**2)
        
        if distance == 0:
            return 0, 0
            
        move_x = (dx / distance) * self.SPEED
        move_y = (dy / distance) * self.SPEED
        
        return move_x, move_y
        
    def update_position(self, move_x: float, move_y: float):
        new_x = self.position[0] + move_x
        new_y = self.position[1] + move_y
        
        # Keep robot within boundaries
        new_x = max(0, min(new_x, self.WAREHOUSE_SIZE[0] - self.ROBOT_SIZE))
        new_y = max(0, min(new_y, self.WAREHOUSE_SIZE[1] - self.ROBOT_SIZE))
        
        self.position = [new_x, new_y]
        self.path.append((new_x + self.ROBOT_SIZE/2, new_y + self.ROBOT_SIZE/2))
        
    def draw(self):
        # Clear screen
        self.screen.fill(self.WHITE)
        
        # Draw grid (1m spacing)
        for x in range(0, self.WAREHOUSE_SIZE[0], 100):
            pygame.draw.line(self.screen, (200, 200, 200), (x, 0), (x, self.WAREHOUSE_SIZE[1]))
        for y in range(0, self.WAREHOUSE_SIZE[1], 100):
            pygame.draw.line(self.screen, (200, 200, 200), (0, y), (self.WAREHOUSE_SIZE[0], y))
        
        # Draw path
        if len(self.path) > 1:
            pygame.draw.lines(self.screen, self.BLUE, False, self.path, 2)
        
        # Draw target
        pygame.draw.circle(self.screen, self.GREEN, 
                         (self.target[0] + self.ROBOT_SIZE/2, 
                          self.target[1] + self.ROBOT_SIZE/2), 15)
        
        # Draw robot
        pygame.draw.rect(self.screen, self.RED, 
                        (self.position[0], self.position[1], 
                         self.ROBOT_SIZE, self.ROBOT_SIZE))
        
        pygame.display.flip()
        
    def run(self):
        running = True
        clock = pygame.time.Clock()
        last_move_time = time.time()
        is_moving = True
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                    
            current_time = time.time()
            
            # Check if we reached the target
            distance_to_target = math.sqrt(
                (self.target[0] - self.position[0])**2 + 
                (self.target[1] - self.position[1])**2
            )
            
            if distance_to_target < self.SPEED:
                self.position = self.target.copy()
                self.draw()
                continue
                
            # Handle movement and stopping cycles
            if is_moving:
                if current_time - last_move_time <= self.MOVE_TIME:
                    move_x, move_y = self.calculate_movement()
                    self.update_position(move_x, move_y)
                else:
                    is_moving = False
                    last_move_time = current_time
            else:
                if current_time - last_move_time >= self.STOP_TIME:
                    is_moving = True
                    last_move_time = current_time
                    
            self.draw()
            clock.tick(60)
            
        pygame.quit()

if __name__ == "__main__":
    # Create and run simulation
    robot = WarehouseRobot((0, 0), (7, 9))
    robot.run()