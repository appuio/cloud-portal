import { Pipe, PipeTransform } from '@angular/core';
import { AppConfig, AppConfigService } from '../app-config.service';

@Pipe({
  name: 'zoneFeatures',
  standalone: true,
})
export class ZoneFeaturesPipe implements PipeTransform {
  private appConfig: AppConfig;

  constructor(private appConfigService: AppConfigService) {
    this.appConfig = this.appConfigService.getConfiguration();
  }

  transform(value: { [key: string]: string }): ZoneFeature[] {
    return Object.entries(value).map(([key, value]) => {
      const config = this.appConfig.zones.zoneFeatures[key];
      return {
        label: `${config?.label ?? key}: ${value}`,
        backgroundColor: config?.backgroundColor ?? '#0b3046',
        textColor: config?.textColor ?? 'white',
      };
    });
  }
}

export interface ZoneFeature {
  label: string;
  textColor: string;
  backgroundColor: string;
}
