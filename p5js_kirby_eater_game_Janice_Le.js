let paddle;
let ball;
let obstacles = [];
let totalObstacles = 20;
let score = 0;
let gameState = "playing"; // "playing", "win", or "lose"
let restartButton;
let obstacleImages = []; // stores obstacle images
let ballImage; // ball image
let bgImage;  // background image

function preload() {
  // Load background image
  bgImage = loadImage("images/dreamsky.png");

  // Load obstacle images
  let imageFiles = [
    "images/food01.png",
    "images/food02.png",
    "images/food03.png",
    "images/food04.png",
    "images/food05.png",
    "images/food06.png",
    "images/food07.png",
    "images/food08.png"
  ];
  for (let file of imageFiles) {
    obstacleImages.push(loadImage(file));
  }

  // Load ball image
  ballImage = loadImage("images/kirby.png");
}

function setup() {
  // Fixed canvas
  createCanvas(1000, 550);
  setupGame();
}

function setupGame() {
  // Reset game state
  gameState = "playing";
  obstacles = [];
  score = 0;
  if (restartButton) restartButton.remove();

  // Paddle setup
  paddle = {
    x: width / 2,
    y: height - 30,
    w: 120,
    h: 15
  };

  // Ball setup
  ball = {
    x: width / 2,
    y: height - 60,
    r: 15,
    dx: 4,
    dy: -4,
    maxSpeed: 10,
    angle: 0,      // rotation angle of the ball
    spin: 0.2      // how fast it spins on hit
  };

  // Generate non-overlapping obstacles
  for (let i = 0; i < totalObstacles; i++) {
    let newObstacle;
    let overlapping;
    let attempts = 0;

    do {
      overlapping = false;
      newObstacle = {
        x: random(30, width - 30),
        y: random(50, 300), // upper half of canvas
        w: 50,
        h: 40,
        img: random(obstacleImages)
      };

      for (let o of obstacles) {
        if (
          abs(newObstacle.x - o.x) < (newObstacle.w + o.w) / 1.5 &&
          abs(newObstacle.y - o.y) < (newObstacle.h + o.h) / 1.5
        ) {
          overlapping = true;
          break;
        }
      }
      attempts++;
    } while (overlapping && attempts < 100);

    obstacles.push(newObstacle);
  }
}

function draw() {
  // Draw fixed-size background
  imageMode(CORNER);
  image(bgImage, 0, 0, width, height);

  // Handle end states
  if (gameState === "win") {
    showEndScreen("You Win! :D");
    return;
  } else if (gameState === "lose") {
    showEndScreen("Game Over :(");
    return;
  }

  // Paddle follows mouse
  paddle.x = constrain(mouseX, paddle.w / 2, width - paddle.w / 2);

  // Draw paddle (no outline, no rotation)
  push();
  translate(paddle.x, paddle.y);
  noStroke();
  fill(100, 200, 255);
  rectMode(CENTER);
  rect(0, 0, paddle.w, paddle.h);
  pop();

  // Ball movement
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball rotation based on movement
  ball.angle += ball.dx * 0.05;

  // Bounce off walls
  if (ball.x < ball.r || ball.x > width - ball.r) ball.dx *= -1;
  if (ball.y < ball.r) ball.dy *= -1;

  // Paddle collision (bounce the ball)
  if (
    ball.y + ball.r > paddle.y - paddle.h / 2 &&
    ball.x > paddle.x - paddle.w / 2 &&
    ball.x < paddle.x + paddle.w / 2 &&
    ball.dy > 0
  ) {
    let hitPos = (ball.x - paddle.x) / (paddle.w / 2);
    ball.dx = hitPos * ball.maxSpeed;
    ball.dy = -abs(ball.dy);
    ball.dx *= 1.05;
    ball.dy *= 1.05;
    ball.dx = constrain(ball.dx, -ball.maxSpeed, ball.maxSpeed);
    ball.dy = constrain(ball.dy, -ball.maxSpeed, -2);

    // Add rotation/spin effect
    ball.angle += hitPos * ball.spin;
  }

  // Draw spinning ball
  push();
  translate(ball.x, ball.y);
  rotate(ball.angle);
  imageMode(CENTER);
  image(ballImage, 0, 0, ball.r * 2, ball.r * 2);
  pop();

  // Draw obstacles and check collisions
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    imageMode(CENTER);
    image(o.img, o.x, o.y, o.w, o.h);

    let closestX = constrain(ball.x, o.x - o.w / 2, o.x + o.w / 2);
    let closestY = constrain(ball.y, o.y - o.h / 2, o.y + o.h / 2);
    let distance = dist(ball.x, ball.y, closestX, closestY);

    if (distance < ball.r) {
      ball.dy *= -1;
      obstacles.splice(i, 1);
      score++;
      ball.dx *= 1.01;
      ball.dy *= 1.01;
      ball.dx = constrain(ball.dx, -ball.maxSpeed, ball.maxSpeed);
      ball.dy = constrain(ball.dy, -ball.maxSpeed, ball.maxSpeed);
    }
  }

  // Display score
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);

  // Win condition
  if (obstacles.length === 0 && gameState === "playing") {
    gameState = "win";
    createRestartButton();
  }

  // Lose condition
  if (ball.y - ball.r > height) {
    gameState = "lose";
    createRestartButton();
  }
}

function showEndScreen(message) {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text(message, width / 2, height / 2 - 40);
  textSize(20);
  text("Final Score: " + score, width / 2, height / 2);
}

function createRestartButton() {
  restartButton = createButton("Play Again");
  restartButton.position(width / 2 - 50, height / 2 + 40);
  restartButton.size(100, 40);
  restartButton.style("font-size", "16px");
  restartButton.mousePressed(() => {
    setupGame();
  });
}
