import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceValues',
})
export class ReplaceValuesPipe implements PipeTransform {
  transform(input: string | undefined, replacements: { [key: string]: string }): string | undefined {
    if (input) {
      Object.entries(replacements).forEach(([key, value]) => {
        const regexp = new RegExp(`<\\s?=${key}\\s?>`);
        input = input?.replace(regexp, value);
      });
    }

    return input;
  }
}
