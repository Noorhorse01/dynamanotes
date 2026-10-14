<script lang="ts">
  import { onMount } from 'svelte';
  import Sidebar from './Sidebar.svelte';
  import NotebookCard from './NotebookCard.svelte';
  import Icons from '../Icons.svelte';
  import NewNotebookModal from '../Modals/NewNotebookModal.svelte';
  import {
    notebooks,
    loadNotebooks,
    deleteNotebookById,
    toggleNotebookFavorite,
  } from '../../stores/notebooksState';
  import {
    currentNotebook,
    activeView,
    libraryFilter,
    searchQuery,
    isNewNotebookModalOpen,
  } from '../../stores/appState';
  import type { Notebook } from '../../types';

  onMount(() => {
    loadNotebooks();
  });

  $: filteredNotebooks = $notebooks.filter((nb) => {
    // Filter by tab
    if ($libraryFilter === 'favorites' && !nb.isFavorite) return false;
    if ($libraryFilter === 'folders' && nb.coverStyle !== 'folder') return false;

    // Filter by search query
    if ($searchQuery.trim()) {
      return nb.title.toLowerCase().includes($searchQuery.toLowerCase());
    }
    return true;
  });

  function openNotebook(e: CustomEvent<Notebook>) {
    currentNotebook.set(e.detail);
    activeView.set('editor');
  }

  function handleDelete(e: CustomEvent<string>) {
    deleteNotebookById(e.detail);
  }

  function handleToggleFavorite(e: CustomEvent<string>) {
    toggleNotebookFavorite(e.detail);
  }

  function openNewModal() {
    isNewNotebookModalOpen.set(true);
  }
</script>

<div class="library-container">
  <!-- Left Navigation Sidebar -->
  <Sidebar />

  <!-- Main Content Documents View -->
  <main class="main-content">
    <!-- Top Bar Header -->
    <header class="top-bar">
      <div class="title-section">
        <h1 class="page-title">Documents</h1>
      </div>

      <!-- Right Utility Actions -->
      <div class="top-actions">
        <!-- Search -->
        <div class="search-box">
          <Icons name="search" size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search documents..."
            bind:value={$searchQuery}
            class="search-input"
          />
        </div>

        <!-- Notification Bell -->
        <button class="icon-btn" title="Notifications">
          <Icons name="bell" size={18} color="#94a3b8" />
        </button>

        <!-- User Profile Avatar -->
        <div class="avatar" title="Account">NK</div>

        <!-- + New Button (matching Goodnotes bright blue pill) -->
        <button class="new-btn" on:click={openNewModal}>
          <Icons name="plus" size={16} color="#ffffff" strokeWidth={2.5} />
          <span>New</span>
        </button>

        <!-- View switches -->
        <div class="view-switches">
          <button class="switch-btn active" title="Grid View">
            <Icons name="grid" size={16} color="#38bdf8" />
          </button>
          <button class="switch-btn" title="List View">
            <Icons name="list" size={16} color="#64748b" />
          </button>
        </div>
      </div>
    </header>

    <!-- Subheader Filter tabs -->
    <div class="filter-bar">
      <button class="filter-chip active">
        <span class="filter-dot"></span>
        <span>All</span>
      </button>
    </div>

    <!-- Notebooks Grid matching Screenshot 1 -->
    <div class="grid-scroll-area">
      {#if filteredNotebooks.length === 0}
        <div class="empty-state">
          <div class="empty-icon">
            <Icons name="documents" size={48} color="#38bdf8" />
          </div>
          <div class="empty-title">No documents yet</div>
          <div class="empty-desc">Create your first notebook to begin writing with pressure-sensitive vector ink.</div>
          <button class="new-btn" on:click={openNewModal} style="margin-top: 16px;">
            <Icons name="plus" size={16} color="#ffffff" />
            <span>Create Notebook</span>
          </button>
        </div>
      {:else}
        <div class="notebooks-grid">
          {#each filteredNotebooks as notebook (notebook.id)}
            <NotebookCard
              {notebook}
              on:open={openNotebook}
              on:delete={handleDelete}
              on:toggleFavorite={handleToggleFavorite}
            />
          {/each}
        </div>
      {/if}
    </div>

    <!-- Bottom notification pill matching Screenshot 1 -->
    <div class="bottom-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <Icons name="documents" size={16} color="#38bdf8" />
        </div>
        <div class="banner-text">
          <span class="banner-main">DynamaNotes ready for cross-platform desktop</span>
          <span class="banner-sub">Supports macOS, Windows, and Web. Full vector drawing engine active.</span>
        </div>
        <button class="banner-action" on:click={openNewModal}>+ New Note</button>
      </div>
    </div>
  </main>

  <!-- New Notebook Modal -->
  {#if $isNewNotebookModalOpen}
    <NewNotebookModal />
  {/if}
</div>

<style>
  .library-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    background-color: #000000; /* Goodnotes dark mode pitch black */
    color: #ffffff;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    background-color: #09090b;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 28px 10px 28px;
    border-bottom: 1px solid #18181b;
  }

  .page-title {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.5px;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 20px;
    padding: 6px 14px;
    width: 220px;
  }

  .search-input {
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 13px;
    outline: none;
    width: 100%;
  }

  .search-input::placeholder {
    color: #64748b;
  }

  .icon-btn {
    background: #18181b;
    border: 1px solid #27272a;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .icon-btn:hover {
    background: #27272a;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0284c7, #38bdf8);
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }

  /* + New Button matching Goodnotes bright blue */
  .new-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #0284c7; /* Goodnotes signature cyan/blue */
    color: #ffffff;
    border: none;
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
    transition: all 0.15s ease;
  }

  .new-btn:hover {
    background-color: #0369a1;
    transform: translateY(-1px);
  }

  .view-switches {
    display: flex;
    align-items: center;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 6px;
    padding: 2px;
  }

  .switch-btn {
    background: none;
    border: none;
    padding: 5px 8px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .switch-btn.active {
    background: #27272a;
  }

  .filter-bar {
    padding: 10px 28px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 14px;
    padding: 4px 12px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }

  .filter-chip.active {
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.3);
    background: rgba(56, 189, 248, 0.08);
  }

  .filter-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #38bdf8;
  }

  /* Grid area */
  .grid-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px 28px 80px 28px;
  }

  .notebooks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 28px 20px;
    align-items: start;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60%;
    text-align: center;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(56, 189, 248, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .empty-desc {
    font-size: 13px;
    color: #64748b;
    max-width: 340px;
    margin-top: 6px;
  }

  /* Bottom Banner matching Screenshot 1 */
  .bottom-banner {
    position: absolute;
    bottom: 16px;
    left: 28px;
    right: 28px;
    display: flex;
    justify-content: center;
    pointer-events: none;
  }

  .banner-content {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 24px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }

  .banner-icon {
    display: flex;
    align-items: center;
  }

  .banner-text {
    display: flex;
    flex-direction: column;
  }

  .banner-main {
    font-size: 12px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .banner-sub {
    font-size: 10px;
    color: #71717a;
  }

  .banner-action {
    background: #0284c7;
    border: none;
    border-radius: 12px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    cursor: pointer;
  }
</style>
