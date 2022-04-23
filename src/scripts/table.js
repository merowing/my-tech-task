import { table } from './blocks.js';
import { editImage, removeImage } from './images.js';
import { storage } from './localstorage.js';

function addBankTable(data) {
    createTableRows([data]);
}

function removeBankTable(index) {
    let rows = table.querySelectorAll('.table-row');
    table.removeChild(rows[index]);

    rows = table.querySelectorAll('.table-row');
    for(let i = index; i < rows.length; i++) {
        rows[i].querySelector('div').innerText = i + '.';
    }

    if(!storage().length) {
        table.innerHTML = '';
        createTableRows(storage());
    }
}

function editBankTable(index, data) {
    let rows = table.querySelectorAll('.table-row');

    let text = rows[index].querySelectorAll('div > span');
    
    Object.keys(data).map((item, ind) => {
        if(item !== 'id') {
            text[ind].innerText = data[item];
        }
        if(item === 'name' && rows[index].classList.contains('full-name')) {
            text[ind].innerText = data[item];
            text[ind].setAttribute('name', data[item]);
            rows[ind].classList.remove('full-name');
        }
    });

    shorterBankName(index);
}

function clearTable() {
    table.innerHTML = '';
    createTableRows(storage());    
}

function createTableHead() {
    const titles = ['#', 'Name of bank', 'Interest rate, %', 'Max loan', 'Min down payment', 'Loan term'];

    let div = document.createElement('div');
    div.setAttribute('class', 'table-row th');

    let head = titles.map(item => {
        return `<div><span>${item}</span></div>`;
    });

    div.innerHTML = `
        ${head.join('')}
        <div class="edit-buttons">
            <ul>
                <li class="remove-all" type="remove-all" title="remove all banks">${ removeImage }</li>
            </ul>
        </div>`;
    
    table.appendChild(div);
}

function createTableRows(data) {
    let fragment = document.createDocumentFragment();
    
    let rows = data.reduce((prev, current, ind) => {

        let div = document.createElement('div');
        div.setAttribute('class', 'table-row');
        
        let arrDiv = Object.keys(current).reduce((prev, item) => {
            if(item === 'id') return prev;
            
            const name = (item === 'name') ? `name="${current[item]}"` : null;
            prev.push(`<div><span ${name}>${current[item]}</span></div>`);
            return prev;
        }, []);

        let bankNumber = ind + 1;
        if(data.length === 1) bankNumber = storage().length;

        div.innerHTML = `
            <div id="${current['id']}">${bankNumber}.</div>
            ${arrDiv.join('')}
            <div class="edit-buttons">
                <ul>
                    <li class="edit" type="edit" title="edit">${ editImage }</li>
                    <li class="remove" type="remove" title="remove">${ removeImage }</li>
                </ul>
            </div>`;

        prev.appendChild(div);
        return prev;
    }, fragment);

    if(data.length === 0) {
        rows = document.createElement('div');
        rows.setAttribute('class', 'table-row empty');
        rows.innerText = 'Not found any bank!';
        rows.setAttribute('style', 'justify-content: center');
    }

    table.appendChild(rows);
    
    shorterBankName();
}

function createTable() {
    table.innerHTML = '';
    let banks = storage();

    if(banks.length > 0) createTableHead();
    createTableRows(banks);
}

function shorterBankName(ind = null) {
    let tableRows = table.querySelectorAll('.table-row:not(.th)');
    if(ind !== null) {
        tableRows = [tableRows[ind-1]];
    }

    if(tableRows[0].querySelector('div')) {
        [...tableRows].map(block => {
            let row = block.querySelector('div span');
            
            let blockWidth = row.offsetWidth;
            row.style.whiteSpace = 'nowrap';

            let noWrapBlockWidth = row.offsetWidth;

            row.removeAttribute('style');
            
            let text = row.innerText;
            let lettersLen = text.length;

            let letterWidth = Math.ceil(noWrapBlockWidth / lettersLen);
            let lettersInRow = Math.floor(blockWidth / letterWidth) - 3;

            if(noWrapBlockWidth > blockWidth) {
                row.innerText = text.substr(0, lettersInRow) + '...';
            }
        });
    }
}

export { createTable, addBankTable, editBankTable, removeBankTable, clearTable, shorterBankName }
