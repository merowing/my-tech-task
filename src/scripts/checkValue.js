import { storage } from "./localstorage.js";

const errorsString = {
    'negative':     'Negative number',
    'empty':        'Empty value',
    'nan':          'Not a number',
    'nonInteger':   'Number should be an interger',
    'zero':         'Zero number!',
    'loanLess':     'Maximum loan less or equal than payment!',
    'bankPresent':  'This bank has been already added',
};

const checkValue = {
    val: '',
    error: '',

    empty() {
        if(this.val === '') {
            this.error = errorsString['empty'];
        }
        return this;
    },
    nan() {
        if(isNaN(this.val) || /^0+[0-9]+/.test(this.val)) {
            this.error = errorsString['nan'];
        }
        return this;
    },
    zero() {
        let num = parseInt(this.val);
        if(num === 0) {
            this.error = errorsString['zero'];
        }
        return this;
    },
    integer() {
        if(!Number.isInteger(+this.val)) {
            this.error = errorsString['nonInteger'];
        }
        return this;
    },
    negative() {
        if(parseInt(this.val) < 0) {
            this.error = errorsString['negative'];
        }
        return this;
    },
    loanLess(loan, payment) {
        if(+loan <= +payment) {
            this.error = errorsString['loanLess'];
        }
        return this;
    },
    bankPresent() {
        let data = storage();
        this.val = this.val.replace(/^\s+|\s+$/g, '');
        let check = data.some(bank => bank.name.toLowerCase() === this.val.toLowerCase());
        if(check) {
            this.error = errorsString['bankPresent'];
        }
        return this;
    },
    set(value) {
        this.error = '';
        this.val = value.toString();
        return this;
    },
    getMessage() {
        return this.error;
    }
}

export default checkValue;
