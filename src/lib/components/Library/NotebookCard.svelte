<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icons from '../Icons.svelte';
  import type { Notebook } from '../../types';

  export let notebook: Notebook;

  const dispatch = createEventDispatcher<{
    open: Notebook;
    delete: string;
    toggleFavorite: string;
  }>();

  let showMenu = false;

  function formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 3600);

    if (diffHours < 24) {
      return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  function handleOpen() {
    dispatch('open', notebook);
  }

  function toggleStar(e: MouseEvent) {
    e.stopPropagation();
    dispatch('toggleFavorite', notebook.id);
  }

  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    showMenu = false;
    dispatch('delete', notebook.id);
  }
</script>

<div
  class="card-wrapper"
  on:click={handleOpen}
  on:contextmenu|preventDefault={() => (showMenu = !showMenu)}
>
  <!-- Thumbnail Container -->
  <div class="thumbnail" class:folder={notebook.coverStyle === 'folder'}>
    {#if notebook.coverStyle === 'folder'}
      <!-- Folder Tab shape -->
      <div class="folder-content" style="background-color: {notebook.coverColor};">
        <div class="folder-tab" style="background-color: {notebook.coverColor};"></div>
        <div class="folder-icon-wrapper">
          <Icons name="folder" size={36} color="#ffffff" />
        </div>
      </div>
    {:else}
      <!-- Realistic Paper / Notebook Cover matching Goodnotes -->
      <div class="notebook-cover" style="background-color: {notebook.coverColor};">
        <!-- Folded Corner decoration -->
        <div class="folded-corner"></div>

        <!-- Book spine line on left edge -->
        <div class="book-spine"></div>

        <!-- Cover Design Pattern -->
        {#if notebook.coverStyle === 'art' || notebook.title.toLowerCase().includes('physics')}
          <div class="art-pattern physics">
            <svg viewBox="0 0 100 100" class="art-svg">
              <path
                d="M10,50 Q30,20 60,60 T90,40"
                fill="none"
                stroke="#38bdf8"
                stroke-width="6"
              />
              <circle cx="50" cy="50" r="16" fill="#0284c7" opacity="0.6" />
            </svg>
          </div>
        {:else if notebook.coverStyle === 'ribbon' || notebook.title.toLowerCase().includes('cs')}
          <div class="art-pattern ribbon">
            <div class="ribbon-band"></div>
          </div>
        {:else if notebook.coverStyle === 'pattern'}
          <div class="art-pattern dots">
            {#each Array(16) as _}
              <div class="dot"></div>
            {/each}
          </div>
        {:else}
          <!-- Grid Preview paper -->
          <div class="grid-preview">
            <div class="grid-line horizontal"></div>
            <div class="grid-line vertical"></div>
          </div>
        {/if}

        <!-- Star / Bookmark badge -->
        <button
          class="star-badge"
          class:starred={notebook.isFavorite}
          on:click={toggleStar}
          title="Toggle Favorite"
        >
          <Icons
            name="star"
            size={14}
            color={notebook.isFavorite ? '#fbbf24' : 'rgba(255,255,255,0.6)'}
            strokeWidth={notebook.isFavorite ? 2.5 : 1.5}
          />
        </button>
      </div>
    {/if}
  </div>

  <!-- Document Metadata -->
  <div class="meta">
    <div class="title" title={notebook.title}>{notebook.title}</div>
    <div class="date">{formatDate(notebook.updatedAt)}</div>
  </div>

  <!-- Context Menu -->
  {#if showMenu}
    <div class="context-menu" on:click|stopPropagation>
      <button class="menu-item" on:click={handleOpen}>Open</button>
      <button class="menu-item" on:click={toggleStar}>
        {notebook.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
      <div class="menu-divider"></div>
      <button class="menu-item danger" on:click={handleDelete}>Delete</button>
    </div>
  {/if}
</div>

<style>
  .card-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 130px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.15s ease;
  }

  .card-wrapper:hover {
    transform: translateY(-2px);
  }

  .thumbnail {
    width: 110px;
    height: 145px;
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
    background: #ffffff;
    transition: box-shadow 0.15s ease;
  }

  .card-wrapper:hover .thumbnail {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(56, 189, 248, 0.4);
  }

  .notebook-cover {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .book-spine {
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent);
    z-index: 2;
  }

  .folded-corner {
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, #18181b 50%, rgba(255, 255, 255, 0.3) 50%);
    border-bottom-right-radius: 3px;
    z-index: 3;
  }

  .star-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    background: rgba(0, 0, 0, 0.25);
    border: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(4px);
    transition: background 0.15s ease;
    z-index: 4;
  }

  .star-badge:hover {
    background: rgba(0, 0, 0, 0.5);
  }

  .star-badge.starred {
    background: rgba(245, 158, 11, 0.2);
  }

  /* Folder styling */
  .thumbnail.folder {
    border-radius: 10px;
    background: transparent;
  }

  .folder-content {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .folder-tab {
    position: absolute;
    top: -6px;
    left: 8px;
    width: 44px;
    height: 12px;
    border-radius: 4px 4px 0 0;
  }

  .folder-icon-wrapper {
    opacity: 0.9;
  }

  /* Patterns */
  .art-pattern {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .art-svg {
    width: 90%;
    height: 90%;
  }

  .ribbon-band {
    width: 100%;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .dots {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 20px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(56, 189, 248, 0.4);
  }

  .grid-preview {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 10px 10px;
  }

  /* Meta info */
  .meta {
    margin-top: 8px;
    text-align: center;
    width: 100%;
  }

  .title {
    font-size: 13px;
    font-weight: 600;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .date {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
  }

  /* Context Menu */
  .context-menu {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: #1e1e24;
    border: 1px solid #333340;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    z-index: 50;
    min-width: 140px;
  }

  .menu-item {
    width: 100%;
    background: none;
    border: none;
    color: #e2e8f0;
    font-size: 12px;
    padding: 6px 10px;
    text-align: left;
    border-radius: 4px;
    cursor: pointer;
  }

  .menu-item:hover {
    background: #272732;
  }

  .menu-item.danger {
    color: #ef4444;
  }

  .menu-divider {
    height: 1px;
    background: #2d2d38;
    margin: 4px 0;
  }
</style>
