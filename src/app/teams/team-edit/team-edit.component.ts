import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { faClose, faSave, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Team } from '../../types/team';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Observable, of, take, tap } from 'rxjs';
import { TeamCollectionService } from '../../store/team-collection.service';

@Component({
  selector: 'app-team-edit',
  templateUrl: './team-edit.component.html',
  styleUrls: ['./team-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamEditComponent implements OnInit {
  team$?: Observable<Team>;
  new = true;
  form!: FormGroup<{ displayName: FormControl<string>; name: FormControl<string>; userRefs: FormArray }>;
  faSave = faSave;
  faClose = faClose;
  faWarning = faWarning;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    public teamService: TeamCollectionService
  ) {}

  get userRefs(): FormArray {
    return this.form.get('userRefs') as FormArray;
  }

  ngOnInit(): void {
    const name = this.activatedRoute.snapshot.paramMap.get('name');
    const namespace = this.activatedRoute.snapshot.paramMap.get('organizationName');
    if (!name || !name) {
      throw new Error('Name and namespace are required as parameters in the URL');
    }
    this.new = name === '$new';
    this.team$ = (
      this.new ? of(this.newTeam(namespace ?? '')) : this.teamService.getByKeyMemoized(`${namespace}/${name}`)
    ).pipe(
      tap((team) => {
        this.form = this.formBuilder.nonNullable.group({
          displayName: [team.spec.displayName],
          name: [
            team.metadata.name,
            [
              Validators.required,
              Validators.pattern('[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*'),
            ],
          ],
          userRefs: new FormArray(team.spec.userRefs.map((u) => new FormControl(u.name))),
        });
        this.addEmptyFormControl();
      })
    );
  }

  save(team: Team): void {
    if (!this.form.valid) {
      return;
    }
    team = this.getTeamFromForm(team);
    (this.new ? this.teamService.add(team) : this.teamService.update(team)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: $localize`Successfully saved`,
        });
        void this.router.navigate(['../..'], { relativeTo: this.activatedRoute });
      },
      error: (error) => {
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
          sticky: true,
        });
      },
    });
  }

  private newTeam(namespace: string): Team {
    return {
      apiVersion: 'appuio.io/v1',
      kind: 'Team',
      metadata: {
        name: '',
        namespace: namespace ?? '',
      },
      spec: {
        displayName: '',
        userRefs: [],
      },
    };
  }

  private getTeamFromForm(team: Team): Team {
    const clone = structuredClone(team);
    clone.metadata.name = this.form.getRawValue().name;
    clone.spec = {
      displayName: this.form.getRawValue().displayName,
      userRefs: this.form
        .getRawValue()
        .userRefs.filter((name?: string) => !!name)
        .map((name: string) => ({ name })),
    };
    return clone;
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
