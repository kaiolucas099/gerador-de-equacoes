const TOTAL_QUESTIONS = 10;
const equationEl = document.querySelector('#equation');
const answersEl = document.querySelector('#answers');
const feedbackEl = document.querySelector('#feedback');
const scoreEl = document.querySelector('#score');
const streakEl = document.querySelector('#streak');
const questionNumberEl = document.querySelector('#question-number');
const progressFillEl = document.querySelector('#progress-fill');
const progressTrackEl = document.querySelector('#progress-track');
const levelNameEl = document.querySelector('#level-name');
const resultScreen = document.querySelector('#result-screen');

let questionIndex = 0;
let score = 0;
let streak = 0;
let currentAnswer = 0;
let locked = false;
let advanceTimer;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createQuestion() {
  // Equações lineares simples: a*x + b = c, com solução inteira positiva.
  const answer = randomInt(2, 15);
  const coefficient = randomInt(1, 5);
  const offset = randomInt(1, 12);
  const result = coefficient * answer + offset;
  const left = coefficient === 1 ? 'x' : coefficient + 'x';
  return { text: `${left} + ${offset} = ${result}`, answer };
}

function createOptions(correct) {
  const options = new Set([correct]);
  while (options.size < 4) {
    const variation = randomInt(1, 7) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = correct + variation;
    if (candidate > 0) options.add(candidate);
  }
  return [...options].sort(() => Math.random() - 0.5);
}

function renderQuestion() {
  locked = false;
  const question = createQuestion();
  currentAnswer = question.answer;
  equationEl.textContent = question.text;
  questionNumberEl.textContent = String(questionIndex + 1).padStart(2, '0');
  levelNameEl.textContent = questionIndex < 3 ? 'NÍVEL 01 · INICIANTE' : questionIndex < 7 ? 'NÍVEL 02 · INTERMEDIÁRIO' : 'NÍVEL 03 · DESAFIO';
  const progress = (questionIndex / TOTAL_QUESTIONS) * 100;
  progressFillEl.style.width = progress + '%';
  progressTrackEl.setAttribute('aria-valuenow', String(questionIndex));
  feedbackEl.textContent = 'Escolha uma das quatro alternativas acima.';
  feedbackEl.className = 'feedback';
  answersEl.replaceChildren();

  createOptions(currentAnswer).forEach((value, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-btn';
    button.dataset.answer = String(value);
    button.setAttribute('aria-label', `Alternativa ${String.fromCharCode(65 + index)}: ${value}`);
    const letter = document.createElement('span');
    letter.className = 'answer-letter';
    letter.textContent = String.fromCharCode(65 + index);
    const answerText = document.createElement('span');
    answerText.textContent = String(value);
    button.append(letter, answerText);
    button.addEventListener('click', () => chooseAnswer(button, value));
    answersEl.append(button);
  });
}

function chooseAnswer(selectedButton, value) {
  if (locked) return;
  locked = true;
  const buttons = [...answersEl.querySelectorAll('button')];
  buttons.forEach(button => {
    button.disabled = true;
    if (Number(button.dataset.answer) === currentAnswer) button.classList.add('correct');
  });

  if (value === currentAnswer) {
    score += 10;
    streak += 1;
    feedbackEl.textContent = '✓ Isso aí! Resposta correta. Próxima questão...';
    feedbackEl.className = 'feedback success';
  } else {
    streak = 0;
    selectedButton.classList.add('wrong');
    feedbackEl.textContent = `Quase! A resposta certa é ${currentAnswer}. Vamos para a próxima!`;
    feedbackEl.className = 'feedback error';
  }

  scoreEl.textContent = String(score);
  streakEl.textContent = String(streak);
  advanceTimer = window.setTimeout(() => {
    questionIndex += 1;
    if (questionIndex >= TOTAL_QUESTIONS) finishGame();
    else renderQuestion();
  }, 1100);
}

function finishGame() {
  progressFillEl.style.width = '100%';
  progressTrackEl.setAttribute('aria-valuenow', String(TOTAL_QUESTIONS));
  document.querySelector('#final-score').textContent = String(score);
  document.querySelector('#result-copy').textContent = `Você acertou ${score / 10} de ${TOTAL_QUESTIONS} questões e fez ${score} pontos.`;
  resultScreen.hidden = false;
}

function restartGame() {
  window.clearTimeout(advanceTimer);
  questionIndex = 0;
  score = 0;
  streak = 0;
  scoreEl.textContent = '0';
  streakEl.textContent = '0';
  resultScreen.hidden = true;
  renderQuestion();
}

document.querySelector('#restart-btn').addEventListener('click', restartGame);
document.querySelector('#year').textContent = new Date().getFullYear();
renderQuestion();
