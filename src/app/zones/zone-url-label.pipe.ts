import { TitleCasePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { AppConfig, AppConfigService } from '../app-config.service';

@Pipe({
  name: 'zoneUrlLabel',
})
export class ZoneUrlLabelPipe implements PipeTransform {
  private appConfig: AppConfig;

  constructor(private titleCasePipe: TitleCasePipe, private appConfigService: AppConfigService) {
    this.appConfig = this.appConfigService.getConfiguration();
  }

  transform(value: string): string {
    const urlLabels = this.appConfig.zones.zoneURLLabels;
    if (!value) {
      return '';
    }
    return urlLabels[value] ?? this.titleCasePipe.transform(value);
  }
}
