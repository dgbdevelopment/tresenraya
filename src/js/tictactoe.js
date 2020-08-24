//Poner a la escucha solo los elementos inciciales
//Celdas
const squares = document.querySelectorAll(".table__square");
squares.forEach((square) => {
  square.addEventListener("click", (e) => {
    markSquare(e.target);
  });
});
//Botón Start
const btnStart = document.getElementById("tictactoe__btn");
btnStart.addEventListener("click", (e) => {
  startGame();
});

//Preparar los audios
const audioStart = new Audio((src = "assets/sound/start.wav"));
audioStart.preload = "auto";
const audioEnd = new Audio((src = "assets/sound/end.wav"));
audioEnd.preload = "auto";
const audioError = new Audio((src = "assets/sound/error.mp3"));
audioError.preload = "auto";
const audioWin = new Audio((src = "assets/sound/win.mp3"));
audioWin.preload = "auto";

//Empezar partida
let gameInProgress = false;
const radioTile = document.getElementsByName("chooseTile");
const radioDifficulty = document.getElementsByName("chooseDifficulty");
let difficulty;

function startGame() {
  toggleGameInProgress();
  //Comprobamos que el jugador ha dado en Empezar
  if (gameInProgress) {
    //Reseteamos clases y turnos
    audioStart.play();
    squares.forEach((square) => {
      square.classList.remove("empty", "playerX", "playerO", "animated");
      square.classList.add("empty");
    });
    document
      .getElementById("info__message")
      .parentElement.classList.remove("info-show", "error-show");
    radioTile.forEach((radio) => {
      if (radio.checked) {
        player = radio.id;
        humanPlayer = radio.id;
        cpu = humanPlayer == "playerX" ? "playerO" : "playerX";
      }
    });
    radioDifficulty.forEach((radio) => {
      if (radio.checked) {
        difficulty = radio.id;
      }
    });

    turn = 0;
    movements = 9;
    sendMessage("");
  } else {
    audioEnd.play();
  }
}

function toggleGameInProgress() {
  gameInProgress = !gameInProgress;
  gameInProgress
    ? (btnStart.textContent = "Cancelar")
    : (btnStart.textContent = "Empezar");
  document.querySelector(".tictactoe__options").classList.toggle("disabled");
}

//Turnos
let turn;
let movements;
let humanPlayer;
let cpu;
let player;
//Que jugador tiene el turno
function getTurn() {
  if (turn % 2 == 0) return player;
  else {
    return player == "playerX" ? "playerO" : "playerX";
  }
}
//Siguiente turno
function nextTurn() {
  turn++;
  movements--;
}
//Combinaciones ganadoras
const combinations = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [1, 5, 9],
  [3, 5, 7],
];
//Buscar si hay combinaciones ganadoras
function checkCombinations() {
  //Mapeamos primera capa de combinaciones
  combinations.map((element) => {
    let combination = [];
    //Mapeamos la segunda capa de combinaciones
    element.map((number) => {
      const className = document.getElementById("square" + number).classList[1];
      //Comprobamos si la celda no está vacía antes de añadir
      if (className != "empty") combination.push(className);
    });
    //Si hay combinacion manda un mensaje, terminamos la partida y animamos las celdas
    if (
      combination.length == 3 &&
      combination[0] == combination[1] &&
      combination[0] == combination[2]
    ) {
      let message;
      if (combination[0] == humanPlayer) {
        audioWin.play();
        message = "Enhorabuena. Has ganado a la máquina.";
      } else {
        audioEnd.play();
        message = "Lo siento. Has perdido. Prueba de nuevo.";
      }
      sendMessage(message, "info", 0);
      element.forEach((elem) => {
        const square = document.getElementById("square" + elem);
        square.classList.add("animated");
        setTimeout(() => {
          square.classList.remove("animated");
        }, 3500);
      });
      toggleGameInProgress();
      // Si no hay combinacion reseteamos el array para seguir buscando
    } else combination = [];
  });
}

//Marcar casilla
function markSquare(elem) {
  //Comprobar si la partida esta en progreso
  if (!gameInProgress) return;
  //Comprobar si la celda esta ocupada
  if (!elem.classList.contains("empty")) {
    audioError.play();
    return sendMessage("La casilla está ocupada.");
  }
  //Marcar la casilla elegida por el jugador y siguiente turno
  elem.classList.replace("empty", getTurn());
  nextTurn();
  evaluateGame();
}

//Evaluar partida
function evaluateGame() {
  checkCombinations();
  if (movements == 0 && gameInProgress == true) {
    sendMessage("Empate. No quedan casillas libres.", "info", 0);
    toggleGameInProgress();
  }
  //si no es el turno del jugador pasamos a AI
  if (getTurn() != humanPlayer) ai(getTurn());
}

