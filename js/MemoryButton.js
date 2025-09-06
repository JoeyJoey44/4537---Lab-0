class MemoryButton {
    constructor(id, color) {
      this.id = id;
      this.color = color;
      this.element = this.createElement();
    }
  
    createElement() {
      const btn = document.createElement("button");
      btn.textContent = this.id;
      btn.style.backgroundColor = this.color;
      return btn;
    }
  
    setPosition(x, y) {
      this.element.style.position = "absolute";
      this.element.style.left = x + "px";
      this.element.style.top = y + "px";
    }
  
    reveal() {
      this.element.textContent = this.id;
    }
  
    hide() {
      this.element.textContent = "";
    }
  }
  