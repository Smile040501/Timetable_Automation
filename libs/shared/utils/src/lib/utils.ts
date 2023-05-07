/* eslint-disable @typescript-eslint/no-explicit-any */
export const getRandomEnumKey = (enumeration: any) => {
    const keys = Object.keys(enumeration).filter(
        (k) => !(Math.abs(Number.parseInt(k)) + 1)
    );
    const enumKey = keys[Math.floor(Math.random() * keys.length)];
    return enumKey;
};

export const getRandomEnumValue = (enumeration: any) =>
    enumeration[getRandomEnumKey(enumeration)];

export const getEnumKeys = (enumeration: any) =>
    Object.keys(enumeration).filter((k) => !(Math.abs(Number.parseInt(k)) + 1));

export const getBiasedArray = (arr: any[], p: number[]) => {
    const biasedArray: any[] = [];
    arr.forEach((el, i) => {
        for (let j = 0; j < p[i]; ++j) {
            biasedArray.push(el);
        }
    });
    return biasedArray;
};

export const expandObject = (obj: { [prop: string]: any }) => {
    Object.keys(obj).forEach((key) => {
        const subKeys = key.split(/,\s?/);
        const target = obj[key];
        delete obj[key];
        subKeys.forEach((subKey) => (obj[subKey] = target));
    });
    return obj;
};

export const generateRandomColor = () => {
    const hex = Math.floor(Math.random() * 0xffffff);
    const color = "#" + hex.toString(16);
    return color;
};
