const apiUrl = "https://jsonplaceholder.typicode.com/posts";
let quizData = [];

async function fetchQuizData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    quizData = data.slice(0, 10); // API'den sadece ilk 10 soruyu alıyoruz
    return quizData;
  } catch (error) {
    console.error('Data pull error', error);
    return null;
  }
}

function startQuiz() {
  const startButton = document.getElementById('start-button');
  const quizContainer = document.getElementById('quiz-container');
  
  startButton.addEventListener('click', async () => {
    startButton.style.display = 'none';
    quizContainer.style.display = 'block';
    const quizData = await fetchQuizData();
    if (!quizData) {
      alert('Failed to retrieve data, please try again.');
      return;
    }
    runQuiz(quizData);
  });
}

function runQuiz(quizData) {
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let startTime = 0;
  let timerInterval;

  const questionElement = document.getElementById('question');
  const choicesList = document.getElementById('choices');
  const timerElement = document.getElementById('timer');
  const resultContainer = document.getElementById('result-container');
  const resultTable = document.getElementById('result-table');
  const nextButton = document.getElementById('next-button');
  nextButton.addEventListener('click', handleNextButtonClick);
  const quizContainer = document.getElementById('quiz-container');

  function handleNextButtonClick() {
    currentQuestionIndex++;
    displayQuestion();
  }

  function displayQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];
    if (!currentQuestion) {
      showResult();
      return;
    }

    questionElement.textContent = `Question ${currentQuestionIndex + 1}: ${currentQuestion.title.charAt(0).toUpperCase() + currentQuestion.title.slice(1)}?`; // Soru numarası
    choicesList.innerHTML = '';

    const choices = ["A", "B", "C", "D"];

    
    choices.forEach((choice, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = choice + ". " + currentQuestion.body;
      listItem.addEventListener('click', () => handleAnswerClick(index));
       listItem.addEventListener('click', () => handleAnswerClick(index, currentQuestion.correctChoice));
      choicesList.appendChild(listItem);
    });

    nextButton.style.display = 'none';

     startTime = new Date().getTime();
     timerElement.style.display = 'block';
     updateTimer(); 
     timerInterval = setInterval(updateTimer, 1000);
  }

   function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    const remainingTime = 30000 - elapsedTime; 
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      displayNextQuestion();
    }else {
      if (elapsedTime < 10000) {
        // İlk 10 saniye içinde tıklamayı engelle
        const listItems = choicesList.getElementsByTagName('li');
        for (let i = 0; i < listItems.length; i++) {
          listItems[i].style.pointerEvents = 'none';
        }
      } else {
        // 10 saniyeden sonra tıklamaya izin ver
        const listItems = choicesList.getElementsByTagName('li');
        for (let i = 0; i < listItems.length; i++) {
          listItems[i].style.pointerEvents = 'auto';
        }   }
      timerElement.textContent = 'Remaining time: ' + Math.max((remainingTime / 1000).toFixed(0), 0) + ' second';
    }

    function displayNextQuestion() {
      const listItems = choicesList.getElementsByTagName('li');
      for (let i = 0; i < listItems.length; i++) {
        listItems[i].removeEventListener('click', handleAnswerClick);
      }
    
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    }
    
    function nextQuestion() {
      currentQuestionIndex++;
      displayQuestion();
    }
  
  }

   function handleAnswerClick(choiceIndex) {
    clearInterval(timerInterval);
    userAnswers.push(choiceIndex);
    currentQuestionIndex++;

    if (currentQuestionIndex === quizData.length) {
      showResult();
    } else {
      displayQuestion();
    }
  }

  function showResult() {
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
  
    const numCorrectAnswers = userAnswers.filter((answer, index) => {
      return answer === quizData[index].correctChoice;
    }).length;
  
  }
  

  function displayResultTable(userAnswers, choices) {
    const tableBody = resultTable.querySelector('tbody');
    tableBody.innerHTML = '';

    for (let i = 0; i < quizData.length; i++) {
      const row = document.createElement('tr');
      const questionCell = document.createElement('td');
      const userAnswerCell = document.createElement('td');
      const correctAnswerCell = document.createElement('td');

      questionCell.textContent = `Question ${i + 1}: ${quizData[i].title}?`;
      userAnswerCell.textContent = choices[userAnswers[i]];
      correctAnswerCell.textContent = choices[quizData[i].correctChoice];
      
      row.appendChild(questionCell);
      row.appendChild(userAnswerCell);
      row.appendChild(correctAnswerCell);

      tableBody.appendChild(row);
    }

   
  }

  displayQuestion();
}

startQuiz();