class UIManager {
    constructor() {
      this.messageElement = document.getElementById("message");
      this.inputLabel = document.getElementById("inputLabel");
      this.inputLabel.textContent = MESSAGES.PROMPT_INPUT;
    }
  
    showMessage(key) {
      this.messageElement.textContent = MESSAGES[key];
    }
  
    clearGameArea() {
      document.getElementById("gameArea").innerHTML = "";
    }
  
    getGameArea() {
      return document.getElementById("gameArea");
    }
  }
  