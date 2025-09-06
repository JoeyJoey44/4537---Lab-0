class Game {
    constructor(ui) {
      this.ui = ui;
      this.buttons = [];
      this.correctOrder = [];
      this.userOrder = [];
      this.scramblesLeft = 0;
  
      // Listen for Go button
      document.getElementById("goBtn").addEventListener("click", () => {
        const n = parseInt(document.getElementById("numButtons").value);
        this.startGame(n);
      });
  
      // Listen for window resize to reposition buttons if needed
      window.addEventListener("resize", () => this.keepButtonsInBounds());
    }
  
    startGame(n) {
      if (isNaN(n) || n < 3 || n > 7) {
        this.ui.showMessage("INVALID_INPUT");
        return;
      }
  
      this.ui.clearGameArea();
      this.buttons = [];
      this.correctOrder = [];
      this.userOrder = [];
      this.scramblesLeft = n;
  
      const area = this.ui.getGameArea();
      const colors = this.generateColors(n);
  
      // Set gameArea to relative positioning for absolute positioning of buttons
      area.style.position = "relative";
      area.style.minHeight = "400px"; // Ensure minimum height for scrambling space
  
      for (let i = 0; i < n; i++) {
        const btn = new MemoryButton(i + 1, colors[i]);
        btn.element.classList.add("memory-btn");
        btn.element.style.position = "absolute"; // Make buttons absolutely positioned
        area.appendChild(btn.element);
        this.buttons.push(btn);
        this.correctOrder.push(btn.id);
      }
  
      this.layoutRow();
      setTimeout(() => this.scrambleCycle(), n * 1000);
    }
  
    scrambleCycle() {
      if (this.scramblesLeft === 0) {
        this.hideNumbers();
        this.makeClickable();
        return;
      }
      this.scramblesLeft--;
      this.scramblePositions();
      setTimeout(() => this.scrambleCycle(), 2000);
    }
  
    scramblePositions() {
      const area = this.ui.getGameArea();
      const areaRect = area.getBoundingClientRect();
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate safe bounds (stay within both game area and viewport)
      const safeWidth = Math.min(areaRect.width, viewportWidth - 40); // 40px margin
      const safeHeight = Math.min(areaRect.height, viewportHeight - 200); // 200px for header/controls
      
      // Ensure minimum scrambling area
      const minWidth = Math.max(safeWidth, 300);
      const minHeight = Math.max(safeHeight, 200);
      
      // Track used positions to avoid overlaps
      const usedPositions = [];
      const buttonSpacing = 20; // Minimum space between buttons
  
      this.buttons.forEach(btn => {
        const buttonWidth = btn.element.offsetWidth || 160; // fallback width
        const buttonHeight = btn.element.offsetHeight || 80; // fallback height
        
        let attempts = 0;
        let x, y, validPosition;
        
        do {
          // Generate random position within safe bounds
          x = Math.random() * Math.max(0, minWidth - buttonWidth);
          y = Math.random() * Math.max(0, minHeight - buttonHeight);
          
          // Check if position overlaps with existing buttons
          validPosition = !usedPositions.some(pos => {
            return (x < pos.right + buttonSpacing &&
                    x + buttonWidth > pos.left - buttonSpacing &&
                    y < pos.bottom + buttonSpacing &&
                    y + buttonHeight > pos.top - buttonSpacing);
          });
          
          attempts++;
        } while (!validPosition && attempts < 50); // Prevent infinite loops
        
        // Record this position as used
        usedPositions.push({
          left: x,
          right: x + buttonWidth,
          top: y,
          bottom: y + buttonHeight
        });
        
        btn.setPosition(x, y);
      });
      
      // Update game area height to accommodate all buttons
      const maxY = Math.max(...usedPositions.map(pos => pos.bottom));
      area.style.minHeight = Math.max(400, maxY + 20) + "px";
    }
  
    // Ensure buttons stay within bounds when window is resized
    keepButtonsInBounds() {
      if (this.buttons.length === 0) return;
      
      const area = this.ui.getGameArea();
      const areaRect = area.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate new safe bounds
      const safeWidth = Math.min(areaRect.width, viewportWidth - 40);
      const safeHeight = Math.min(areaRect.height, viewportHeight - 200);
  
      this.buttons.forEach(btn => {
        const buttonWidth = btn.element.offsetWidth || 160;
        const buttonHeight = btn.element.offsetHeight || 80;
        
        // Get current position
        let x = parseFloat(btn.element.style.left) || 0;
        let y = parseFloat(btn.element.style.top) || 0;
  
        // Constrain to new bounds
        if (x + buttonWidth > safeWidth) {
          x = Math.max(0, safeWidth - buttonWidth);
        }
        if (y + buttonHeight > safeHeight) {
          y = Math.max(0, safeHeight - buttonHeight);
        }
        
        // Ensure not negative
        x = Math.max(0, x);
        y = Math.max(0, y);
  
        btn.setPosition(x, y);
      });
    }
  
    hideNumbers() {
      this.buttons.forEach(btn => btn.hide());
    }
  
    makeClickable() {
      this.buttons.forEach(btn => {
        btn.element.onclick = () => this.handleClick(btn);
      });
    }
  
    handleClick(btn) {
      const expected = this.correctOrder[this.userOrder.length];
      if (btn.id === expected) {
        btn.reveal();
        this.userOrder.push(btn.id);
  
        if (this.userOrder.length === this.correctOrder.length) {
          this.ui.showMessage("EXCELLENT");
        }
      } else {
        this.ui.showMessage("WRONG");
        this.buttons.forEach(b => b.reveal());
        this.buttons.forEach(b => (b.element.onclick = null));
      }
    }
  
    layoutRow() {
      let x = 20, y = 20;
      const buttonWidth = 160; // Fixed width since buttons might not be rendered yet
      const buttonHeight = 80;  // Fixed height
      const buttonSpacing = 20;
      
      const area = this.ui.getGameArea();
      const areaWidth = area.offsetWidth || window.innerWidth - 40;
      const maxButtonsPerRow = Math.floor((areaWidth - 40) / (buttonWidth + buttonSpacing));
  
      this.buttons.forEach((btn, index) => {
        btn.setPosition(x, y);
        x += buttonWidth + buttonSpacing;
        
        // Move to next row if needed
        if ((index + 1) % maxButtonsPerRow === 0) {
          x = 20;
          y += buttonHeight + buttonSpacing;
        }
      });
    }
  
    generateColors(n) {
      const colors = [];
      for (let i = 0; i < n; i++) {
        // Generate brighter, more varied colors
        const r = Math.floor(Math.random() * 156) + 100; // 100-255
        const g = Math.floor(Math.random() * 156) + 100; // 100-255
        const b = Math.floor(Math.random() * 156) + 100; // 100-255
        colors.push(`rgb(${r}, ${g}, ${b})`);
      }
      return colors;
    }
  }