<script lang="ts">
  import LibraryView from './lib/components/Library/LibraryView.svelte';
  import EditorView from './lib/components/Editor/EditorView.svelte';
  import { activeView } from './lib/stores/appState';
</script>

<div class="app-root">
  {#if $activeView === 'library'}
    <LibraryView />
  {:else}
    <EditorView />
  {/if}
</div>

<style>
  .app-root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #000000;
  }
</style>
