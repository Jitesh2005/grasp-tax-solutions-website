const crypto = require('crypto');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const algorithm = 'aes-256-cbc';

// Get encryption key from environment variable (must be 32 bytes hex)
const getSecretKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    return Buffer.from(key, 'hex');
};

// Generate a new random IV for each encryption
const getIV = () => crypto.randomBytes(16);

function encryptFile(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const iv = getIV();
        const secretKey = getSecretKey();
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);

        // Prepend IV to the output file for use during decryption
        output.write(iv);

        input.pipe(cipher).pipe(output);
        output.on('finish', () => resolve(true));
        output.on('error', reject);
    });
}

function decryptFile(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const secretKey = getSecretKey();

        // Read the IV from the beginning of the file
        const readStream = fs.createReadStream(inputPath, { start: 0, end: 15 });
        let iv = null;

        readStream.on('data', (chunk) => {
            iv = chunk;
        });

        readStream.on('end', () => {
            const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
            const input = fs.createReadStream(inputPath, { start: 16 });
            const output = fs.createWriteStream(outputPath);

            input.pipe(decipher).pipe(output);
            output.on('finish', () => resolve(true));
            output.on('error', reject);
        });

        readStream.on('error', reject);
    });
}

module.exports = { encryptFile, decryptFile };
