/**
 * ATHUGA: Það þarf ekki að keyra þetta skjal eða nota það neitt við vefþjónustuna
 * þetta var keyrt einu sinni til þess að mynda json gögnin sem verða notuð.
 */

import { readFile as fsReadFile, writeFile } from 'fs/promises';


//Þetta fall er hins vegar notað í setup.ts
export async function getFile(filepath : string) : Promise<string> | null{
    try {
        const content = await fsReadFile(filepath,'utf8');
        return content.toString();
    } catch (e) {
        console.error('gat ekki lesið skránna: ', e);
        return null;
    }
}

async function writeNewData(data : Array<any>){
    const outpath = './data/eventData.json';
    const dataString = JSON.stringify(data,null,2);
    try {
        await writeFile(outpath, dataString);
        console.log('Json skrá gerð.');
    } catch (err) {
        console.error('Error við að skrifa json skrá:', err);
    }
}

async function makeData(){
    const fileString = await getFile('./data/events.json');
    let dataJson;
    if(fileString){ dataJson = JSON.parse(fileString); }
    const newData = [];
    for(const event of dataJson){
        const eventData = {
            id: event.id,
            title: event.language.is.title,
            place: event.language.is.place,
            event_image: event.event_image,
            date: event.end
        };
        newData.push(eventData);
    }
    await writeNewData(newData);
}

makeData();
