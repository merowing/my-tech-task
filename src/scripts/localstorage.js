const storageName = 'banks';

function storage() {
    if(!localStorage[storageName]) return [];

    return JSON.parse(localStorage[storageName]);
}
function writeStorage(data) {
    localStorage[storageName] = JSON.stringify(data);
}

function addBankStorage(bank) {
    let data = [...storage(), bank];
    
    writeStorage(data);
}

function removeBankStorage(index) {
    let data = storage();
    let id = data.findIndex(bank => bank.id === +index);
    data.splice(id, 1);
    
    writeStorage(data);
}

function clearStorage() {
    localStorage.removeItem(storageName);
}

function editBankStorage(bank) {
    let data = storage();
    let id = data.findIndex(item => item.id === bank.id);
    data[id] = bank;

    writeStorage(data);
}

function getBankStorage(id) {
    return storage().filter(bank => bank.id === +id)[0];
}

export { storage, addBankStorage, editBankStorage, removeBankStorage, clearStorage, getBankStorage };
