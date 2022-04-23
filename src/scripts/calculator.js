import checkValue from "./checkValue.js";
import { storage, getBankStorage } from "./localstorage.js";
import { splitNumber } from "./modalWindow.js";

const calculator = document.querySelector('.calculator');
const formCalculator = document.querySelector('#formCalculator');
const information = document.querySelector('.information');
const formInputs = formCalculator.querySelectorAll('input');
    
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
function selectAddOption(id) {
    let data = getBankStorage(id);
    let option = document.createElement('option');
    option.value = data.id;
    option.innerText = data.name;
    
    selectBank.appendChild(option);
}
function selectRemoveOption(id) {
    let opts = selectBank.querySelectorAll('option');
    let opt = [...opts].filter(item => +item.value === +id)[0];
    let ind = [...selectBank].findIndex(item => +item.value === +id);
    
    let selIndex = selectBank.selectedIndex;
    if(+opts[selIndex].value === +id) {
        selectBank.selectedIndex = ind - 1;
    }
    opt.parentNode.removeChild(opt);

    selectBank.dispatchEvent(new Event('change'));
}
function selectEditOption() {
    selectBank.dispatchEvent(new Event('change'));
}

selectBank.addEventListener('change', function() {
    let id = +this.value;
    let data = getBankStorage(id);
    if(data) {
        fillData(data);
    }else {
        clearfillData();
    }

    calculateErrors();
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

    [...formCalculator.querySelectorAll(`input[name]`)].map(el => {
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
                err = checkValue.loanLess(formInputs[1].value.replace(/,/g, ''), formInputs[2].value.replace(/,/g, '')).getMessage();
            
                if(+formInputs[1].value.replace(/,/g, '') > getBankStorage(id).maximumLoan) {
                    err = 'value more than bank allows';
                }

            }

            if(nameAttr === 'minimumDownPayment') {
                let paymentNum = +formInputs[2].value.replace(/,/g, '');
                if(paymentNum < getBankStorage(id).minimumDownPayment && paymentNum !== 0) {
                    err = 'value less than bank allows';
                }
            }

            if(nameAttr === 'loanTerm') {
                let termNum = +formInputs[3].value.match(/[0-9]+/)[0];
                if(termNum > getBankStorage(id).loanTerm && termNum > 0) {
                    err = 'bank doesn\'t allow to take for a longer period';
                }
            }

            if(err) {
                const paramName = document.querySelectorAll('.data > div span')[ind].innerText;
                return `<strong>${paramName}</strong>: ${err}`;
            }
        }
    }).filter(item => item);

    if(!errors.length) calculate();
    else {
        errorBlock.classList.remove('hidden');
        errorBlock.innerHTML = errors.join('<br>');
    }
}

formCalculator.addEventListener('click', function(e) {
    let tag = e.target;
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
    [...formInputs].map(el => {
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
    let formData = new FormData(formCalculator);

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

export { selectFillListOfBanks, selectAddOption, selectRemoveOption, selectEditOption };
