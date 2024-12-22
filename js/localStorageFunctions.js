Storage.prototype.setObj = function (key, obj) {
  return this.setItem(key, JSON.stringify(obj));
};

Storage.prototype.getObj = function (key) {
  return JSON.parse(this.getItem(key));
};

const enableFullScreen = () => {
  const isTelegramWebApp = window.Telegram && window.Telegram.WebApp;
  if (isTelegramWebApp) {
    tg.expand();
    tg.enableClosingConfirmation();

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
  }
};

const saveGameDataToFirebase = (userData, gameData) => {
  enableFullScreen();

  const cloudDB = firebase.firestore();
  const isTelegramWebApp = window.Telegram && window.Telegram.WebApp;
  const user = isTelegramWebApp ? tg.initDataUnsafe?.user : null;

  if (user) {
    cloudDB
      .collection("Database")
      .doc(user.id.toString())
      .set(
        {
          Username: user.username || `User${user.id}`,
          PhotoURL: user.photo_url || "images/Logo .png",
          TelegramID: user.id,
          FirstName: user.first_name || "",
          LastName: user.last_name || "",

          Score: gameData.scoreing || 0,
          Level: level,
          Lives: lives,
          Stars: seaStarNum,
          Growth: ((score - (level - 1) * 30) / 30) * 100,
          LastUpdated: firebase.firestore.FieldValue.serverTimestamp(),

          Level1Time: currentPlayerLevel1Time,
          Level2Time: currentPlayerLevel2Time,
          Level3Time: currentPlayerLevel3Time,

          Badges: currentPlayerTempBadge,
        },
        { merge: true }
      )
      .then(() => console.log("Game data saved for", user.username))
      .catch((err) => console.error("Error saving data:", err));
  }
};

let updateLocalStorage = function () {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user) return;

  const userID = user.id.toString();

  if (gameCompleteFlag) {
    if (lives > previousState.numberOfLives) {
      previousState.numberOfLives = lives;
      localStorage.setObj(userID, previousState);
    }
    if (currentPlayerLevel3Time < previousState.level3time) {
      previousState.level3time = currentPlayerLevel3Time;
      localStorage.setObj(userID, previousState);
    }
    saveGameDataToFirebase(userID, previousState);
  } else if (lives === 0) {
    if (score > previousState.scoreing) {
      previousState.scoreing = score;
      localStorage.setObj(userID, previousState);
      saveGameDataToFirebase(userID, previousState);
    }
  } else {
    switch (level) {
      case 2:
        if (currentPlayerLevel1Time < previousState.level1time) {
          previousState.level1time = currentPlayerLevel1Time;
          localStorage.setObj(userID, previousState);
          saveGameDataToFirebase(userID, previousState);
        }
        break;
      case 3:
        if (currentPlayerLevel2Time < previousState.level2time) {
          previousState.level2time = currentPlayerLevel2Time;
          localStorage.setObj(userID, previousState);
          saveGameDataToFirebase(userID, previousState);
        }
        break;
    }
  }
};
