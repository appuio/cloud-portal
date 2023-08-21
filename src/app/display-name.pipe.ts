import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayName',
  standalone: true,
})
export class DisplayNamePipe implements PipeTransform {
  transform(value: { spec?: { name?: string; displayName?: string }; metadata?: { name: string } }): string {
    return value.spec?.displayName || value.spec?.name || value.metadata?.name || '';
  }
}
