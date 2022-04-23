import { form, errorMessage } from './blocks.js';

const bg = document.querySelector('.background');
const modal = document.querySelector('.modal-window');

function toggleModalWindow() {
    if(!modal.classList.contains('visible')) {
        modal.classList.add('visible');
        bg.classList.add('visible');
    }else {
        modal.classList.remove('visible');
        bg.classList.remove('visible');
    }

    form.removeAttribute('id');
    form.removeAttribute('index');
    form.querySelector('input').focus();
}

function clearModalWindowData() {
    [...form.querySelectorAll('* [name]')].map(el => {
        el.classList.remove('empty');
        if(el.tagName === 'SELECT') el.value = 1;
        else el.value = '';
    });
    
    errorMessage.innerText = '';
}
function setModalWindowData(data) {
    Object.keys(data).map((key, ind) => {
        if(key !== 'id') {
            let item = form.querySelector(`[name="${key}"]`);
            item.value = data[key];
            if(key === 'maximumLoan' || key === 'minimumDownPayment') {
                item.value = splitNumber(item.value.replace(/,/g, ''));
            }
        }
    });
}

function splitNumber(num) {
    return num.replace(/^\s+|\s+$/g, '').split('').reverse().reduce((prev, current, index) => {
        if(index % 3 === 0 && index !== 0) {
            prev.push(',');
        }
        prev.push(current);
        return prev;
    }, []).reverse().join('');
}

export { toggleModalWindow, splitNumber, clearModalWindowData, setModalWindowData };
