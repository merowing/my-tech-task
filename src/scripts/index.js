import {
    storage,
    addBank,
    editBank,
    removeBank,
    clearStorage,
    getBank,
    fillEmptyStorage
} from "./localstorage.js";
import {
    addBankTable,
    clearTable,
    createTable,
    editBankTable,
    removeBankTable,
    shorterBankName
} from "./table.js";
import { table, calculator, form, errorMessage } from './blocks.js';
import { toggleModalWindow, clearModalWindowData, setModalWindowData } from './modalWindow.js';
import { selectAddOption, selectRemoveOption, createSelectListOfBanks, selectEditOption } from "./calculator.js";
import { infoImage } from "./images.js";
import checkValue from "./checkValue.js";
import unique from "./unique.js";
import splitNumber from "./splitNumber.js";

fillEmptyStorage();
createTable();

const nav = document.querySelector('nav > ul');
const tabs = nav.querySelectorAll('li');

const newBankButton = document.querySelector('.new-bank');

const loan = document.querySelector('#loan');
const payment = document.querySelector('#down-payment');
const rate = document.querySelector('#rate');
const addButtonModal = document.querySelector('.add-btn');
const closeButtonModal = document.querySelector('.cancel-btn');
const inputs = form.querySelectorAll('input');

newBankButton.addEventListener('click', function() {
    clearModalWindowData();
    
    addButtonModal.setAttribute('edit', "0");
    addButtonModal.innerText = 'Add';
    
    toggleModalWindow();
});

// form

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
    const num = this.value.replace(/,/g, '');
    this.value = splitNumber(num);
});

payment.addEventListener('keyup', function(e) {
    let num = this.value.replace(/,/g, '');
    this.value = splitNumber(num);
});

addButtonModal.addEventListener('click', function(e) {
    e.preventDefault();
    const bank = new FormData(form);
    const mode = this.getAttribute('edit');

    [...inputs].forEach(item => {
        item.classList.remove('empty');
        item.value = item.value.replace(/^\s+|\s+$/g, '');
    });
    let err = '';
    let errors = [];

    const formData = [...bank.entries()].reduce((prev, current, ind) => {
        let [key, value] = current;

        switch(key) {
            case 'name': {
                let changeName = storage().some(item => item.name === value);
                if(typeof form.getAttribute('id') !== 'object') {
                    changeName = storage().some(item => {
                        return item.name === value && item.id !== +form.getAttribute('id')
                    });
                }
                err = checkValue.set(value).empty();
                if(changeName) err = err.bankPresent();
                break;
            }
            case 'minimumDownPayment': {
                value = value.replace(/,/g, '');
                err = checkValue.set(value)
                    .loanLess(loan.value.replace(/,/g,''), payment.value.replace(/,/g, ''));
                break;
            }
            case 'loanTerm': {
                err = checkValue.set(value).integer();
                break;
            }
            default: {
                value = value.replace(/,/g, '');
                err = checkValue.set(value);
            }
        }

        if(key !== 'name') {
            err = err
                .zero()
                .empty()
                .nan()
                .negative();
        }
        
        err = err.getMessage();

        if(err && errors.length === 0) {
            errors = [ind, err];
        }

        prev[key] = value;

        return prev;
    }, {});
    
    if(errors.length > 0) {
        const [inputIndex, errMess] = errors;
        errorMessage.innerText = errMess;

        inputs[inputIndex].classList.add('empty');
        inputs[inputIndex].focus();

        return false;
    }

    if(+mode) {
        formData.id = +form.getAttribute('id');
        editBank(formData);

        const rowId = +form.getAttribute('rowId');
        editBankTable(rowId, formData);

        selectEditOption(formData.id);
    }else {
        formData['id'] = unique();
        if(storage().length === 0) {
            addBank(formData);
            createTable();
        }else {
            addBank(formData);
            addBankTable(formData);
        }

        selectAddOption(formData.id);
    }

    toggleModalWindow();
});

const infoElements = document.querySelectorAll('.info');
const tooltip = document.querySelector('#tooltip');

infoElements.forEach(info => {
    info.innerHTML = infoImage;
    
    info.addEventListener('mouseover', function() {

        tooltip.innerText = this.dataset.tooltip;
        tooltip.classList.add('visible');

        const infoLeft = this.offsetLeft + 30;
        const infoTop = this.offsetTop;
        const tooltipHeight = tooltip.offsetHeight / 2;

        tooltip.style.left = infoLeft + 'px';
        tooltip.style.top = infoTop - tooltipHeight + (this.parentNode.clientHeight / 2) + 'px';
    });

    info.addEventListener('mouseout', function() {
        tooltip.classList.remove('visible');
        tooltip.innerText = '';
    });
});

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
        case 'edit': {
            toggleModalWindow();
            clearModalWindowData();
            
            const dataBank = getBank(bankId);
            setModalWindowData(dataBank);
            
            addButtonModal.setAttribute('edit', "1");
            addButtonModal.innerText = 'Edit';
            
            form.setAttribute('id', bankId);
            form.setAttribute('rowId', rowId);

            break;
        }
        case 'remove': {
            removeBank(bankId);
            removeBankTable(rowId);
            
            selectRemoveOption(bankId);
            break;
        }
        default: {
            clearStorage();
            clearTable();
            createSelectListOfBanks();
        }
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

nav.addEventListener('click', function(e) {
    const index = [...tabs].findIndex(el => el === e.target);

    if(index !== tabs.length - 1 && index !== -1) {
        [...tabs].forEach(el => el.classList.remove('active'));
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
