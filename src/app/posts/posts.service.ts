import { inject, Injectable, signal } from '@angular/core';
import { Post } from './post.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

const BACKEND_URL = environment.apiUrl + 'posts/';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  posts = signal<{ posts: Post[]; maxPosts: number }>({
    posts: [],
    maxPosts: 0,
  });

  private httpClient = inject(HttpClient);
  private routerClient = inject(Router);

  getPost(id: string) {
    return this.httpClient.get<{
      message: string;
      post: {
        _id: string;
        title: string;
        content: string;
        imagePath: string;
        creator: string;
      };
    }>(BACKEND_URL + id);
  }

  getPosts({
    handleLoading,
    pageSize,
    page,
  }: {
    handleLoading: () => void;
    pageSize: number;
    page: number;
  }) {
    const queryParams = `?pageSize=${pageSize}&page=${page}`;

    this.httpClient
      .get<{ message: string; posts: any; maxPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post: any) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe((transformedPosts) => {
        this.posts.set(transformedPosts);
        handleLoading();
      });
  }

  deletePost(postId: string) {
    this.httpClient
      .delete<{ message: string; post: Post }>(BACKEND_URL + postId)
      .subscribe(() => {
        console.log('in subscribe');
        this.posts.set({
          maxPosts: this.posts().maxPosts,
          posts: this.posts().posts.filter((post) => post.id !== postId),
        });

        console.log(this.posts());
      });
  }

  updatePost(post: Post & { image: File | null | undefined | string }) {
    let postData;
    if (typeof post.image === 'object' && !!post.image) {
      postData = new FormData();
      postData.append('id', post.id);
      postData.append('title', post.title);
      postData.append('content', post.content);
      postData.append('image', post.image, post.title);
    } else {
      postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        imagePath: post.image,
        creator: null,
      };
    }

    this.httpClient
      .put(BACKEND_URL + post.id, postData)
      .subscribe((response: any) => {
        this.routerClient.navigate(['/']);
      });
  }

  addPost({
    title,
    content,
    image,
  }: {
    title: string;
    content: string;
    image?: File | null | string;
  }) {
    const postData = new FormData();

    postData.append('title', title);
    postData.append('content', content);
    if (image) {
      postData.append('image', image as File, title);
    }

    this.httpClient
      .post<{ message: string; postId: string }>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        this.routerClient.navigate(['/']);
      });
  }
}
