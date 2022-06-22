import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { faClose, faSave } from '@fortawesome/free-solid-svg-icons';
import { Team } from '../../types/team';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { KubernetesClientService } from '../../core/kubernetes-client.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-team-edit',
  templateUrl: './team-edit.component.html',
  styleUrls: ['./team-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamEditComponent implements OnInit {
  team!: Team;
  new = true;
  form!: FormGroup<{ displayName: FormControl<string>; name: FormControl<string>; userRefs: FormArray }>;
  faSave = faSave;
  saving = false;
  faClose = faClose;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private messageService: MessageService,
    private kubernetesClientService: KubernetesClientService
  ) {}

  get userRefs(): FormArray {
    return this.form.get('userRefs') as FormArray;
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.team = data['team'];
      this.new = this.team.metadata.name === '';
    });
    this.form = this.formBuilder.nonNullable.group({
      displayName: [this.team.spec.displayName],
      name: [
        this.team.metadata.name,
        [Validators.required, Validators.pattern('[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*')],
      ],
      userRefs: new FormArray(this.team.spec.userRefs.map((u) => new FormControl(u.name))),
    });
    this.addEmptyFormControl();
  }

  save(): void {
    if (this.form.valid) {
      this.saving = true;
      (this.new
        ? this.kubernetesClientService.addTeam(this.getNewTeam())
        : this.kubernetesClientService.updateTeam(this.getNewTeam())
      ).subscribe({
        next: () => {
          this.saving = false;
          this.messageService.add({
            severity: 'success',
            summary: $localize`Successfully saved`,
          });
          void this.router.navigate(['../..'], { relativeTo: this.activatedRoute });
        },
        error: (error) => {
          this.saving = false;
          let detail = '';
          if ('message' in error.error) {
            detail = error.error.message;
          }
          if ('AlreadyExists' === error.error.reason) {
            this.form.get('name')?.setErrors({ alreadyExists: true });
            detail = $localize`Team "${this.form.get('name')?.value}" already exists.`;
          }
          this.messageService.add({
            severity: 'error',
            summary: $localize`Error`,
            detail,
          });
          this.changeDetectorRef.markForCheck();
        },
      });
    }
  }

  private getNewTeam(): Team {
    return {
      ...this.team,
      metadata: {
        ...this.team.metadata,
        name: this.form.getRawValue().name,
      },
      spec: {
        ...this.team.spec,
        displayName: this.form.getRawValue().displayName,
        userRefs: this.form
          .getRawValue()
          .userRefs.filter((name?: string) => !!name)
          .map((name: string) => ({ name })),
      },
    };
  }

  addEmptyFormControl(): void {
    const emptyFormControl = new FormControl();
    emptyFormControl.valueChanges.pipe(take(1)).subscribe(() => {
      emptyFormControl.addValidators(Validators.required);
      this.addEmptyFormControl();
    });
    this.userRefs.push(emptyFormControl);
  }

  removeFormControl(index: number): void {
    this.userRefs.removeAt(index);
  }
}
