import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Form, Mode, StringOrNull } from './post-create.model';
import { mimeValidator } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css',
})
export class PostCreateComponent implements OnInit {
  isLoading = signal<boolean>(false);
  mode = signal<Mode>('create');
  imagePreview = signal<string | ArrayBuffer | null>('');
  post = signal<Post>({
    content: '',
    id: '',
    title: '',
    imagePath: '',
    creator: '',
  });
  file = signal<File | undefined>(undefined);

  form: Form = new FormGroup({
    image: new FormControl<File | null | undefined | string>(null, {
      nonNullable: false,
      validators: [Validators.required],
      asyncValidators: [mimeValidator],
    }),
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    content: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });

  private postService = inject(PostsService);
  private routeService = inject(ActivatedRoute);

  private postId = signal<StringOrNull>(null);

  ngOnInit(): void {
    this.handleOnInitData();
  }

  onImagePicked(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) return;
    const files = event.target.files;
    if (!files?.length || files?.length <= 0) return;

    const file = files[0];
    this.form.patchValue({ image: file });
    this.form.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result);
    };
    reader.readAsDataURL(file);
  }

  handleOnInitData() {
    this.routeService.paramMap.subscribe({
      next: (paramMap: ParamMap) => {
        if (paramMap.has('postId')) {
          const postIdParam = paramMap.get('postId');
          if (postIdParam) {
            this.mode.set('edit');
            this.postId.set(postIdParam);
            this.isLoading.set(true);
            this.postService.getPost(postIdParam).subscribe((response) => {
              this.isLoading.set(false);
              this.post.set({
                id: response.post._id,
                content: response.post.content,
                title: response.post.title,
                imagePath: response.post.imagePath,
                creator: response.post.creator,
              });
              this.imagePreview.set(response.post.imagePath);

              this.form?.setValue({
                title: this.post().title,
                content: this.post().content,
                image: this.post().imagePath,
              });
            });
          }
          return;
        }
        this.mode.set('create');
        this.postId.set(null);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onSavePost() {
    if (!this.form) return;
    if (this.form.invalid) return;

    const value = this.form.value;
    if (!value.title || !value.content) return;

    this.isLoading.set(true);

    const post = {
      content: value.content,
      image: value.image,
      title: value.title,
      imagePath: this.post().imagePath,
    };

    if (this.mode() === 'create') {
      this.postService.addPost(post);
    }
    if (this.mode() === 'edit') {
      const id = this.postId();
      if (id) {
        this.postService.updatePost({ ...post, id, creator: null });
      }
    }
    this.form.reset();
  }
}
