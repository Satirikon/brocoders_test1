class Grid {
  gridSize;
  rootNode;
  currentColumn;
  delBtnCol;
  delBtnRow;
  addBtnCol;
  addBtnRow;
  gridRoot;

  constructor(rootQuerySelector, gridSize = 4) {
    this.rootNode = document.querySelector(rootQuerySelector);
    if (!this.rootNode) {
      return console.error('Root element is not found in DOM.');
    }
    this.gridSize = gridSize;
    this.render();
  }

  addElement({appendTo = this.rootNode, className = '', tag = {type: 'div', text: null}, listeners = []}) {
    const newElement = document.createElement(tag.type);
    if (tag.text) {
      newElement.appendChild(document.createTextNode(tag.text));
    }
    newElement.className = className;
    appendTo.appendChild(newElement);

    for (let listener of listeners) {
      if (!!listener && listener.callback) {
        newElement.addEventListener(listener.type || 'click', listener.callback);
      }
    }

    return newElement;
  };

  hideDelButtons() {
    this.delBtnRow.style.display = this.delBtnCol.style.display = 'none';
  }

  render() {
    this.rootNode.addEventListener('dragstart', (e) => {
      const offset = [e.target.offsetLeft - e.clientX, e.target.offsetTop - e.clientY];
      e.dataTransfer.setData('text/plain', JSON.stringify(offset));
    });
    document.body.addEventListener('dragover',(e) => e.preventDefault());
    document.body.addEventListener('drop', (e) => {
      const offset = JSON.parse(e.dataTransfer.getData('text/plain'));
      this.rootNode.style.left = `${e.clientX + offset[0]}px`;
      this.rootNode.style.top = `${e.clientY + offset[1]}px`;
    });

    this.delBtnCol = this.addElement({
      appendTo: this.rootNode,
      className: 'action-btn del-btn-col',
      tag: {
        type: 'button',
        text: '-'
      },
      listeners: [{
        type: 'click',
        callback: () => {
          const parent = this.currentColumn.parentElement;
          const index = Array.prototype.indexOf.call(parent.children, this.currentColumn);
          const rows = this.gridRoot.getElementsByClassName('row');
          for (let row of rows) {
            row.children[index].remove();
          }

          if (parent.children.length <= 1 || !parent.children[index]) {
            this.hideDelButtons();
          } else {
            this.currentColumn = parent.children[index];
          }
        }
      }, {
        type: 'mouseleave',
        callback: () => this.hideDelButtons()
      }]
    });

    this.delBtnRow = this.addElement({
      appendTo: this.rootNode,
      className: 'action-btn del-btn-row',
      tag: {
        type: 'button',
        text: '-'
      },
      listeners: [{
        type: 'click',
        callback: () => {
          const parent = this.currentColumn.parentElement;
          const newParent = parent.nextSibling;
          parent.remove();
          if (!newParent || newParent.parentElement.children.length <= 1) {
            this.hideDelButtons();
          } else {
            this.currentColumn = newParent.children[0];
          }
        }
      }, {
        type: 'mouseleave',
        callback: () => this.hideDelButtons()
      }]
    });

    this.addBtnCol = this.addElement({
      appendTo: this.rootNode,
      className: 'action-btn add-btn-col',
      tag: {
        type: 'button',
        text: '+'
      },
      listeners: [{
        type: 'click',
        callback: () => {
          const rows = this.gridRoot.getElementsByClassName('row');
          for (let row of rows) {
            this.addElement({appendTo: row, className: 'column'});
          }
        }
      }]
    });

    this.addBtnRow = this.addElement({
      appendTo: this.rootNode,
      className: 'action-btn add-btn-row',
      tag: {
        type: 'button',
        text: '+'
      },
      listeners: [{
        type: 'click',
        callback: () => {
          const existingRow = this.gridRoot.querySelector('.row');
          const newRow = existingRow.cloneNode(true);
          this.gridRoot.appendChild(newRow);
        }
      }]
    });

    this.gridRoot = this.addElement({
      appendTo: this.rootNode,
      className: 'grid-root',
      listeners: [{
        type: 'mouseover',
        callback: (e) => {
          if (e.target.className === 'column') {
            this.currentColumn = e.target;
            if (this.gridRoot.querySelector('.row').childNodes.length > 1) {
              this.delBtnCol.style.left = `${this.currentColumn.offsetLeft}px`;
              this.delBtnCol.style.display = 'inline';
            }
            if (this.gridRoot.getElementsByClassName('row').length > 1) {
              this.delBtnRow.style.top = `${this.currentColumn.offsetTop}px`;
              this.delBtnRow.style.display = 'inline';
            }
          }
        }
      }, {
        type: 'mouseleave',
        callback: () => {
          setTimeout(() => {
            const selected = this.rootNode.querySelectorAll('.del-btn-col:hover, .del-btn-row:hover');
            if (!selected.length) {
              this.hideDelButtons();
            }
          }, 200);
        }
      }]
    });
    for (let i = 0; i < this.gridSize; i++) {
      const newRow = this.addElement({appendTo: this.gridRoot, className: 'row'});
      for (let j = 0; j < this.gridSize; j++) {
        this.addElement({appendTo: newRow, className: 'column'});
      }
    }
  }
}