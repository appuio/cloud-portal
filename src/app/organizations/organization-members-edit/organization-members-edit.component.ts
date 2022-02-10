import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faClose, faSave } from '@fortawesome/free-solid-svg-icons';
import { OrganizationMembers } from '../../types/organization-members';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { KubernetesClientService } from '../../core/kubernetes-client.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-organization-members-edit',
  templateUrl: './organization-members-edit.component.html',
  styleUrls: ['./organization-members-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationMembersEditComponent implements OnInit {
  organizationMembers!: OrganizationMembers;
  faClose = faClose;
  faSave = faSave;
  saving = false;
  form = new FormGroup({
    userRefs: new FormArray([]),
  });
  editPermission = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private kubernetesClientService: KubernetesClientService,
    private messageService: MessageService,
    private router: Router
  ) {}

  get userRefs(): FormArray {
    return this.form.get('userRefs') as FormArray;
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ organizationMembers }) => (this.organizationMembers = organizationMembers));
    this.editPermission = this.organizationMembers.editMembers ?? false;
    const members = this.userRefs;
    this.organizationMembers.spec.userRefs.forEach((userRef) => {
      members.push(new FormControl({ value: userRef.name, disabled: !this.editPermission }, Validators.required));
    });
    if (this.editPermission) {
      this.addEmptyFormControl();
    }
  }

  addEmptyFormControl(): void {
    const emptyFormControl = new FormControl();
    emptyFormControl.valueChanges.pipe(take(1)).subscribe(() => {
      emptyFormControl.addValidators(Validators.required);
      this.addEmptyFormControl();
    });
    this.userRefs.push(emptyFormControl);
  }

  save(): void {
    const userRefs = this.form.value.userRefs as string[];
    userRefs.pop();
    this.kubernetesClientService
      .updateOrganizationMembers({
        kind: 'OrganizationMembers',
        apiVersion: 'appuio.io/v1',
        metadata: {
          ...this.organizationMembers.metadata,
        },
        spec: {
          userRefs: userRefs.map((userRef) => ({ name: userRef })),
        },
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: $localize`Successfully saved`,
          });
          void this.router.navigate(['../..'], { relativeTo: this.activatedRoute });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: $localize`Error`,
            detail: error.message,
          });
        },
      });
  }

  removeFormControl(index: number): void {
    this.userRefs.removeAt(index);
  }
}
