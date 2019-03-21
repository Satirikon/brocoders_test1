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

  addElement({appendTo = this.rootNode, className = '', tag = 'div', text = '', listeners = []}) {
    const newElement = document.createElement(tag);
    newElement.className = className;

    if (text) newElement.appendChild(document.createTextNode(text));

    for (let listener of listeners) {
      if (!!listener && listener.callback) {
        newElement.addEventListener(listener.type || 'click', listener.callback);
      }
    }

    appendTo.appendChild(newElement);
    return newElement;
  };

  hideDelButtons() {
    this.delBtnRow.style.display = this.delBtnCol.style.display = 'none';
  }

  createDnDListeners() {
    this.rootNode.addEventListener('dragstart', (e) => {
      const offset = [e.target.offsetLeft - e.clientX, e.target.offsetTop - e.clientY];
      e.dataTransfer.setData('text/plain', JSON.stringify(offset));
      e.dataTransfer.setDragImage(new Image(), 0, 0);
    });
    document.body.addEventListener('dragover', (e) => e.preventDefault());
    document.body.addEventListener('drop', (e) => {
      const gridBoundingClient = this.rootNode.getBoundingClientRect();
      const bodyBoundingClient = e.target.getBoundingClientRect();
      const offset = JSON.parse(e.dataTransfer.getData('text/plain'));
      const offsetX = e.clientX + offset[0];
      if (offsetX < 0 || offsetX + gridBoundingClient.width > bodyBoundingClient.width) return;
      const offsetY = e.clientY + offset[1];
      if (offsetY < 0 || offsetY + gridBoundingClient.height > bodyBoundingClient.height) return;

      this.rootNode.style.left = `${offsetX}px`;
      this.rootNode.style.top = `${offsetY}px`;
    });
  }

  createDelButtons() {
    const delButtonParams = {
      tag: 'button',
      text: '-',
      listeners: [{
        type: 'mouseleave',
        callback: () => this.hideDelButtons()
      }]
    };

    const delBtnColCb = () => {
      const parent = this.currentColumn.parentElement;
      const index = Array.from(parent.children).indexOf(this.currentColumn,0);
      const rows = this.gridRoot.getElementsByClassName('row');
      for (let row of rows) {
        row.children[index].remove();
      }
      if (parent.children.length <= 1 || !parent.children[index]) {
        this.hideDelButtons();
      } else {
        this.currentColumn = parent.children[index];
      }
    };

    const delBtnRowCb = () => {
      const parent = this.currentColumn.parentElement;
      const newParent = parent.nextSibling;
      parent.remove();
      if (!newParent || newParent.parentElement.children.length <= 1) {
        this.hideDelButtons();
      } else {
        this.currentColumn = newParent.children[0];
      }
    };

    this.delBtnCol = this.addElement({
      ...delButtonParams,
      className: 'action-btn del-btn-col',
      listeners: [...delButtonParams.listeners, {callback: delBtnColCb}]
    });

    this.delBtnRow = this.addElement({
      ...delButtonParams,
      className: 'action-btn del-btn-row',
      listeners: [...delButtonParams.listeners, {callback: delBtnRowCb}]
    });
  }

  createAddButtons() {
    const addButtonParams = {tag: 'button', text: '+'};

    const addBtnColCb = () => {
      const rows = this.gridRoot.getElementsByClassName('row');
      for (let row of rows) {
        this.addElement({appendTo: row, className: 'column'});
      }
    };

    const addBtnRowCb = () => {
      const existingRow = this.gridRoot.querySelector('.row');
      const newRow = existingRow.cloneNode(true);
      this.gridRoot.appendChild(newRow);
    };

    this.addBtnCol = this.addElement({
      ...addButtonParams,
      className: 'action-btn add-btn-col',
      listeners: [{callback: addBtnColCb}]
    });

    this.addBtnRow = this.addElement({
      ...addButtonParams,
      className: 'action-btn add-btn-row',
      listeners: [{callback: addBtnRowCb}]
    });
  }

  createGrid() {
    const gridMouseOverCb = (e) => {
      if (e.target.className !== 'column') return;

      this.currentColumn = e.target;
      if (this.gridRoot.querySelector('.row').childNodes.length > 1) {
        this.delBtnCol.style.left = `${this.currentColumn.offsetLeft}px`;
        this.delBtnCol.style.display = 'inline';
      }
      if (this.gridRoot.getElementsByClassName('row').length > 1) {
        this.delBtnRow.style.top = `${this.currentColumn.offsetTop}px`;
        this.delBtnRow.style.display = 'inline';
      }
    };

    const gridMouseLeaveCb = () => {
      setTimeout(() => {
        const selected = this.rootNode.querySelectorAll('.del-btn-col:hover, .del-btn-row:hover');
        if (!selected.length) this.hideDelButtons();
      }, 200);
    };

    this.gridRoot = this.addElement({
      className: 'grid-root',
      listeners: [
        {type: 'mouseover', callback: gridMouseOverCb},
        {type: 'mouseleave', callback: gridMouseLeaveCb}
      ]
    });

    for (let i = 0; i < this.gridSize; i++) {
      const newRow = this.addElement({appendTo: this.gridRoot, className: 'row'});
      for (let j = 0; j < this.gridSize; j++) {
        this.addElement({appendTo: newRow, className: 'column'});
      }
    }
  }

  render() {
    this.createDnDListeners();
    this.createDelButtons();
    this.createAddButtons();
    this.createGrid();
  }
}