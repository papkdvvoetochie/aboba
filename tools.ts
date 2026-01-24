export async function throwLog(str: string): Promise<void> {
    const now = new Date().toLocaleString();
    console.log(`${now} INFO - ${str}`);
}

export async function throwErr(err: string): Promise<void> {
    const now = new Date().toLocaleString();
    console.error(`${now} ERROR - ${err}`);
}

export async function returnName(type: string): Promise<string> {
    return "temp-" + Math.floor(Math.random() * 99999) + type;
}
