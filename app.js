const board = document.querySelector('#chessboard');
const lessonTitle = document.querySelector('#step-title');
const lessonDescription = document.querySelector('#step-description');
const notationExample = document.querySelector('#notation-example');
const notationExplanation = document.querySelector('#notation-explanation');
const lessonTip = document.querySelector('#lesson-tip');
const stepNumber = document.querySelector('#step-number');
const stepCounter = document.querySelector('#step-counter');
const previousButton = document.querySelector('#previous-step');
const nextButton = document.querySelector('#next-step');
const learnView = document.querySelector('#learn-view');
const practiceView = document.querySelector('#practice-view');
const breadcrumbCurrent = document.querySelector('#breadcrumb-current');

const initialPieces = {
  a1: '♖', b1: '♘', c1: '♗', d1: '♕', e1: '♔', f1: '♗', g1: '♘', h1: '♖',
  a2: '♙', b2: '♙', c2: '♙', d2: '♙', e2: '♙', f2: '♙', g2: '♙', h2: '♙',
  a7: '♟', b7: '♟', c7: '♟', d7: '♟', e7: '♟', f7: '♟', g7: '♟', h7: '♟',
  a8: '♜', b8: '♞', c8: '♝', d8: '♛', e8: '♚', f8: '♝', g8: '♞', h8: '♜',
};

const lessons = [
  {
    title: 'Every square\nhas a name.',
    description: 'Think of the board like a tiny map. Each square has its own address, made from a letter and a number.',
    notation: 'e4',
    explanation: 'File <strong>e</strong>, rank <strong>4</strong>',
    tip: 'Files run up and down. Ranks run side to side. Together, they name every square.',
    from: null,
    to: 'e4',
    san: 'e4',
  },
  {
    title: 'A pawn move is\njust the square.',
    description: 'When a pawn moves, we simply write down the square it lands on. No piece letter needed.',
    notation: 'e4',
    explanation: 'The pawn moves to <strong>e4</strong>',
    tip: 'Pawn moves are the simplest: write the destination square, and that’s it.',
    from: 'e2',
    to: 'e4',
    san: 'e4',
  },
  {
    title: 'Black gets a\nturn, too.',
    description: 'Black’s pawn moves the same way. In a game score, White and Black take turns on each numbered line.',
    notation: 'e5',
    explanation: 'Black’s pawn moves to <strong>e5</strong>',
    tip: 'One move number has two turns: White first, then Black. Here, that’s 1. e4 e5.',
    from: 'e7',
    to: 'e5',
    san: 'e5',
  },
  {
    title: 'Pieces get a\ncapital letter.',
    description: 'A knight moves to f3. Add its capital letter, N, before the square to tell everyone which piece moved.',
    notation: 'Nf3',
    explanation: '<strong>N</strong> for knight, then <strong>f3</strong>',
    tip: 'The knight is N (not K)—the letter K is already used by the king.',
    from: 'g1',
    to: 'f3',
    san: 'Nf3',
  },
];

const quizQuestions = [
  { san: 'e4', from: 'e2', to: 'e4', prompt: 'White plays e4. What does that tell us?', options: ['A pawn moves to e4', 'A knight moves to e4', 'The king moves to e4', 'A pawn captures on e4'], answer: 0, note: 'Right! A pawn move uses just the square it lands on.' },
  { san: 'Nf3', from: 'g1', to: 'f3', prompt: 'What does the N stand for in Nf3?', options: ['North', 'Knight', 'New move', 'Nothing—the move is a pawn move'], answer: 1, note: 'That’s it! N is for knight. The king gets the letter K.' },
  { san: 'Bxc6+', from: 'b5', to: 'c6', prompt: 'What does the x tell us in Bxc6+?', options: ['The bishop is captured', 'The bishop captures a piece on c6', 'The bishop gives up its turn', 'The king castles'], answer: 1, note: 'Exactly! The x means the bishop captures on c6.' },
  { san: 'O-O', from: 'e1', to: 'g1', prompt: 'What does O-O mean?', options: ['A pawn moves two squares', 'The king is in check', 'White castles kingside', 'The game is over'], answer: 2, note: 'You’ve got it! O-O is kingside castling.' },
];

let lessonIndex = 0;
let quizIndex = 0;
let quizScore = 0;
let answered = false;

function squareName(fileIndex, rank) {
  return `${String.fromCharCode(97 + fileIndex)}${rank}`;
}

