export const splitString = (str: string, sep: number) => {
  const arr: string[] = [];

  for (let i = 0; i < str.length; i += sep) arr.push(str.slice(i, i + sep));

  return arr;
};
