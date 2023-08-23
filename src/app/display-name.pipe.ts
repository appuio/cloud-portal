import { Pipe, PipeTransform } from '@angular/core';

type EntityWithDisplayName = { spec?: { name?: string; displayName?: string }; metadata?: { name: string } };

@Pipe({
  name: 'displayName',
  standalone: true,
})
export class DisplayNamePipe implements PipeTransform {
  static transform(value: EntityWithDisplayName): string {
    return value.spec?.displayName || value.spec?.name || value.metadata?.name || '';
  }

  transform(value: EntityWithDisplayName): string {
    return DisplayNamePipe.transform(value);
  }
}
