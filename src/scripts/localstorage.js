import defaultBanks from "./defaultBanks.js";

const storageName = 'banks';

function storage() {
    if(!localStorage[storageName]) return [];
    return JSON.parse(localStorage[storageName]);
}
function writeStorage(data) {
    localStorage[storageName] = JSON.stringify(data);
}
function clearStorage() {
    localStorage.removeItem(storageName);
}
function fillEmptyStorage() {
    if(storage().length === 0) {
        defaultBanks.forEach(data => addBank(data));        
    }
}

function addBank(bank) {
    const data = [...storage(), bank];
    writeStorage(data);
}

function removeBank(index) {
    let data = [...storage()];
    const id = data.findIndex(bank => bank.id === +index);
    data.splice(id, 1);
    writeStorage(data);
}

function editBank(bank) {
    let data = [...storage()];
    const id = data.findIndex(item => item.id === bank.id);
    data[id] = bank;
    writeStorage(data);
}

function getBank(id) {
    return storage().filter(bank => bank.id === +id)[0];
}

export { storage, addBank, editBank, removeBank, clearStorage, getBank, fillEmptyStorage };
