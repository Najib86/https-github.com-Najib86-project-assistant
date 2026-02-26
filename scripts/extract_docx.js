
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const files = [
    path.join(__dirname, "..", "docs", "SOCIAL SCIENCES PROJECT GUIDE.docx"),
    path.join(__dirname, "..", "docs", "1500VA_Pure_Sine_Wave_Inverter_Research_Paper_UNIJOS.docx")
];

async function extract() {
    for (const file of files) {
        console.log(`--- EXTRACTING: ${file} ---`);
        try {
            const result = await mammoth.extractRawText({ path: file });
            console.log(result.value);
            console.log("\n\n");
        } catch (err) {
            console.error(`Error reading ${file}:`, err);
        }
    }
}

extract();
