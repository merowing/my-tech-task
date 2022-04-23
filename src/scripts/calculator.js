import checkValue from "./checkValue.js";
import { storage, getBankStorage } from "./localstorage.js";
import { splitNumber } from "./modalWindow.js";

const calculator = document.querySelector('.calculator');
const formCalculator = document.querySelector('#formCalculator');
const information = document.querySelector('.information');
const formInputs = formCalculator.querySelectorAll('input');
    
//const banks = storage();
calculate();

// fill select
const selectBank = calculator.querySelector('.select-bank > select');

selectFillListOfBanks();

function selectFillListOfBanks() {
    const banks = storage();
    selectBank.innerHTML = '<option>Select a bank</option>';

    let optionsFragment = banks.reduce((prevItem, item) => {
        let option = document.createElement('option');
        option.value = item.id;
        option.innerText = item.name;
        prevItem.appendChild(option);
        
        return prevItem;
    }, document.createDocumentFragment());
    selectBank.appendChild(optionsFragment);
    
    clearfillData();
}

selectBank.addEventListener('change', function() {
    let id = +this.value;
    let data = getBankStorage(id);
    if(data) {
        fillData(data);
    }else {
        clearfillData();
    }
    calculate();
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
    
    calculate();
}

const errorBlock = document.querySelector('.calculator-error');
    
formCalculator.addEventListener('keyup', function(e) {
    const val = e.target.value.replace(/,/g, '');
    const elem = [...formInputs].filter(item => item === e.target);

    e.target.value = splitNumber(val);

    if(isNaN(val)) {
        errorBlock.classList.remove('hidden');
        errorBlock.innerText = errorsString['nan'];
        errorArr.push(elem);
    }

    const index = errorArr.indexOf(elem);
    if(index >= 0 && !isNaN(val)) {
        alert(index);
        errorArr.splice(index, 1);
    }

    if(!errorArr.length) {
        errorBlock.classList.add('hidden');
        calculate();
    }
});

formCalculator.addEventListener('click', function(e) {
    let tag = e.target;
    if(tag.tagName === 'INPUT' && tag.value === '0') {
        tag.value = '';
    }

    if(tag.value !== '0' && tag.getAttribute('name') === 'loanTerm') {
        let num = tag.value.match(/[0-9]+/)[0];
        tag.value = '';
        tag.value = num;
        e.stopPropagation();
    }

});
function returnZero(event) {
    [...formInputs].map(el => {
        if(el.value === '' && event.target !== el) {
            el.value = 0;
            calculate();
        }
        
        if(el.value !== '0' && el.value !== '' && el.getAttribute('name') === 'loanTerm') {
            let num = el.value.match(/[0-9]+/)[0];
            let str = (num > 1) ? num + ' months' : num + ' month';
            el.value = '';
            el.value = str;
        }
    });
}
document.body.addEventListener('click', e => returnZero(e));

function calculate() {
    let formData = new FormData(formCalculator);

    //console.log([...formData.entries()]);

    const { maximumLoan, minimumDownPayment, interestRate, loanTerm } = [...formData.entries()].reduce((prev, current) => {
        let [key, value] = current;
        prev[key] = parseInt(value.replace(/,/g, '')) || 0;
        return prev;
    }, {});

    console.log(maximumLoan, interestRate, loanTerm, minimumDownPayment);

    //let a = (1 + (interestRate / 100 / 12)) ** loanTerm;
    const top = (maximumLoan - minimumDownPayment) * (interestRate / 100 / 12 ) * ((1 + (interestRate / 100 / 12)) ** loanTerm);
    const bottom = ((1 + (interestRate / 100 / 12)) ** loanTerm) - 1;

    const monthlyPayment = top / bottom;

    information.innerText = '';
    //if(!isNaN(monthlyPayment) && isFinite(monthlyPayment)) {
        
        const money = [];
        money[0] = { name: 'Total monthly payment', val: monthlyPayment.toFixed(2) };
        money[1] = { name:'Annual payment', val: (monthlyPayment * 12).toFixed(2) };
        money[2] = { name: 'Total payments', val: (monthlyPayment * loanTerm).toFixed(2) };
        money[3] = { name: 'Total interest paid', val: ((monthlyPayment * loanTerm) - maximumLoan + minimumDownPayment).toFixed(2) };
        

        const moneyFragment = money.reduce((prev, current) => {
            let { name, val } = current;
            
            if(!isNaN(val) && isFinite(val)) {
                let valString = val.toString().split('.');
                val = splitNumber(valString[0]) + '.' + valString[1];
            }else {
                val = 0;
            }

            let div = document.createElement('div');
            div.innerHTML = `
                <span>${name}</span>
                <span>${val}</span>
            `;
            prev.appendChild(div);
            return prev;
        }, document.createDocumentFragment());

        information.appendChild(moneyFragment);
    //}

}

export default selectFillListOfBanks;