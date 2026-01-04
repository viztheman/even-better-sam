const fs = require('fs');
const rawdict = require(`./${process.argv[2]}`);
const indexed = {};

let ptr = null;
let primaryIndex = '';
let secondaryIndex = '';
let tertiaryIndex = '';

for (const key in rawdict) {
    if (primaryIndex !== key[0]) {
        primaryIndex = key[0];
        secondaryIndex = '';
        tertiaryIndex = '';
        indexed[primaryIndex] = {};
    }
    if (secondaryIndex !== key[1]) {
        secondaryIndex = key[1];
        tertiaryIndex = '';
        indexed[primaryIndex][secondaryIndex] = {};
    }
    if (tertiaryIndex !== key[2]) {
        tertiaryIndex = key[2];
        ptr = indexed[primaryIndex][secondaryIndex][tertiaryIndex] = [];
    }
    ptr.push(` (${key}) =${rawdict[key]}`);
}

fs.writeFileSync(process.argv[3], JSON.stringify(indexed));
