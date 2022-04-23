function randomNum(min, max) {
    return Math.round((Math.random() * max - min) + min);
}

let banks = [
    'JPMorgan Chase & Co.',
    'Bank of America Corp.',
    'Wells Fargo & Co.',
    'Citigroup Inc.',
    'U.S. Bancorp',
    'Truist Bank',
    'PNC Financial Services Group Inc.',
    'TD Group US Holdings LLC',
    'Goldman Sachs Group Inc.',
    'Bank of New York Mellon Corp.'
];

let defaultBanks = banks.reduce((prev, curr, ind) => {
    prev.push({
        id: ind,
        name: curr,
        interestRate: randomNum(5, 30).toString(),
        maximumLoan: randomNum(100000, 1000000).toString(),
        minimumDownPayment: randomNum(5000, 50000).toString(),
        loanTerm: randomNum(1, 360).toString(),
    });
    
    return prev;
}, []);

export default defaultBanks;
