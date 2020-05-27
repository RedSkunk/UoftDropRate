exports.isPositiveInteger = function isPositiveInteger(input) {
    return 0 === input % (!isNaN(parseFloat(input)) && 0 <= ~~input) && input.length <= 10;
}

exports.getPercentDrop = function getPercentDrop(percentRemaining) {
    let percentDrop = 1 - parseFloat(percentRemaining);
    percentDrop = percentDrop * 100;

    if (percentDrop < 0) {
        return 0;
    }
    return percentDrop.toFixed(2);
}