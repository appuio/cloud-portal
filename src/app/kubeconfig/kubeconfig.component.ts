import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { faClipboard, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-kubeconfig-download',
  templateUrl: './kubeconfig.component.html',
  styleUrls: ['./kubeconfig.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KubeconfigDownloadComponent implements OnInit {
  faClipboard = faClipboard;
  faDownload = faDownload;
  configYml$!: Observable<string>;
  replacements = {
    oidcIssuerUrl: environment.appConfig?.issuer ?? '',
    oidcClientId: environment.appConfig?.clientId ?? '',
    server: environment.appConfig?.server ?? '',
  };
  envName = environment.appConfig?.environment;

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.configYml$ = this.httpClient.get('/assets/kubectl-config.template', { responseType: 'text' });
  }

  getDataUri(data: string): SafeResourceUrl {
    const blob = new Blob([data], { type: 'text/x-yaml' });
    const url = (window.webkitURL || window.URL).createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
