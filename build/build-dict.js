const fs = require('fs');
const readline = require('readline');

const RgxValidLine = /^[0-9a-z'][a-z']{2,} /i;

function checkCmdLine() {
    if (process.argv.length >= 4)
        return true;

    const script = process.argv[1].split('/').slice(-1);
    console.log(`USAGE: node ${script} <dict> [<dict2> ...] <output>`);
    return false;
}

function extract(line) {
    const tokens = line.split(/\s+/);
    const key = tokens[0].toUpperCase();

    const value = tokens.slice(1).join('').toUpperCase()
        .replace(/H{2,}/g, 'H')
        .replace(/JH/g, 'J')
        .replace(/^H/, '/H')
        .replace(/0/g, '4')
        .replace(/1/g, '5')
        .replace(/2/g, '6');

    return {key, value};
}

function fetchIndex(dictionary, key) {
    let ptr = dictionary;

    if (!ptr[key[0]]) ptr[key[0]] = {};
    ptr = ptr[key[0]];

    if (!ptr[key[1]]) ptr[key[1]] = {};
    ptr = ptr[key[1]];

    if (!ptr[key[2]]) ptr[key[2]] = [];
    return ptr[key[2]];
}

function sortNodes(ptr) {
    if (Array.isArray(ptr))
        return ptr.sort();

    for (const key in ptr)
        sortNodes(ptr[key]);
}

async function main() {
    if (!checkCmdLine())
        return;

    const files = process.argv.slice(2, -1);
    const output = process.argv.slice(-1)[0];
    const dictionary = {};

    for (const file of files) {
        const stream = fs.createReadStream(file);

        const reader = readline.createInterface({
            input: stream,
            crlfDelay: 'infinity'
        });

        for await (const line of reader) {
            if (!RgxValidLine.test(line))
                continue;
            
            const {key, value} = extract(line);
            const entry = ` (${key}) =${value}`;
            const ptr = fetchIndex(dictionary, key);
            const index = ptr.indexOf(entry);

            if (index >= 0)
                ptr[index] = entry;
            else
                ptr.push(entry);
        }

        reader.close();
        stream.close();
    }

    sortNodes(dictionary);
    fs.writeFileSync(output, JSON.stringify(dictionary));
}
main();
