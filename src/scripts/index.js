import { infoImage } from "./images.js";
import { storage, addBankStorage, editBankStorage, removeBankStorage, clearStorage, getBankStorage, fillEmptyStorage } from "./localstorage.js";
import { addBankTable, clearTable, createTable, editBankTable, removeBankTable, shorterBankName } from "./table.js";
import { table, calculator, form, errorMessage } from './blocks.js';
import { toggleModalWindow, splitNumber, clearModalWindowData, setModalWindowData } from './modalWindow.js';
import checkValue from "./checkValue.js";
import unique from "./unique.js";
import { selectFillListOfBanks, selectAddOption, selectRemoveOption } from "./calculator.js";

fillEmptyStorage();
selectFillListOfBanks();

createTable();

const newBankButton = document.querySelector('.new-bank');
newBankButton.addEventListener('click', function() {
    clearModalWindowData();
    
    addButtonModal.setAttribute('edit', "0");
    addButtonModal.innerText = 'Add';
    
    toggleModalWindow();
});

// form
const loan = document.querySelector('#loan');
const payment = document.querySelector('#down-payment');
const rate = document.querySelector('#rate');
const addButtonModal = document.querySelector('.add-btn');
const closeButtonModal = document.querySelector('.cancel-btn');
const inputs = form.querySelectorAll('input');

form.addEventListener('keydown', function(e) {
    const target = e.target;
    if(target.tagName === 'INPUT') {
        target.classList.remove('empty');
        errorMessage.innerText = '';
    }
});

rate.addEventListener('keyup', function() {
    this.value = this.value.replace(',', '.');
});

loan.addEventListener('keyup', function() {
    let num = this.value.replace(/,/g, '');
    this.value = splitNumber(num);
});

payment.addEventListener('keyup', function(e) {
    let num = this.value.replace(/,/g, '');
    this.value = splitNumber(num);
});

addButtonModal.addEventListener('click', function(e) {
    e.preventDefault();
    let bank = new FormData(form);
    const mode = this.getAttribute('edit');

    [...inputs].map(item => {
        item.classList.remove('empty');
        item.value = item.value.replace(/^\s+|\s+$/g, '');
    });
    let err = '';
    let errors = [];

    let formData = [...bank.entries()].reduce((prev, current, ind) => {
        let [key, value] = current;

        switch(key) {
            case 'name':
                let changeName = storage().some(item => item.name === value);
                if(typeof form.getAttribute('id') !== 'object') {
                    changeName = storage().some(item => {
                        return item.name === value && item.id !== +form.getAttribute('id')
                    });
                }
                err = checkValue.set(value).empty();
                if(changeName) err = err.bankPresent();
                break;
            case 'minimumDownPayment':
                value = value.replace(/,/g, '');
                err = checkValue.set(value)
                    .loanLess(loan.value.replace(/,/g,''), payment.value.replace(/,/g, ''));
                break;
            case 'loanTerm':
                err = checkValue.set(value).integer();
                break;
            default:
                value = value.replace(/,/g, '');
                err = checkValue.set(value);
        }

        if(key !== 'name') {
            err = err
                .zero()
                .empty()
                .nan()
                .negative();
        }
        
        err = err.getMessage();

        if(err && !errors.length) {
            errors = [ind, err];
        }

        prev[key] = value;

        return prev;
    }, {});
    
    if(errors.length) {
        errorMessage.innerText = errors[1];

        const inputIndex = errors[0];
        inputs[inputIndex].classList.add('empty');
        inputs[inputIndex].focus();

        return false;
    }

    if(+mode) {
        formData.id = +form.getAttribute('id');
        editBankStorage(formData);

        let ind = +form.getAttribute('rowId');
        editBankTable(ind, formData);
    }else {
        formData['id'] = unique();
        if(storage().length === 0) {
            addBankStorage(formData);
            createTable();
        }else {
            addBankStorage(formData);
            addBankTable(formData);
        }

        selectAddOption(formData.id);
    }

    toggleModalWindow();
});

const info = document.querySelectorAll('.info');
const tooltip = document.querySelector('#tooltip');

for(let i = 0; i < info.length; i++) {
    info[i].innerHTML = infoImage;
    
    info[i].addEventListener('mouseover', function() {

        tooltip.innerText = this.dataset.tooltip;
        tooltip.classList.add('visible');

        let infoLeft = this.offsetLeft + 30;
        let infoTop = this.offsetTop;
        let tooltipHeight = tooltip.offsetHeight / 2;

        tooltip.style.left = infoLeft + 'px';
        tooltip.style.top = infoTop - tooltipHeight + (this.parentNode.clientHeight / 2) + 'px';
    });

    info[i].addEventListener('mouseout', function() {
        tooltip.classList.remove('visible');
        tooltip.innerText = '';
    });
}

closeButtonModal.addEventListener('click', function(e) {
    e.preventDefault();

    toggleModalWindow();
});

// table

table.addEventListener('click', function(e) {
    const editButtons = document.querySelectorAll('.edit-buttons');
    const rows = document.querySelectorAll('.table-row');

    const target = getRowElem(e.target, 'DIV');
    let rowId = [...editButtons].indexOf(target);
    
    if(rowId === -1) {
        if(e.target === table) return; 
        rowId = [...rows].indexOf(getRowElem(e.target, 'DIV', 'table-row'));
        toggleBankFullName(rowId, rows);
        return;
    }

    const bankId = rows[rowId].querySelector('div').getAttribute('id');

    const targetLi = getRowElem(e.target, 'LI');
    const className = targetLi.getAttribute('type');

    switch(className) {
        case 'edit':
            toggleModalWindow();
            clearModalWindowData();
            
            const dataBank = getBankStorage(bankId);
            setModalWindowData(dataBank);
            
            addButtonModal.setAttribute('edit', "1");
            addButtonModal.innerText = 'Edit';
            
            form.setAttribute('id', bankId);
            form.setAttribute('rowId', rowId);

            break;
        case 'remove':
            removeBankStorage(bankId);
            removeBankTable(rowId);
            
            selectRemoveOption(bankId);
            break;
        default:
            clearStorage();
            clearTable();
            selectFillListOfBanks();
    }
    
});

function getRowElem(tag, name, clss = false) {
    if(tag.tagName !== name && typeof clss !== 'string') {
        return getRowElem(tag.parentNode, name);
    }else if(!tag.classList.contains(clss) && typeof clss === 'string') {
        return getRowElem(tag.parentNode, name, clss);
    }

    return tag;
}

function toggleBankFullName(rowId, rows) {
    const row = rows[rowId];
    console.log(row);

    const rowSpan = row.querySelector('div span');
    const name = rowSpan.getAttribute('name');

    if(row.classList.contains('full-name')) {
        row.classList.remove('full-name');
    }
    if(name.length > rowSpan.innerText.length) row.classList.add('full-name');

    rowSpan.setAttribute('name', rowSpan.innerText);
    rowSpan.innerText = name;
}

// navigation tabs

let nav = document.querySelector('nav > ul');
let tabs = nav.querySelectorAll('li');
nav.addEventListener('click', function(e) {
    let index = [...tabs].findIndex(el => el === e.target);

    if(index !== tabs.length - 1 && index !== -1) {
        [...tabs].map(el => el.classList.remove('active'));
        e.target.classList.add('active');

        calculator.classList.add('hidden');
        table.classList.add('hidden');

        if(index === 0) {
            table.classList.remove('hidden');
            shorterBankName();
        }
        
        if(index === 1) {
            calculator.classList.remove('hidden');
        }
    }
});
