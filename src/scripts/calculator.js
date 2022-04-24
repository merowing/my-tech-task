import checkValue from "./checkValue.js";
import { storage, getBank } from "./localstorage.js";
import splitNumber from "./splitNumber.js";
import { calculator } from './blocks.js';

const formCalculator = document.querySelector('#formCalculator');
const information = document.querySelector('.information');
const formInputs = formCalculator.querySelectorAll('input');
const selectBank = calculator.querySelector('.select-bank > select');

calculate();

// fill select

function createSelectListOfBanks() {
    const banks = storage();
    selectBank.innerHTML = '<option>Select a bank</option>';

    const optionsFragment = banks.reduce((prevItem, item, ind) => {
        const { name, id } = item;
        const option = document.createElement('option');
        option.value = id;
        option.innerText = `${(ind + 1)}. ${name}`;
        prevItem.appendChild(option);
        
        return prevItem;
    }, document.createDocumentFragment());
    selectBank.appendChild(optionsFragment);
    
    clearfillData();
}

function selectAddOption(ind) {
    const { id, name } = getBank(ind);
    const option = document.createElement('option');
    option.value = id;
    option.innerText = `${storage().length}. ${name}`;
    
    selectBank.appendChild(option);
}

function selectRemoveOption(id) {
    const optionElements = selectBank.querySelectorAll('option');
    const optionElement = [...optionElements].filter(item => +item.value === +id)[0];
    const ind = [...selectBank].findIndex(item => +item.value === +id);
    
    const selIndex = selectBank.selectedIndex;
    if(+optionElements[selIndex].value === +id) {
        selectBank.selectedIndex = ind - 1;
    }
    optionElement.parentNode.removeChild(optionElement);

    selectBank.dispatchEvent(new Event('change'));
}

function selectEditOption(id) {
    const optionElements = selectBank.querySelectorAll('option');
    const optionElement = [...optionElements].filter(item => +item.value === +id)[0];
    
    const optionNumber = optionElement.innerText.match(/^[0-9]+\./g)[0];
    optionElement.innerText = `${optionNumber} ${getBank(id).name}`;

    selectBank.dispatchEvent(new Event('change'));
}

selectBank.addEventListener('change', function() {
    const id = +this.value;
    if(isNaN(id)) {
        clearfillData();
        return false;
    }

    const data = getBank(id);
    fillData(data);

    calculateErrors();
    calculate();
});

function fillData(data) {
    Object.keys(data).forEach(key => {
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
    [...formCalculator.querySelectorAll(`span.title`)].forEach(el => {
        let text = el.innerText.split(' ')[0];
        
        if(text) {
            el.innerText = text + ' ' + 0;
        }
    });

    [...formCalculator.querySelectorAll(`input[name]`)].forEach(el => {
        el.value = 0;
    });

    information.innerHTML = '';
    calculate();
}

const errorBlock = document.querySelector('.calculator-error');
    
formCalculator.addEventListener('keyup', function(e) {
    const val = e.target.value.replace(/,/g, '');
    const elem = [...formInputs].filter(item => item === e.target)[0];
    const elemName = elem.getAttribute('name');
    
    let id = +selectBank.value;
    
    if(isNaN(id)) return false;
    
    if(e.target.getAttribute('name') !== 'loanTerm') e.target.value = splitNumber(val);
    
    calculateErrors();
});

function calculateErrors() {
    let id = +selectBank.value;
    
    errorBlock.innerText = ''
    errorBlock.classList.add('hidden');

    if(isNaN(id)) return false;
    
    const maxLoan = formInputs[1].value.replace(/,/g, '');
    const minPayment = formInputs[2].value.replace(/,/g, '');
    const loanTerm = formInputs[3].value;

    let errors = [...formInputs].map((input, ind) => {
        let nameAttr = input.getAttribute('name');
        if(nameAttr !== 'interestRate') {
            let inputVal = input.value;
            
            if(nameAttr === 'loanTerm' &&
                inputVal.indexOf('month') >= 0) {
                    inputVal = inputVal.split(' ')[0];
            }else {
                inputVal = inputVal.replace(/,/g, '');
            }
            let err = checkValue.set(inputVal)
                        .nan()
                        .negative()
                        .getMessage();
            
            if(nameAttr === 'maximumLoan') {
                err = checkValue.loanLess(maxLoan, minPayment).getMessage();
            
                if(+maxLoan > getBank(id).maximumLoan) {
                    err = 'value more than bank allows';
                }

            }

            if(nameAttr === 'minimumDownPayment') {
                let paymentNum = +minPayment;
                if(paymentNum < getBank(id).minimumDownPayment && paymentNum !== 0) {
                    err = 'value less than bank allows';
                }
            }

            if(nameAttr === 'loanTerm') {
                if(loanTerm !== '') {
                    let termNum = +loanTerm.match(/[0-9]+/)[0];
                    if(termNum > getBank(id).loanTerm && termNum > 0) {
                        err = 'bank doesn\'t allow to take for a longer period';
                    }
                }
            }

            if(err) {
                const paramName = document.querySelectorAll('.data > div span')[ind].innerText;
                return `<strong>${paramName}</strong>: ${err}`;
            }
        }
    }).filter(item => item);

    if(errors.length === 0) calculate();
    else {
        errorBlock.classList.remove('hidden');
        errorBlock.innerHTML = errors.join('<br>');
    }
}

formCalculator.addEventListener('click', function(e) {
    const tag = e.target;
    if(tag.tagName === 'INPUT' && tag.value === '0') {
        tag.value = '';
    }

    if(tag.value !== '0' && tag.getAttribute('name') === 'loanTerm' && parseInt(tag.value) > 0) {
        let num = tag.value.match(/[0-9]+/)[0];
        tag.value = '';
        tag.value = num;
        e.stopPropagation();
    }

});
function returnZero(event) {
    [...formInputs].forEach(el => {
        if(el.value === '' && event.target !== el) {
            el.value = 0;
            calculate();
        }
        
        if(el.value !== '0' && el.value !== '' && el.getAttribute('name') === 'loanTerm' && !isNaN(el.value) && +el.value > 0) {
            let num = el.value.match(/[0-9]+/)[0];
            let str = (num > 1) ? num + ' months' : num + ' month';
            el.value = '';
            el.value = str;
        }
    });
}
document.body.addEventListener('click', e => returnZero(e));

function calculate() {
    const formData = new FormData(formCalculator);

    const { maximumLoan, minimumDownPayment, interestRate, loanTerm } = [...formData.entries()].reduce((prev, current) => {
        let [key, value] = current;
        prev[key] = parseInt(value.replace(/,/g, '')) || 0;
        return prev;
    }, {});

    const top = (maximumLoan - minimumDownPayment) * (interestRate / 100 / 12 ) * ((1 + (interestRate / 100 / 12)) ** loanTerm);
    const bottom = ((1 + (interestRate / 100 / 12)) ** loanTerm) - 1;

    const monthlyPayment = top / bottom;

    information.innerText = '';
        
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

}

export { selectAddOption, selectRemoveOption, createSelectListOfBanks, selectEditOption };
