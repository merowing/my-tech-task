import { editImage, removeImage } from './images.js';
import { storage } from './localstorage.js';

const table = document.querySelector('.table');

function addBankTable(data) {
    createTableRows([data]);
}

function removeBankTable(index) {

}

function editBankTable(index) {

}

function tableNodeElements(data, classStr = '') {
    let fragment = document.createDocumentFragment();
    let rows = data.reduce((prev, current, ind) => {
        
        let div = document.createElement('div');
        div.setAttribute('class', 'table-row' + classStr);

        let arrDiv = Object.keys(current).map(item => {
            return `<div><span>${current[item]}</span></div>`;
        });

        div.innerHTML = `
            <div>${ind + 1}.</div>
            ${arrDiv.join('')}
            <div class="edit-buttons">
                <ul>
                    <li></li>
                    <li class="remove-all"></li>
                </ul>
            </div>`;

        prev.appendChild(div);
        return prev;
    }, fragment);

    return rows;
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
                <li class="remove-all">${ removeImage }</li>
            </ul>
        </div>`;
    
    table.appendChild(div);
}

function createTableRows(data) {
    console.log(data);
    let fragment = document.createDocumentFragment();
    let rows = data.reduce((prev, current) => {
        
        let div = document.createElement('div');
        div.setAttribute('class', 'table-row');
        
        let arrDiv = Object.keys(current).reduce((prev, item) => {
            if(item === 'id') return prev;
            
            prev.push(`<div><span>${current[item]}</span></div>`);
            return prev;
        }, []);

        div.innerHTML = `
            <div id="${current['id']}">${current['id'] + 1}.</div>
            ${arrDiv.join('')}
            <div class="edit-buttons">
                <ul>
                    <li class="edit">${ editImage }</li>
                    <li class="remove">${ removeImage }</li>
                </ul>
            </div>`;

        prev.appendChild(div);
        return prev;
    }, fragment);

    if(data.length === 0) {
        rows = document.createElement('div');
        rows.setAttribute('class', 'table-row');
        rows.innerText = 'Not found any bank!';
        rows.setAttribute('style', 'justify-content: center');
    }

    table.appendChild(rows);
}

function createTable() {
    table.innerHTML = '';
    let banks = storage();

    if(banks.length > 0) createTableHead();
    createTableRows(banks);
}

export { createTable, addBankTable, editBankTable, removeBankTable }
