import { form, errorMessage } from './blocks.js';
import splitNumber from './splitNumber.js';

const bg = document.querySelector('.background');
const modal = document.querySelector('.modal-window');

function toggleModalWindow() {
    if(!modal.classList.contains('visible')) {
        modal.classList.add('visible');
        bg.classList.add('visible');
        
        form.querySelector('input').focus();
    }else {
        modal.classList.remove('visible');
        bg.classList.remove('visible');
    }
}

function clearModalWindowData() {
    [...form.querySelectorAll('* [name]')].forEach(el => {
        el.classList.remove('empty');
        if(el.tagName === 'SELECT') el.value = 1;
        else el.value = '';
    });
    
    errorMessage.innerText = '';
}

function setModalWindowData(data) {
    Object.keys(data).forEach(key => {
        let item = form.querySelector(`[name="${key}"]`);

        if(item) {
            const value = data[key];
            item.value = value;

            if(key === 'maximumLoan' || key === 'minimumDownPayment') {
                item.value = splitNumber(value.toString());
            }
        }
    });
}

export { toggleModalWindow, clearModalWindowData, setModalWindowData };