//Enviar mensajes al usuario
let hideMessage;
function sendMessage(message, type = "error", duration = 2000) {
  //Comprobamos si hay mensaje anterior y terminamos su timeout
  if (hideMessage) clearTimeout(hideMessage);
  //Mandamos mensaje
  const modClass = type == "error" ? "error-show" : "info-show";
  const messageContainer = document.getElementById("info__message");
  messageContainer.textContent = message;
  messageContainer.parentElement.classList.add(modClass);
  //El mensaje será permanente si hemos pasado 0 por parámetros
  if (duration == 0) return;
  //Hacemos desaparecer el mensaje en 2 seg
  hideMessage = setTimeout(() => {
    messageContainer.textContent = "";
    messageContainer.parentElement.classList.remove(modClass);
  }, duration);
}

//Implementar AI
function ai(player) {
  if (movements == 8 && squares[4].classList.contains(humanPlayer)) {
    let options = [0, 2, 6, 8];
    let ran = Math.floor(Math.random() * options.length);
    return markSquare(squares[options[ran]]);
  }
  if (squares[4].classList.contains("empty")) return markSquare(squares[4]);
  if (movements <= 6) searchMatches(cpu);
  else selectRandom();
}

function selectRandom() {
  let freeSquares = [];
  squares.forEach((elem) => {
    if (elem.classList.contains("empty")) freeSquares.push(elem);
  });
  const forMarking = Math.floor(Math.random() * freeSquares.length);
  markSquare(freeSquares[forMarking]);
}

function searchMatches(Tile) {
  let found = false;
  combinations.map((element) => {
    if (found) return;
    let emptyTile;
    let tileCount = 0;
    let emptyCount = 0;
    //Mapeamos la segunda capa de combinaciones
    element.map((number) => {
      const square = document.getElementById("square" + number);
      const className = square.classList[1];
      if (className == Tile) {
        tileCount++;
      }
      if (className == "empty") {
        emptyCount++;
        emptyTile = square;
      }
    });
    if (tileCount == 2 && emptyCount == 1) {
      found = true;
      return markSquare(emptyTile);
    } else {
      tileCount = 0;
      emptyCount = 0;
      emptyTile = null;
      combination = [];
    }
  });
  if (Tile == cpu) searchMatches(humanPlayer);

  if (getTurn() == cpu) return someMoves();
}
//Esta función será sólo para el modo imposible, en normal devuelve un random
//Son movimientos para evitar que el jugador gane.
function someMoves() {
  if (movements > 2 && difficulty == "hard") {
    if (
      squares[0].classList.contains(humanPlayer) &&
      squares[7].classList.contains(humanPlayer)
    )
      return markSquare(squares[6]);
    if (
      squares[0].classList.contains(humanPlayer) &&
      squares[5].classList.contains(humanPlayer)
    )
      return markSquare(squares[2]);
    if (
      squares[2].classList.contains(humanPlayer) &&
      squares[7].classList.contains(humanPlayer)
    )
      return markSquare(squares[8]);
    if (
      squares[2].classList.contains(humanPlayer) &&
      squares[3].classList.contains(humanPlayer)
    )
      return markSquare(squares[0]);
    if (
      squares[6].classList.contains(humanPlayer) &&
      squares[1].classList.contains(humanPlayer)
    )
      return markSquare(squares[0]);
    if (
      squares[6].classList.contains(humanPlayer) &&
      squares[5].classList.contains(humanPlayer)
    )
      return markSquare(squares[8]);
    if (
      squares[8].classList.contains(humanPlayer) &&
      squares[1].classList.contains(humanPlayer)
    )
      return markSquare(squares[2]);
    if (
      squares[8].classList.contains(humanPlayer) &&
      squares[3].classList.contains(humanPlayer)
    )
      return markSquare(squares[6]);
    if (
      squares[1].classList.contains(humanPlayer) &&
      squares[3].classList.contains(humanPlayer)
    )
      return markSquare(squares[0]);
    if (
      squares[1].classList.contains(humanPlayer) &&
      squares[5].classList.contains(humanPlayer)
    )
      return markSquare(squares[2]);
    if (
      squares[3].classList.contains(humanPlayer) &&
      squares[7].classList.contains(humanPlayer)
    )
      return markSquare(squares[6]);
    if (
      squares[7].classList.contains(humanPlayer) &&
      squares[5].classList.contains(humanPlayer)
    )
      return markSquare(squares[8]);

    if (
      squares[4].classList.contains(cpu) &&
      (squares[0].classList.contains(humanPlayer) ||
        squares[2].classList.contains(humanPlayer) ||
        squares[6].classList.contains(humanPlayer) ||
        squares[8].classList.contains(humanPlayer))
    ) {
      let options = [1, 3, 5, 7];
      let ran = Math.floor(Math.random() * 4);
      return markSquare(squares[options[ran]]);
    }
    if (
      squares[4].classList.contains(humanPlayer) &&
      (squares[0].classList.contains(humanPlayer) ||
        squares[2].classList.contains(humanPlayer) ||
        squares[6].classList.contains(humanPlayer) ||
        squares[8].classList.contains(humanPlayer))
    ) {
      let options = [0, 2, 6, 8];
      let forRandom = [];
      for (const option of options) {
        if (squares[option].classList.contains("empty")) forRandom.push(option);
      }
      let ran = Math.floor(Math.random() * forRandom.length);
      return markSquare(squares[forRandom[ran]]);
    }
  }

  return selectRandom();
}
