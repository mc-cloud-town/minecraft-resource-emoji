export const splitString = (str: string, sep: number) => {
  const arr: string[] = [];

  for (let i = 0; i < str.length; i += sep) arr.push(str.slice(i, i + sep));

  return arr;
};

export const splitStringList = (list: string[], sep: number) => {
  const arr: string[] = [];

  for (let i = 0; i < list.length; i += sep) {
    arr.push(list.slice(i, i + sep).join(""));
  }

  return arr;
};