function piecesAt(index) {
  const pieces = { ...initialPieces };
  const moves = lessons.slice(1, index + 1);
  for (const move of moves) {
    const piece = pieces[move.from];
    delete pieces[move.from];
    pieces[move.to] = piece;
  }
  return pieces;
}

function renderBoard(target, pieces, lastMove = null) {
  target.replaceChildren();
  for (let row = 0; row < 8; row += 1) {
    const rank = 8 - row;
    for (let file = 0; file < 8; file += 1) {
      const square = squareName(file, rank);
      const cell = document.createElement('span');
      cell.className = `square ${(row + file) % 2 === 0 ? 'light' : 'dark'}`;
      if (lastMove?.from === square || lastMove?.to === square) cell.classList.add('last-move');
      if (lastMove?.to === square) cell.classList.add('target-square');
      if (file === 0) {
        const rankLabel = document.createElement('span');
        rankLabel.className = 'coord';
        rankLabel.textContent = rank;
        cell.append(rankLabel);
      }
      if (rank === 1) {
        const fileLabel = document.createElement('span');
        fileLabel.className = 'coord';
        fileLabel.textContent = String.fromCharCode(97 + file);
        fileLabel.style.top = 'auto';
        fileLabel.style.bottom = '2px';
        cell.append(fileLabel);
      }
      if (pieces[square]) {
        const piece = document.createElement('span');
        const color = '♚♛♜♝♞♟'.includes(pieces[square]) ? 'black' : 'white';
        piece.className = `piece ${color}`;
        piece.setAttribute('aria-hidden', 'true');
        piece.textContent = pieces[square];
        cell.append(piece);
      }
      target.append(cell);
    }
  }
}

function updateProgress() {
  const currentStep = lessonIndex + 1;
  const progress = `${(currentStep / lessons.length) * 100}%`;
  document.querySelector('#sidebar-progress-fill').style.width = progress;
  document.querySelector('#sidebar-progress-copy').textContent = `Step ${currentStep} of ${lessons.length}`;
}

function renderLesson() {
  const lesson = lessons[lessonIndex];
  lessonTitle.textContent = lesson.title;
  lessonDescription.textContent = lesson.description;
  notationExample.textContent = lesson.notation;
  notationExplanation.innerHTML = lesson.explanation;
  lessonTip.textContent = lesson.tip;
  stepNumber.textContent = String(lessonIndex + 1).padStart(2, '0');
  stepCounter.textContent = `${String(lessonIndex + 1).padStart(2, '0')} / ${String(lessons.length).padStart(2, '0')}`;
  previousButton.disabled = lessonIndex === 0;
  nextButton.innerHTML = lessonIndex === lessons.length - 1
    ? 'Practice what you learned <span aria-hidden="true">→</span>'
    : 'Got it, next <span aria-hidden="true">→</span>';
  renderBoard(board, piecesAt(lessonIndex), lessonIndex > 0 ? lesson : { from: null, to: 'e4' });
  board.setAttribute('aria-label', lessonIndex === 0
    ? 'Chessboard in the starting position, with e4 highlighted'
    : `Chessboard after ${lessons.slice(1, lessonIndex + 1).map((move) => move.san).join(', ')}`);
  updateProgress();
}

