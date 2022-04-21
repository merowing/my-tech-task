import { pencilImage, removeImage, infoImage } from "./images.js";
import { storage, addBank, editBank, removeBank } from "./localstorage.js";

let form = document.querySelector('#bankForm');

// add button
const addButton = document.querySelector('.add-btn');
addButton.addEventListener('click', function(e) {
    e.preventDefault();
    let bank = new FormData(form);

    let formData = [...bank.entries()].reduce((prev, current) => {
        let [key, value] = current;
        if(key !== 'name' && value) {
            prev[key] = +value.replace(',', '');
        }else {
            prev[key] = value || null;
        }
        return prev;
    }, {});

    addBank(formData);
});

// info image
const info = document.querySelectorAll('.info');
const tooltip = document.querySelector('#tooltip');
const modal = document.querySelector('.modal-window');

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

const load = document.querySelector('#loan');
load.addEventListener('keyup', function() {
    splitNumber(this);
});
const payment = document.querySelector('#down-payment');
payment.addEventListener('keyup', function() {
    splitNumber(this);
})

function splitNumber(that) {
    let num = that.value.replace(/,/g, '');
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
