import { FormControl, FormGroup } from '@angular/forms';

export type StringOrNull = string | null;

export type Mode = 'create' | 'edit';

export type Form = FormGroup<{
  title: FormControl<string>;
  content: FormControl<string>;
  image: FormControl<File | null | undefined | string>;
}>;
