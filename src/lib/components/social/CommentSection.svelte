<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { formatDistanceToNow } from 'date-fns';
  import Icon from '@iconify/svelte';
  import LikeButton from './LikeButton.svelte';
  import type { CommentWithDetails } from '$lib/database/queries/social';

  export let comments: CommentWithDetails[] = [];
  export let codexEntryId: string;
  export let currentUserId: string | null = null;
  export let isLoading = false;

  const dispatch = createEventDispatcher<{
    createComment: { codexEntryId: string; content: string; parentCommentId?: string };
    likeComment: { commentId: string };
    loadMore: void;
  }>();

  let newCommentContent = '';
  let replyingTo: string | null = null;
  let replyContent = '';
  let isSubmitting = false;

  async function handleSubmitComment() {
    if (!newCommentContent.trim() || isSubmitting) return;

    isSubmitting = true;
    try {
      dispatch('createComment', {
        codexEntryId,
        content: newCommentContent.trim()
      });
      
      newCommentContent = '';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleSubmitReply(parentCommentId: string) {
    if (!replyContent.trim() || isSubmitting) return;

    isSubmitting = true;
    try {
      dispatch('createComment', {
        codexEntryId,
        content: replyContent.trim(),
        parentCommentId
      });
      
      replyContent = '';
      replyingTo = null;
    } finally {
      isSubmitting = false;
    }
  }

  function handleLikeComment(commentId: string) {
    dispatch('likeComment', { commentId });
  }

  function handleReply(commentId: string) {
    replyingTo = replyingTo === commentId ? null : commentId;
    replyContent = '';
  }

  function handleLoadMore() {
    dispatch('loadMore');
  }
</script>

<div class="comment-section space-y-4">
  <!-- Comment Form -->
  {#if currentUserId}
    <div class="comment-form card p-4">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 bg-surface-300-600-token rounded-full flex items-center justify-center">
          <Icon icon="lucide:user" class="w-4 h-4" />
        </div>
        
        <div class="flex-1">
          <textarea
            bind:value={newCommentContent}
            placeholder="Share your thoughts..."
            class="textarea w-full resize-none"
            rows="3"
            maxlength="1000"
            disabled={isSubmitting}
          ></textarea>
          
          <div class="flex items-center justify-between mt-2">
            <p class="text-xs text-surface-500-400-token">
              {newCommentContent.length}/1000 characters
            </p>
            
            <button
              on:click={handleSubmitComment}
              disabled={!newCommentContent.trim() || isSubmitting}
              class="btn btn-sm variant-filled-primary"
            >
              {#if isSubmitting}
                <Icon icon="lucide:loader-2" class="w-4 h-4 mr-1 animate-spin" />
              {:else}
                <Icon icon="lucide:send" class="w-4 h-4 mr-1" />
              {/if}
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center p-4 text-surface-500-400-token">
      <p>Sign in to join the conversation</p>
    </div>
  {/if}

  <!-- Comments List -->
  <div class="comments-list space-y-4">
    {#each comments as comment (comment.id)}
      <div class="comment card p-4">
        <!-- Comment Header -->
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-surface-300-600-token rounded-full flex items-center justify-center flex-shrink-0">
            {#if comment.user.avatar_url}
              <img 
                src={comment.user.avatar_url} 
                alt={comment.user.username}
                class="w-8 h-8 rounded-full object-cover"
              />
            {:else}
              <Icon icon="lucide:user" class="w-4 h-4" />
            {/if}
          </div>
          
          <div class="flex-1 min-w-0">
            <!-- User Info -->
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-medium text-sm text-surface-900-50-token">
                {comment.user.display_name || comment.user.username}
              </h4>
              <span class="text-xs text-surface-500-400-token">
                {formatDistanceToNow(new Date(comment.created_at))} ago
              </span>
              {#if comment.is_edited}
                <span class="text-xs text-surface-400-500-token">(edited)</span>
              {/if}
            </div>
            
            <!-- Comment Content -->
            <div class="prose prose-sm max-w-none text-surface-700-200-token mb-3">
              <p class="whitespace-pre-wrap">{comment.content}</p>
            </div>
            
            <!-- Comment Actions -->
            <div class="flex items-center gap-4">
              <LikeButton
                liked={comment.is_liked || false}
                likesCount={comment.likes_count}
                targetId={comment.id}
                type="comment"
                on:toggleLike={() => handleLikeComment(comment.id)}
              />
              
              {#if currentUserId}
                <button
                  on:click={() => handleReply(comment.id)}
                  class="flex items-center gap-1 text-sm text-surface-500-400-token hover:text-primary-500 transition-colors"
                >
                  <Icon icon="lucide:reply" class="w-4 h-4" />
                  <span>Reply</span>
                </button>
              {/if}
              
              {#if comment.replies_count > 0}
                <span class="text-xs text-surface-500-400-token">
                  {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
                </span>
              {/if}
            </div>
            
            <!-- Reply Form -->
            {#if replyingTo === comment.id && currentUserId}
              <div class="mt-3 pl-4 border-l-2 border-surface-200-700-token">
                <div class="flex items-start gap-2">
                  <div class="w-6 h-6 bg-surface-300-600-token rounded-full flex items-center justify-center">
                    <Icon icon="lucide:user" class="w-3 h-3" />
                  </div>
                  
                  <div class="flex-1">
                    <textarea
                      bind:value={replyContent}
                      placeholder="Write a reply..."
                      class="textarea w-full resize-none text-sm"
                      rows="2"
                      maxlength="1000"
                      disabled={isSubmitting}
                    ></textarea>
                    
                    <div class="flex items-center justify-between mt-2">
                      <p class="text-xs text-surface-500-400-token">
                        {replyContent.length}/1000 characters
                      </p>
                      
                      <div class="flex items-center gap-2">
                        <button
                          on:click={() => replyingTo = null}
                          class="btn btn-sm variant-ghost-surface"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          on:click={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim() || isSubmitting}
                          class="btn btn-sm variant-filled-primary"
                        >
                          {#if isSubmitting}
                            <Icon icon="lucide:loader-2" class="w-3 h-3 mr-1 animate-spin" />
                          {:else}
                            <Icon icon="lucide:send" class="w-3 h-3 mr-1" />
                          {/if}
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- Replies -->
            {#if comment.replies && comment.replies.length > 0}
              <div class="mt-4 space-y-3 pl-4 border-l-2 border-surface-200-700-token">
                {#each comment.replies as reply (reply.id)}
                  <div class="reply">
                    <div class="flex items-start gap-2">
                      <div class="w-6 h-6 bg-surface-300-600-token rounded-full flex items-center justify-center flex-shrink-0">
                        {#if reply.user.avatar_url}
                          <img 
                            src={reply.user.avatar_url} 
                            alt={reply.user.username}
                            class="w-6 h-6 rounded-full object-cover"
                          />
                        {:else}
                          <Icon icon="lucide:user" class="w-3 h-3" />
                        {/if}
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <!-- Reply Header -->
                        <div class="flex items-center gap-2 mb-1">
                          <h5 class="font-medium text-xs text-surface-900-50-token">
                            {reply.user.display_name || reply.user.username}
                          </h5>
                          <span class="text-xs text-surface-500-400-token">
                            {formatDistanceToNow(new Date(reply.created_at))} ago
                          </span>
                        </div>
                        
                        <!-- Reply Content -->
                        <div class="prose prose-sm max-w-none text-surface-700-200-token mb-2">
                          <p class="whitespace-pre-wrap text-sm">{reply.content}</p>
                        </div>
                        
                        <!-- Reply Actions -->
                        <div class="flex items-center gap-3">
                          <LikeButton
                            liked={reply.is_liked || false}
                            likesCount={reply.likes_count}
                            targetId={reply.id}
                            type="comment"
                            on:toggleLike={() => handleLikeComment(reply.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
    
    <!-- Loading State -->
    {#if isLoading}
      <div class="flex items-center justify-center p-4">
        <Icon icon="lucide:loader-2" class="w-6 h-6 animate-spin text-surface-500-400-token" />
      </div>
    {/if}
    
    <!-- Empty State -->
    {#if comments.length === 0 && !isLoading}
      <div class="text-center p-8 text-surface-500-400-token">
        <Icon icon="lucide:message-circle" class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .comment-section {
    max-width: 100%;
  }
  
  .prose p {
    margin: 0;
  }
</style>
