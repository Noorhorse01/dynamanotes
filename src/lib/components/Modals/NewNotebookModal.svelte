<script lang="ts">
  import Icons from '../Icons.svelte';
  import { isNewNotebookModalOpen } from '../../stores/appState';
  import { createNewNotebook } from '../../stores/notebooksState';
  import type { TemplateType } from '../../types';

  let title = 'Untitled';
  let selectedTemplate: TemplateType = 'squaredGrid';
  let selectedCoverColor = '#1e3a5f';
  let selectedCoverStyle = 'folded';

  const coverColors = [
    '#e0f2fe', // Sky Blue Paper
    '#1e3a5f', // Deep Blue
    '#0f172a', // Midnight Navy
    '#1e293b', // Slate
    '#38bdf8', // Cyan
    '#f43f5e', // Coral Rose
    '#10b981', // Emerald
    '#f59e0b', // Amber
  ];

  const templates: { id: TemplateType; name: string; desc: string }[] = [
    { id: 'squaredGrid', name: 'Squared Grid', desc: 'GoodNotes standard squared paper' },
    { id: 'lined', name: 'Lined', desc: 'Standard ruled paper with margin' },
    { id: 'dotGrid', name: 'Dot Grid', desc: 'Minimal dot matrix layout' },
    { id: 'cornell', name: 'Cornell Notes', desc: 'Cue column, notes, and summary' },
    { id: 'blank', name: 'Blank Paper', desc: 'Pure clean ivory canvas' },
    { id: 'darkGrid', name: 'Dark Grid', desc: 'Night mode dark squared paper' },
  ];

  function close() {
    isNewNotebookModalOpen.set(false);
  }

  async function handleCreate() {
    if (!title.trim()) title = 'Untitled';
    await createNewNotebook({
      title: title.trim(),
      coverColor: selectedCoverColor,
      coverStyle: selectedCoverStyle,
      template: selectedTemplate,
    });
    close();
  }
</script>

<div class="modal-backdrop" on:click={close}>
  <div class="modal-card" on:click|stopPropagation>
    <div class="modal-header">
      <div class="modal-title">New Notebook</div>
      <button class="close-btn" on:click={close}>
        <Icons name="close" size={18} color="#94a3b8" />
      </button>
    </div>

    <div class="modal-body">
      <!-- Title input -->
      <div class="field">
        <label for="nb-title">Title</label>
        <input
          id="nb-title"
          type="text"
          bind:value={title}
          placeholder="Notebook Title"
          class="text-input"
          autofocus
        />
      </div>

      <!-- Cover Color -->
      <div class="field">
        <label>Cover Color</label>
        <div class="color-palette">
          {#each coverColors as color}
            <button
              class="color-dot"
              style="background-color: {color};"
              class:selected={selectedCoverColor === color}
              on:click={() => (selectedCoverColor = color)}
            >
              {#if selectedCoverColor === color}
                <div class="check-mark"></div>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Paper Template -->
      <div class="field">
        <label>Paper Template</label>
        <div class="templates-grid">
          {#each templates as tpl}
            <button
              class="tpl-card"
              class:selected={selectedTemplate === tpl.id}
              on:click={() => (selectedTemplate = tpl.id)}
            >
              <div class="tpl-preview {tpl.id}">
                <div class="preview-lines"></div>
              </div>
              <div class="tpl-info">
                <div class="tpl-name">{tpl.name}</div>
                <div class="tpl-desc">{tpl.desc}</div>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" on:click={close}>Cancel</button>
      <button class="btn btn-primary" on:click={handleCreate}>Create</button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-card {
    width: 480px;
    max-width: 90vw;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #27272a;
  }

  .modal-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
  }

  .modal-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .text-input {
    background: #121214;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 10px 12px;
    color: #ffffff;
    font-size: 14px;
    outline: none;
  }

  .text-input:focus {
    border-color: #38bdf8;
  }

  .color-palette {
    display: flex;
    gap: 10px;
  }

  .color-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
  }

  .color-dot:hover {
    transform: scale(1.1);
  }

  .color-dot.selected {
    border-color: #ffffff;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  }

  .check-mark {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ffffff;
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .tpl-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: #121214;
    border: 1px solid #27272a;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .tpl-card:hover {
    background: #202026;
  }

  .tpl-card.selected {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.08);
  }

  .tpl-preview {
    width: 36px;
    height: 48px;
    background: #faf8f0;
    border-radius: 4px;
    flex-shrink: 0;
    border: 1px solid #d4d4d8;
  }

  .tpl-preview.darkGrid,
  .tpl-preview.darkBlank {
    background: #18181b;
    border-color: #3f3f46;
  }

  .tpl-info {
    overflow: hidden;
  }

  .tpl-name {
    font-size: 13px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .tpl-desc {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 20px;
    background: #121214;
    border-top: 1px solid #27272a;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background 0.15s ease;
  }

  .btn-secondary {
    background: #27272a;
    color: #e2e8f0;
  }

  .btn-secondary:hover {
    background: #3f3f46;
  }

  .btn-primary {
    background: #0284c7; /* Goodnotes teal blue */
    color: #ffffff;
  }

  .btn-primary:hover {
    background: #0369a1;
  }
</style>
