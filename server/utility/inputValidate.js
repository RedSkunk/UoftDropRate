exports.isPositiveInteger = function isPositiveInteger(input) {
    return 0 === input % (!isNaN(parseFloat(input)) && 0 <= ~~input) && input.length <= 10;
}

exports.isWhitespaceOrNull = function isWhitespaceOrNull(input) {
    return input == null || input.length === 0;
}