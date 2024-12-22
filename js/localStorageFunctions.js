Storage.prototype.setObj = function (key, obj) {
  return this.setItem(key, JSON.stringify(obj));
};

Storage.prototype.getObj = function (key) {
  return JSON.parse(this.getItem(key));
};

const saveGameDataToFirebase = (userData, gameData) => {
  const cloudDB = firebase.firestore();
  const isTelegramWebApp = window.Telegram && window.Telegram.WebApp;
  const user = isTelegramWebApp ? tg.initDataUnsafe?.user : null;

  if (user) {
    cloudDB
      .collection("Database")
      .doc(user.id.toString())
      .update({
        Score: gameData.scoreing,
        Level: level,
        Lives: lives,
        Stars: seaStarNum,
        Growth: ((score - (level - 1) * 30) / 30) * 100,
        LastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => console.log("Game data updated for", user.username))
      .catch((err) => console.error("Error updating data:", err));
  }
};

let updateLocalStorage = function () {
  if (gameCompleteFlag) {
    if (lives > previousState.numberOfLives) {
      previousState.numberOfLives = lives;
      localStorage.setObj(playerNa.value, previousState);
    }
    if (
      currentPlayerLevel3Time < localStorage.getObj(playerNa.value).level3time
    ) {
      previousState.level3time = currentPlayerLevel3Time;
      localStorage.setObj(playerNa.value, previousState);
    }
    saveGameDataToFirebase(playerNa.value, previousState);
  } else if (lives === 0) {
    if (score > previousState.scoreing) {
      previousState.scoreing = score;
      localStorage.setObj(playerNa.value, previousState);
      saveGameDataToFirebase(playerNa.value, previousState);
    }
  } else {
    switch (level) {
      case 2:
        {
          if (
            currentPlayerLevel1Time <
            localStorage.getObj(playerNa.value).level1time
          ) {
            previousState.level1time = currentPlayerLevel1Time;
            localStorage.setObj(playerNa.value, previousState);
            saveGameDataToFirebase(playerNa.value, previousState);
          }
        }
        break;
      case 3:
        {
          if (
            currentPlayerLevel2Time <
            localStorage.getObj(playerNa.value).level2time
          ) {
            previousState.level2time = currentPlayerLevel2Time;
            localStorage.setObj(playerNa.value, previousState);
            saveGameDataToFirebase(playerNa.value, previousState);
          }
        }
        break;
    }
  }
};
