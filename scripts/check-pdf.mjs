
import * as pdf1 from 'pdf-parse';


try {
    const parser = new pdf1.PDFParse({ data: Buffer.from('test') });
    console.log('Parser instance:', parser);
    console.log('Parser keys:', Object.keys(parser));
    console.log('Parser proto keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
} catch (e) {
    console.error(e);
}
