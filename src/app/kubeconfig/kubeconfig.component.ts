import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { faClipboard, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { AppConfig, AppConfigService } from '../app-config.service';
import { ReplaceValuesPipe } from './replace-values.pipe';
import { PushPipe } from '@ngrx/component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-kubeconfig-download',
  templateUrl: './kubeconfig.component.html',
  styleUrls: ['./kubeconfig.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, FontAwesomeModule, ClipboardModule, PushPipe, ReplaceValuesPipe],
})
export class KubeconfigDownloadComponent implements OnInit {
  faClipboard = faClipboard;
  faDownload = faDownload;
  configYml$!: Observable<string>;
  replacements = {
    oidcIssuerUrl: '',
    oidcClientId: '',
    server: '',
  };
  envName = '';
  appConfig: AppConfig;

  constructor(
    private httpClient: HttpClient,
    private sanitizer: DomSanitizer,
    private appConfigService: AppConfigService
  ) {
    this.appConfig = this.appConfigService.getConfiguration();
    this.replacements = {
      oidcIssuerUrl: this.appConfig?.issuer ?? '',
      oidcClientId: this.appConfig?.clientId ?? '',
      server: this.appConfig?.server ?? '',
    };
    this.envName = this.appConfig.environment;
  }

  ngOnInit(): void {
    this.configYml$ = this.httpClient.get('/assets/kubectl-config.template', { responseType: 'text' });
  }

  getDataUri(data: string): SafeResourceUrl {
    const blob = new Blob([data], { type: 'text/x-yaml' });
    const url = (window.webkitURL || window.URL).createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
