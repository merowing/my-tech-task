import { table } from './blocks.js';
import { editImage, removeImage } from './images.js';
import { storage } from './localstorage.js';

function addBankTable(data) {
    createTableRows([data]);
}

function removeBankTable(index) {
    if(storage().length === 0) {
        table.innerHTML = '';
        createTableRows(storage());
    }else {
        const rows = [...table.querySelectorAll('.table-row:not(.th)')];
        table.removeChild(rows[index - 1]);
        rows.splice(index - 1, 1);
        
        rows.forEach((row, i) => {
            row.querySelector('div').innerText = (i + 1) + '.';
        });
    }
}

function editBankTable(index, data) {
    let rows = table.querySelectorAll('.table-row');

    let text = rows[index].querySelectorAll('div > span');
    
    Object.keys(data).forEach((item, ind) => {
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

    const div = document.createElement('div');
    div.setAttribute('class', 'table-row th');

    const head = titles.map(item => {
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
    let rows;

    if(data.length === 0) {
        rows = document.createElement('div');
        rows.setAttribute('class', 'table-row empty');
        rows.innerText = 'Not found any bank!';
        rows.setAttribute('style', 'justify-content: center');
    }else {

        const fragment = document.createDocumentFragment();

        rows = data.reduce((prev, current, ind) => {

            const div = document.createElement('div');
            div.setAttribute('class', 'table-row');
            
            const rowBankInfo = Object.keys(current).reduce((prev, item) => {
                if(item === 'id') return prev;
                
                const name = (item === 'name') ? `name="${current[item]}"` : null;
                prev.push(`<div><span ${name}>${current[item]}</span></div>`);
                return prev;
            }, []);

            let bankNumber = ind + 1;
            if(data.length === 1) bankNumber = storage().length;

            div.innerHTML = `
                <div id="${current['id']}">${bankNumber}.</div>
                ${rowBankInfo.join('')}
                <div class="edit-buttons">
                    <ul>
                        <li class="edit" type="edit" title="edit">${editImage}</li>
                        <li class="remove" type="remove" title="remove">${removeImage}</li>
                    </ul>
                </div>`;

            prev.appendChild(div);
            
            return prev;
        }, fragment);
    }

    table.appendChild(rows);
    
    shorterBankName();
}

function createTable() {
    table.innerHTML = '';
    const banks = storage();

    if(banks.length > 0) createTableHead();
    createTableRows(banks);
}

function shorterBankName(ind = null) {
    let tableRows = table.querySelectorAll('.table-row:not(.th)');
    if(ind !== null) {
        tableRows = [tableRows[ind-1]];
    }

    if(tableRows[0].querySelector('div')) {
        [...tableRows].forEach(block => {
            const row = block.querySelector('div span');
            
            const blockWidth = row.offsetWidth;
            row.style.whiteSpace = 'nowrap';

            const noWrapBlockWidth = row.offsetWidth;

            row.removeAttribute('style');
            
            const text = row.innerText;
            const lettersLen = text.length;

            const letterWidth = Math.ceil(noWrapBlockWidth / lettersLen);
            const lettersInRow = Math.floor(blockWidth / letterWidth) - 3;

            if(noWrapBlockWidth > blockWidth) {
                row.innerText = text.substr(0, lettersInRow) + '...';
            }
        });
    }
}

export { createTable, addBankTable, editBankTable, removeBankTable, clearTable, shorterBankName }