function selectView(view) {
  const isPractice = view === 'practice';
  learnView.classList.toggle('is-hidden', isPractice);
  practiceView.classList.toggle('is-hidden', !isPractice);
  breadcrumbCurrent.textContent = isPractice ? 'Practice' : 'Learn';
  document.querySelectorAll('.nav-item[data-view]').forEach((item) => {
    const active = item.dataset.view === view;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  if (isPractice) renderQuiz();
  else renderLesson();
}

function renderQuiz() {
  const content = document.querySelector('#quiz-content');
  const question = quizQuestions[quizIndex];
  answered = false;
  document.querySelector('#quiz-progress-fill').style.width = `${(quizIndex / quizQuestions.length) * 100}%`;
  document.querySelector('#quiz-progress-label').textContent = `QUESTION ${quizIndex + 1} OF ${quizQuestions.length}`;
  content.replaceChildren();

  const tag = document.createElement('p');
  tag.className = 'quiz-question-tag';
  tag.textContent = `READ THE MOVE · ${question.san}`;
  const heading = document.createElement('h3');
  heading.textContent = question.prompt;
  const prompt = document.createElement('p');
  prompt.className = 'quiz-prompt';
  prompt.textContent = 'Choose the answer that feels right.';
  const quizBoard = document.createElement('div');
  quizBoard.className = 'quiz-board';
  quizBoard.setAttribute('role', 'img');
  quizBoard.setAttribute('aria-label', `Chessboard showing ${question.san}`);
  const quizPieces = { ...initialPieces };
  if (question.san === 'Nf3') {
    delete quizPieces.e2;
    delete quizPieces.e7;
    quizPieces.e4 = '♙';
    quizPieces.e5 = '♟';
    delete quizPieces.g1;
    quizPieces.f3 = '♘';
  } else if (question.san === 'Bxc6+') {
    delete quizPieces.a2;
    delete quizPieces.b2;
    delete quizPieces.c2;
    delete quizPieces.d2;
    delete quizPieces.e2;
    delete quizPieces.f2;
    delete quizPieces.g2;
    delete quizPieces.h2;
    quizPieces.b5 = '♗';
    quizPieces.c6 = '♟';
  } else if (question.san === 'O-O') {
    quizPieces.f1 = '♖';
    quizPieces.g1 = '♔';
    delete quizPieces.e1;
    delete quizPieces.h1;
  }
  renderBoard(quizBoard, quizPieces, question);
  const options = document.createElement('div');
  options.className = 'quiz-options';
  options.setAttribute('role', 'group');
  options.setAttribute('aria-label', 'Answer choices');
  const feedback = document.createElement('p');
  feedback.className = 'quiz-feedback';
  feedback.setAttribute('aria-live', 'polite');
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'quiz-option';
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => answerQuiz(index, question, options, feedback));
    options.append(button);
  });
  content.append(tag, heading, prompt, quizBoard, options, feedback);
}

function answerQuiz(selected, question, options, feedback) {
  if (answered) return;
  answered = true;
  const buttons = [...options.querySelectorAll('button')];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.answer) button.classList.add('correct');
    if (index === selected && selected !== question.answer) button.classList.add('incorrect');
  });
  const isCorrect = selected === question.answer;
  if (isCorrect) quizScore += 1;
  feedback.textContent = isCorrect ? question.note : `Not quite. ${question.note}`;
  feedback.classList.toggle('is-wrong', !isCorrect);
  const next = document.createElement('button');
  next.className = 'button button-primary quiz-next';
  next.type = 'button';
  next.innerHTML = quizIndex === quizQuestions.length - 1
    ? 'See how I did <span aria-hidden="true">→</span>'
    : 'Next question <span aria-hidden="true">→</span>';
  next.addEventListener('click', () => {
    quizIndex += 1;
    if (quizIndex === quizQuestions.length) showQuizResult();
    else renderQuiz();
  });
  feedback.after(next);
}

function showQuizResult() {
  document.querySelector('#quiz-progress-fill').style.width = '100%';
  document.querySelector('#quiz-progress-label').textContent = 'THAT’S THE WHOLE BOARD';
  const content = document.querySelector('#quiz-content');
  content.innerHTML = '';
  const result = document.createElement('div');
  result.className = 'quiz-result';
  const mark = document.createElement('div');
  mark.className = 'quiz-result-mark';
  mark.textContent = '✳';
  const heading = document.createElement('h3');
  heading.textContent = quizScore === quizQuestions.length ? 'A perfect little game.' : 'Look at you, learning.';
  const summary = document.createElement('p');
  summary.textContent = `You got ${quizScore} out of ${quizQuestions.length} right. Every move is a little easier now.`;
  const again = document.createElement('button');
  again.className = 'button button-primary';
  again.type = 'button';
  again.textContent = 'Play again';
  again.addEventListener('click', () => {
    quizIndex = 0;
    quizScore = 0;
    renderQuiz();
  });
  result.append(mark, heading, summary, again);
  content.append(result);
}

previousButton.addEventListener('click', () => {
  if (lessonIndex > 0) {
    lessonIndex -= 1;
    renderLesson();
  }
});

nextButton.addEventListener('click', () => {
  if (lessonIndex < lessons.length - 1) {
    lessonIndex += 1;
    renderLesson();
  } else {
    selectView('practice');
    document.querySelector('#practice-view').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

document.querySelector('#reset-board').addEventListener('click', () => {
  lessonIndex = 0;
  renderLesson();
});

document.querySelectorAll('.nav-item[data-view]').forEach((item) => {
  item.addEventListener('click', () => selectView(item.dataset.view));
});

document.querySelector('#practice-link').addEventListener('click', () => {
  selectView('practice');
  document.querySelector('#practice-view').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

renderLesson();
