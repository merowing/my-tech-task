const storageName = 'banks';

function storage() {
    if(!localStorage[storageName]) return [];

    return JSON.parse(localStorage[storageName]);
}
function writeStorage(data) {
    localStorage[storageName] = JSON.stringify(data);
}

function addBank(bank) {
    let data = [...storage(), bank];
    
    writeStorage(data);
}

function removeBank(index) {
    let data = storage();
    let id = data.findIndex(bank => bank.id === index);
    data.splice(id, 1);
    
    writeStorage(data);
}

function editBank(bank) {
    let data = storage();
    let id = bank.id;
    data[id] = bank;

    writeStorage(data);
}

export { storage, addBank, editBank, removeBank };
