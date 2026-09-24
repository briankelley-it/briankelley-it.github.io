const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
export const numberWord = (n: number) => WORDS[n] ?? String(n)
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
