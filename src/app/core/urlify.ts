export function urlify(s: string, options: Options = { whitespaceReplace: '-', dotReplace: '_' }): string {
  return s.toLowerCase().replace(' ', options.whitespaceReplace).replace('.', options.dotReplace).trim();
}

export interface Options {
  whitespaceReplace: string;
  dotReplace: string;
}
