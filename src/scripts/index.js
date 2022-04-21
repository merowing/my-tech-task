import { infoImage } from "./images.js";
import { storage, addBankStorage, editBankStorage, removeBankStorage } from "./localstorage.js";
import { addBankTable, createTable } from "./table.js";
import unique from "./unique.js";

createTable();

const form = document.querySelector('#bankForm');
const inputs = form.querySelectorAll('input');

const bg = document.querySelector('.background');
const modal = document.querySelector('.modal-window');

let state = false;

let newBankButton = document.querySelector('.new-bank');
newBankButton.addEventListener('click', function() {
    toggleModalWindow();
});

let closeModalWindow = document.querySelector('.cancel-btn');
closeModalWindow.addEventListener('click', function(e) {
    e.preventDefault();

    toggleModalWindow();
});

function toggleModalWindow() {
    modal.classList.add('visible');
    bg.classList.add('visible');
    
    if(state) {
        modal.classList.remove('visible');
        bg.classList.remove('visible');
    }

    state = !state;
}

// add button
const addButton = document.querySelector('.add-btn');
addButton.addEventListener('click', function(e) {
    e.preventDefault();
    let bank = new FormData(form);
    let errors = [];

    let formData = [...bank.entries()].reduce((prev, current, ind) => {
        let [key, value] = current;
        if(key !== 'name' && value) {
            let val = +value.replace(',', '');
            prev[key] = val;
            if(isNaN(val)) errors.push(ind);
        }else {
            prev[key] = value || null;
        }
        if(!value) errors.push(ind);

        return prev;
    }, {});

    if(errors.length) {
        for(let i = 0; i < errors.length; i++) {
            inputs[errors[i]].classList.add('empty');
        }
        return false;
    }

    formData['id'] = unique();
    if(storage().length === 0) {
        addBankStorage(formData);
        createTable();
    }else {
        addBankTable(formData);
        addBankStorage(formData);
    }

    toggleModalWindow();
});

// info image
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

// form
form.addEventListener('click', function(e) {
    const target = e.target;
    if(target.tagName === 'INPUT') {
        target.classList.remove('empty');
    }
});

const loan = document.querySelector('#loan');
loan.addEventListener('keyup', function() {
    splitNumber(this);
});
const payment = document.querySelector('#down-payment');
payment.addEventListener('keyup', function(e) {
    splitNumber(this);
})

function splitNumber(that) {
    let num = that.value.replace(/,/g, '');
    num = num.replace(/[^0-9]+/g, '');
    that.value = num.split('').reverse().reduce((prev, current, index) => {
        if(index % 3 === 0 && index !== 0) {
            prev.push(',');
        }
        prev.push(current);
        return prev;
    }, []).reverse().join('');
}

const term = document.querySelector('#term');
const monthTerm = [1, 2, 3, 4, 5, 6, 9, 12, 24, 36];
const fragments = monthTerm.reduce((prev, current) => {
    let option = document.createElement('option');
    option.innerText = current;
    option.value = current;
    prev.appendChild(option);
    
    return prev;
}, document.createDocumentFragment());

term.appendChild(fragments);

// table

const table = document.querySelector('.table');
table.addEventListener('click', function(e) {
    const editButtons = document.querySelectorAll('.edit-buttons');
    const rows = document.querySelectorAll('.table-row');

    const target = getRowElem(e.target, 'DIV');
    const index = [...editButtons].indexOf(target);
    
    const id = rows[index].querySelector('div').getAttribute('id');
    alert(id);
    const targetLi = getRowElem(e.target, 'LI');
    console.log(targetLi);
});

function getRowElem(tag, name) {
    if(tag.tagName !== name) {
        return getRowElem(tag.parentNode, name);
    }
    return tag;
}