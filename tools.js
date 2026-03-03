export async function throwLog(str) {
    const now = new Date().toLocaleString();
    console.log(`${now} INFO - ${str}`);
}
export async function throwErr(err) {
    const now = new Date().toLocaleString();
    console.error(`${now} ERROR - ${err}`);
}
export async function returnName(type) {
    return "temp-" + Math.floor(Math.random() * 99999) + type;
}
