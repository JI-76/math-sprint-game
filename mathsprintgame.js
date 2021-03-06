// mathsprintgame.js

// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
// interval between start and stop
let timer;
// incremented in 0.1 sec intervals
let timePlayed = 0;
// start time
let baseTime = 0;
// penalty time
let penaltyTime = 0;
// final time
finalTime = 0;
// finalTimeDisplay = '0.0s';
finalTimeDisplay = '0.0';

// Scroll
// scroll moves in 80 pixel increments
let valueY = 0;

// Refresh Splash Page Best Scores
function bestScoresToDOM() {
  // Update the DOM elements array
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
};

// Check Local Storage for Best Scores; set bestScoreArray
function getSavedBestScores() {
  // check if Best Scores are currently stored in Local Storage
  if (localStorage.getItem('bestScores')) {
    // LocalStorage stores data in string format and needs to cast the string into an object
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    // LocalStorage stores data in string format and needs to cast the object into a string
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  };
  bestScoresToDOM();
};

// Update Best Score Array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    // Select correct Best Score to update
    if (questionAmount == score.questions) {
      // Return Best Score as number with 1 decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      // Update if the new final score is less or replacing 0
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      };
    };
  });
  // Update Splash Page
  bestScoresToDOM();
  // Save to Local Storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
};


// Reset the Game
function playAgain() {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
};

// Show Score Page
function showScorePage() {
  // Show Play Again button after 1 sec delay
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
};

// Format & Display Time in DOM
function scoresToDOM() {
  // Format score to 1 decimal place
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  // Update DOM
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  // Scroll to top; go to Score Page
  itemContainer.scrollTo({ top: 0, behavior: 'instant' });
  showScorePage();
};

// Stop Timer, process results, go to Score Page
function checkTime() {
  console.log(timePlayed);
  // clear interval if number of questions is reached
  if (playerGuessArray.length == questionAmount) {
    console.log('player guess array', playerGuessArray);
    clearInterval(timer);
    // Loop through equationsArray and check for incorrect guesses in the playerGuessArray and add penalty time for each
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessArray[index]) {;
          // Correct guess; no penalty
      } else {
        // Incorrect guest; add penalty of 0.5 sec
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    console.log('time:', timePlayed, 'penalty:', penaltyTime, 'final:', finalTime);
    scoresToDOM();
  };
};

// Add a tenth (0.1) of a second to timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
};

// Start timer when Game Page is clicked
function startTimer() {
  // Reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  // execute 10 times per sec
  timer = setInterval(addTime, 100);
  // temporarily remove the Event Listener so that it is only clicked once per game
  gamePage.removeEventListener('click', startTimer);
};

// Scroll, store User selection in playerGuessArray
function select(guessedTrue) {
  // console.log('player guess array', playerGuessArray);
  // Scroll 80 pixels
  valueY += 80;
  itemContainer.scroll(0, valueY);
  // Add player guess to array
  return guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false');
};

// Display Game Page (and hide Countdown Page)
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
};

// Get Random Number up to max number
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  console.log('correct equations', correctEquations);
  console.log('wrong equations', wrongEquations);

  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    // 3 incorrect permutations of the equation
    // second number value has an extra 1
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    // equation value value has an extra 1
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    // first number value has an extra 1
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    // now make a random choice of which incorrect permutation to display
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
  // console.log('equations array', equationsArray);
  // equationsToDOM();
}

// Add equationsToDOM
// Dynamically create HTML Elements and then append those HTML Elements to the Item container.
function equationsToDOM() {
  equationsArray.forEach((equation) => {
    // Item
    const item = document.createElement('div');
    item.classList.add('item');
    // Equation Text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    // Append Item
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
};

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();
  
  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

// Run the countdown -> display 3, 2, 1, GO!
function countdownStart() {
  let count = 5;
  countdown.textContent = count;
  const timeCountDown = setInterval(() => {
    count --;
    if (count === 0) {
      countdown.textContent = 'GO!';
    } else if (count === -1) {
      showGamePage();
      clearInterval(timeCountDown);
    } else {
      countdown.textContent = count;
    };
  }, 1000);
  // countdown.textContent = '3';
  // setTimeout(() => {
  //   countdown.textContent = '2';
  // }, 1000);
  // setTimeout(() => {
  //   countdown.textContent = '1';
  // }, 2000);
  // setTimeout(() => {
  //   countdown.textContent = 'GO!';
  // }, 3000);
};

// Navigate from Splash Page to Countdown Page to Game Page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  // createEquations();
  populateGamePage();
  countdownStart();
  // setTimeout(showGamePage, 4000);
};

// Get the value from selected radio buttion
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    };
  });
  return radioValue;
};

// Form that decides amount of questions
// e = event
function selectQuestionAmount(e) {
  // prevent page from refreshing
  e.preventDefault();
  questionAmount = getRadioValue();
  console.log('question amount', questionAmount);
  if (questionAmount) {
    showCountdown();
  };
};

// Event Listener
startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    // Remove Selected Label Styling
    radioEl.classList.remove('selected-label');
    // Add it back if the radio input is checked
    // Each Div element <div> class="radio-container" has children elements
    // child[1] is the Label Element <label>
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
    };
  });
});

// Event Listeners
startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

// On Load
getSavedBestScores();