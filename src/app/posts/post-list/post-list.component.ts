import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  effect,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { PostsService } from '../posts.service';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatButtonModule,
    RouterLink,
    MatProgressSpinner,
    MatPaginatorModule,
  ],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css',
})
export class PostListComponent implements OnInit, OnDestroy {
  private postsService = inject(PostsService);
  private authService = inject(AuthService);

  private authStatusSub: Subscription | undefined;

  postData = this.postsService.posts;

  onClick() {
    console.log(this.postsService.posts());
    console.log(this.postData());
  }

  isLoading = signal(false);
  isDisabled = signal(false);
  totalPosts = signal(2);
  currentPage = signal(1);
  postsPerPage = signal(10);
  pageSizeOptions = signal([1, 2, 5, 10]);
  userIsAuthenthicated = signal(false);
  userId = signal('');

  handleLoading() {
    this.isLoading.set(false);
  }

  private handleGetPostsService(page: number, pageSize: number) {
    this.isLoading.set(true);
    this.postsService.getPosts({
      handleLoading: () => this.handleLoading(),
      page,
      pageSize,
    });

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenthicated) => {
        this.userIsAuthenthicated.set(isAuthenthicated);
        this.userId.set(this.authService.getUserId());
      });
  }

  ngOnInit() {
    this.handleGetPostsService(this.currentPage(), this.postsPerPage());

    this.userIsAuthenthicated.set(this.authService.getIsAuth());

    this.userId.set(this.authService.getUserId());
  }

  ngOnDestroy(): void {
    this.authStatusSub?.unsubscribe();
  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId);
    this.handleGetPostsService(1, this.postsPerPage());
  }

  onChangedPage(event: PageEvent) {
    this.postsPerPage.set(event.pageSize);
    this.handleGetPostsService(event.pageIndex + 1, event.pageSize);
  }
}
