import { readFile as fsReadFile } from 'fs/promises';

export async function getFile(filepath : string) : Promise<string> | null{
    try {
        const content = await fsReadFile(filepath,'utf8');
        return content.toString();
    } catch (e) {
        console.error('gat ekki lesið skránna: ', e);
        return null;
    }
}