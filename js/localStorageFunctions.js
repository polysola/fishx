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

    document.documentElement.style.height = "100vh";
    document.body.style.height = "100vh";
    document.getElementById("container").style.height = "100vh";

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
  const cloudDB = firebase.firestore();
  const isTelegramWebApp = window.Telegram && window.Telegram.WebApp;
  const user = isTelegramWebApp ? tg.initDataUnsafe?.user : null;

  enableFullScreen();

  if (user) {
    const gameDataToSave = {
      Username: user.username || `User${user.id}`,
      PhotoURL: user.photo_url || "images/Logo .png",
      TelegramID: user.id,
      FirstName: user.first_name || "",
      LastName: user.last_name || "",
      Score: score,
      Level: level,
      Lives: lives,
      Stars: seaStarNum,
      Growth: ((score - (level - 1) * 30) / 30) * 100,
      LastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      Level1Time: currentPlayerLevel1Time,
      Level2Time: currentPlayerLevel2Time,
      Level3Time: currentPlayerLevel3Time,
      Badges: currentPlayerTempBadge,
    };

    localStorage.setObj(user.id.toString(), gameDataToSave);

    cloudDB
      .collection("Database")
      .doc(user.id.toString())
      .set(gameDataToSave, { merge: true })
      .then(() => {
        console.log("Game data saved successfully for", user.username);
        previousState = gameDataToSave;
      })
      .catch((err) => console.error("Error saving data:", err));
  }
};

let updateLocalStorage = function () {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user) return;

  const userID = user.id.toString();
  const currentState = {
    scoreing: score,
    numberOfLives: lives,
    level1time: currentPlayerLevel1Time,
    level2time: currentPlayerLevel2Time,
    level3time: currentPlayerLevel3Time,
  };

  previousState = currentState;
  localStorage.setObj(userID, currentState);
  saveGameDataToFirebase(userID, currentState);
};
