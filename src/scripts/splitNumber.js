function splitNumber(num) {
    return num.replace(/^\s+|\s+$/g, '')
        .split('')
        .reverse()
        .reduce((prev, current, index) => {
            if(index % 3 === 0 && index !== 0) {
                prev.push(',');
            }
            prev.push(current);
            return prev;
    }, [])
    .reverse()
    .join('');
}

export default splitNumber;
