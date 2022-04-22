import { storage, getBankStorage } from "./localstorage.js";

const calculator = document.querySelector('.calculator');
const formCalculator = document.querySelector('#formCalculator');
const information = document.querySelector('.information');

const banks = storage();

// fill select
const selectBank = calculator.querySelector('.select-bank > select');

let optionsFragment = banks.reduce((prevItem, item) => {
    let option = document.createElement('option');
    option.value = item.id;
    option.innerText = item.name;
    prevItem.appendChild(option);
    
    return prevItem;
}, document.createDocumentFragment());
selectBank.appendChild(optionsFragment);

selectBank.addEventListener('change', function() {
    let id = +this.value;
    let data = getBankStorage(id);
    if(data) {
        fillData(data);
        calculate();
    }else {
        clearfillData();
    }
});

function fillData(data) {
    Object.keys(data).map(key => {
        let field = formCalculator.querySelector(`input[name="${key}"]`);
        if(field && key !== 'interestRate') {
            const text = field.nextElementSibling.innerText.split(' ')[0];
            field.nextElementSibling.innerText = text + ' ' + data[key];
        }
        if(key === 'interestRate') {
            field.value = data[key] + '%';
        }
    });
}

function clearfillData() {
    [...formCalculator.querySelectorAll(`span.title`)].map(el => {
        let text = el.innerText.split(' ')[0];
        
        if(text) {
            el.innerText = text + ' ' + 0;
        }
    });

    formCalculator.querySelector(`input[name]`).value = 0;
    information.innerText = '';
}

formCalculator.addEventListener('keyup', function() {
    calculate();
});

formCalculator.addEventListener('click', function(e) {
    let tag = e.target;
    if(tag.tagName === 'INPUT' && tag.value === '0') {
        tag.value = '';
    }
});
function returnZero(event) {
    let formInputs = formCalculator.querySelectorAll('input');
    [...formInputs].map(el => {
        if(el.value === '' && event.target !== el) el.value = 0;
    });
}
document.body.addEventListener('click', e => returnZero(e));

function calculate() {
    let formData = new FormData(formCalculator);

    console.log([...formData.entries()]);

    const { maximumLoan, minimumDownPayment, interestRate, loanTerm } = [...formData.entries()].reduce((prev, current) => {
        let [key, value] = current;
        prev[key] = parseInt(value);
        return prev;
    }, {});

    console.log(maximumLoan, interestRate, loanTerm, minimumDownPayment);

    //let a = (1 + (interestRate / 100 / 12)) ** loanTerm;
    const top = (maximumLoan - minimumDownPayment) * (interestRate / 100 / 12 ) * ((1 + (interestRate / 100 / 12)) ** loanTerm);
    const bottom = ((1 + (interestRate / 100 / 12)) ** loanTerm) - 1;

    const monthlyPayment = top / bottom;

    information.innerText = 'Monthly principal: ' + 0;
    if(!isNaN(monthlyPayment) && isFinite(monthlyPayment)) {
        
        const money = [];
        money[0] = { name: 'Total monthly payment', val: monthlyPayment.toFixed(2) };
        money[1] = { name:'Annual payment', val: (monthlyPayment * 12).toFixed(2) };
        money[2] = { name: 'Total payments', val: (monthlyPayment * loanTerm).toFixed(2) };
        money[3] = { name: 'Total interest paid', val: ((monthlyPayment * loanTerm) - maximumLoan - minimumDownPayment).toFixed(2) };
        
        
    }

}
