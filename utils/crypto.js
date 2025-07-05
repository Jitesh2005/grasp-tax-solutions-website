const crypto = require('crypto');
const fs = require('fs');

const algorithm = 'aes-256-cbc';
const secretKey = Buffer.from('0123456789abcdef0123456789abcdef'); // 32-byte
const iv = Buffer.from('abcdef9876543210abcdef9876543210');       // 16-byte

function encryptFile(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);
        input.pipe(cipher).pipe(output);
        output.on('finish', () => resolve(true));
        output.on('error', reject);
    });
}

function decryptFile(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);
        input.pipe(decipher).pipe(output);
        output.on('finish', () => resolve(true));
        output.on('error', reject);
    });
}

module.exports = { encryptFile, decryptFile };
