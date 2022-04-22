import { infoImage } from "./images.js";
import { storage, addBankStorage, editBankStorage, removeBankStorage, clearStorage, getBankStorage } from "./localstorage.js";
import { addBankTable, clearTable, createTable, editBankTable, removeBankTable } from "./table.js";
import { table, calculator, form, errorMessage } from './blocks.js';
import unique from "./unique.js";
import { toggleModalWindow, splitNumber, clearModalWindowData, setModalWindowData } from './modalWindow.js';
import errorsString from './errorMessage.js';

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
    this.value = splitNumber(this);
});

payment.addEventListener('keyup', function(e) {
    this.value = splitNumber(this);
});

function checkFormValue(num) {
    if(num === '') return 'empty';
    
    num = +num;
    if(num < 0) return 'negative';
    if(isNaN(num)) return 'nan';
    if(num === 0) return 'zero';
    return false;
}

addButtonModal.addEventListener('click', function(e) {
    e.preventDefault();
    let bank = new FormData(form);
    const mode = this.getAttribute('edit');

    let err = null;
    let check;
    let inputIndex;
    let formData = [...bank.entries()].reduce((prev, current, ind) => {
        let [key, value] = current;

        if(key === 'name') {
            check = (value === '') ? 'empty' : null;
        }else if(key === 'loanTerm') {
            if(!Number.isInteger(+value)) {
                check = 'nonInteger';
            }else {
                check = checkFormValue(value);
            }
        }else {
            value = value.replace(',', '');
            check = checkFormValue(value);
        }
        if(key === 'minimumDownPayment' && +loan.value.replace(',','') < +payment.value.replace(',','')) {
            check = 'loanLess';
        }

        prev[key] = value;
        
        if(errorsString[check] && err === null) {
            err = check;
            inputIndex = ind;
        }

        return prev;
    }, {});

    if(err !== null) {
        errorMessage.innerText = errorsString[err];

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
    const rowId = [...editButtons].indexOf(target);
    
    if(rowId === -1) return;
    
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
            break;
        default:
            clearStorage();
            clearTable();
    }

});

function getRowElem(tag, name) {
    if(tag.tagName !== name) {
        return getRowElem(tag.parentNode, name);
    }
    return tag;
}

// navigation tabs

let nav = document.querySelector('nav > ul');
let tabs = nav.querySelectorAll('li');
nav.addEventListener('click', function(e) {
    let index = [...tabs].findIndex(el => el === e.target);

    if(index !== tabs.length - 1) {
        [...tabs].map(el => el.classList.remove('active'));
        e.target.classList.add('active');

        calculator.classList.add('hidden');
        table.classList.add('hidden');

        if(index === 0) {
            table.classList.remove('hidden');
        }
        
        if(index === 1) {
            calculator.classList.remove('hidden');
        }
    }
});
