let capture;
let poseNet;
let poses = [];
let questions = [
  { text: "1. 教育科技學系主要是訓練學生成為學校教師，因此課程以教學法與教育心理為主。", answer: "❌" },
  { text: "2. 教育科技學系的學生需要學習如何使用多媒體工具，例如影像剪輯、簡報設計與網頁製作。", answer: "✅" },
  { text: "3. 教育科技學系的學生畢業後大多進入學校當老師，極少進入企業或數位內容產業。", answer: "❌" },
  { text: "4. 虛擬實境（VR）與人工智慧（AI）是教育科技學系可能涉及的教學科技應用領域之一。", answer: "✅" },
  { text: "5. 教育科技學系的課程不需要任何技術操作能力，只要理解教育理論即可。", answer: "❌" }
];
let currentQuestionIndex = 0;
let fingerX, fingerY;
let canAnswer = true; // 控制是否可以回答問題
let answerDelay = 2000; // 回答後的延遲時間（毫秒）
let feedbackMessage = ""; // 用於顯示答對或答錯的訊息
let feedbackColor = ""; // 訊息的顏色
let showFeedback = false; // 是否顯示訊息
let feedbackTimeout; // 訊息顯示的計時器

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#bde0fe');
  capture = createCapture(VIDEO);
  capture.size(windowWidth * 0.8, windowHeight * 0.8);
  capture.hide(); // 隱藏原始的攝影機影像

  // Initialize PoseNet
  poseNet = ml5.poseNet(capture, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });

  // Initialize finger position
  fingerX = windowWidth / 2;
  fingerY = windowHeight / 2;
}

function modelReady() {
  console.log("PoseNet is ready!");
}

function draw() {
  background('#bde0fe');

  // Display camera feed
  if (capture.loadedmetadata) {
    push();
    translate(windowWidth / 2, windowHeight / 2);
    scale(-1, 1); // 水平翻轉影像
    image(capture, -capture.width / 2, -capture.height / 2, capture.width, capture.height);
    pop();
  } else {
    console.log("Camera feed not ready yet.");
  }

  // Display question number
  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(`題目 ${currentQuestionIndex + 1} / ${questions.length}`, windowWidth / 2, 20);

  // Display current question
  textSize(24);
  text(questions[currentQuestionIndex].text, windowWidth / 2, 50);

  // Draw option boxes
  drawOptionBoxes();

  // 顯示答對或答錯的訊息
  if (showFeedback) {
    fill(feedbackColor);
    textSize(48);
    textAlign(CENTER, CENTER);
    text(feedbackMessage, windowWidth / 2, windowHeight / 2);
    return; // 暫停其他邏輯，直到訊息顯示完
  }

  // Update finger position based on PoseNet
  if (poses.length > 0) {
    let pose = poses[0].pose;
    let rightWrist = pose.keypoints.find(k => k.part === "rightWrist"); // 偵測右手腕
    if (rightWrist && rightWrist.score > 0.5) {
      fingerX = rightWrist.position.x;
      fingerY = rightWrist.position.y;
    }
  }

  // Simulate finger movement
  fill(255, 0, 0);
  ellipse(fingerX, fingerY, 20, 20); // 顯示食指位置

  // Check if finger is on the left or right side
  if (canAnswer) {
    if (fingerX < windowWidth / 3) {
      checkAnswer("❌");
    } else if (fingerX > (2 * windowWidth) / 3) {
      checkAnswer("✅");
    }
  }
}

function drawOptionBoxes() {
  // Left box for ❌
  fill('#ffcccc');
  rect(0, windowHeight / 2 - 50, windowWidth / 6, 100);
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("❌", windowWidth / 12, windowHeight / 2);

  // Right box for ✅
  fill('#ccffcc');
  rect(windowWidth - windowWidth / 6, windowHeight / 2 - 50, windowWidth / 6, 100);
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("✅", windowWidth - windowWidth / 12, windowHeight / 2);
}

function checkAnswer(userAnswer) {
  if (!canAnswer) return; // 防止重複回答

  // 判斷答案是否正確
  if (userAnswer === questions[currentQuestionIndex].answer) {
    feedbackMessage = "答對了！";
    feedbackColor = "green";
  } else {
    feedbackMessage = "答錯了！";
    feedbackColor = "red";
  }

  // 顯示訊息
  showFeedback = true;
  canAnswer = false;

  // 設置計時器，延遲切換到下一題
  feedbackTimeout = setTimeout(() => {
    showFeedback = false; // 隱藏訊息
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      currentQuestionIndex = 0; // Restart the game
    }

    // Reset finger position and allow answering again
    fingerX = windowWidth / 2;
    fingerY = windowHeight / 2;
    canAnswer = true;
  }, answerDelay);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  capture.size(windowWidth * 0.8, windowHeight * 0.8);

  // Reset finger position on resize
  fingerX = windowWidth / 2;
  fingerY = windowHeight / 2;
}
