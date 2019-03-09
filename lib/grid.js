(() => {
  const START_GRID_SIZE = 4;
  const rootNode = document.querySelector('#grid');
  let currentColumn = null;

  const addElement = (appendTo = rootNode, className = '', text = null) => {
    const newElement = document.createElement('div');
    newElement.className = className;
    if (text) {
      newElement.appendChild(document.createTextNode(text));
    }
    appendTo.appendChild(newElement);
    return newElement;
  };

  const delBtnCol = addElement(rootNode, 'action-btn del-btn-col', '-');
  const delBtnRow = addElement(rootNode, 'action-btn del-btn-row', '-');
  const addBtnCol = addElement(rootNode, 'action-btn add-btn-col', '+');
  const addBtnRow = addElement(rootNode, 'action-btn add-btn-row', '+');

  const gridRoot = addElement(rootNode, 'grid-root');
  for (let i = 0; i < START_GRID_SIZE; i++) {
    const newRow = addElement(gridRoot, 'row');
    for (let j = 0; j < START_GRID_SIZE; j++) {
      addElement(newRow, 'column');
    }
  }

  const hideDelButtons = () => delBtnRow.style.display = delBtnCol.style.display = 'none';

  rootNode.addEventListener('mouseover', (e) => {
    const currentElement = e.target;
    if (currentElement.className === 'column') {
      currentColumn = e.target;
      const elementPosition = currentElement.getBoundingClientRect();
      if (gridRoot.querySelector('.row').childNodes.length > 1) {
        delBtnCol.style.left = `${elementPosition.x}px`;
        delBtnCol.style.display = 'flex';
      }
      if (gridRoot.getElementsByClassName('row').length > 1) {
        delBtnRow.style.top = `${elementPosition.y}px`;
        delBtnRow.style.display = 'flex';
      }
    } else if (currentElement.id === 'main' || currentElement.className.indexOf('add-btn') !== -1) {
      hideDelButtons();
    }
  });

  addBtnCol.addEventListener('click', () => {
    const rows = gridRoot.getElementsByClassName('row');
    for (let row of rows) {
      addElement(row, 'column');
    }
  });

  addBtnRow.addEventListener('click', () => {
    const existingRow = gridRoot.querySelector('.row');
    const newRow = existingRow.cloneNode(true);
    gridRoot.appendChild(newRow);
  });

  delBtnCol.addEventListener('click', () => {
    const parent = currentColumn.parentElement;
    const index = Array.prototype.indexOf.call(parent.children, currentColumn);
    const rows = gridRoot.getElementsByClassName('row');
    for (let row of rows) {
      row.children[index].remove();
    }

    if (parent.children.length <= 1 || !parent.children[index]) {
      hideDelButtons();
    } else {
      currentColumn = parent.children[index];
    }
  });

  delBtnRow.addEventListener('click', () => {
    const parent = currentColumn.parentElement;
    const newParent = parent.nextSibling;
    parent.remove();
    if (!newParent || newParent.parentElement.children.length <= 1) {
      hideDelButtons();
    } else {
      currentColumn = newParent.children[0];
    }
  });
})();