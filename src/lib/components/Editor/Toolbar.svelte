<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icons from '../Icons.svelte';
  import {
    toolSettings,
    selectTool,
    setPenColor,
    setPenSize,
    setHighlighterColor,
    setHighlighterSize,
  } from '../../stores/toolsState';
  import type { ToolType } from '../../types';

  export let onUndo: () => void = () => {};
  export let onRedo: () => void = () => {};

  const dispatch = createEventDispatcher<{
    openToolSettings: ToolType;
  }>();

  // Color dots matching Screenshot 2
  const quickColors = [
    '#000000', // Black
    '#2563eb', // Royal Blue
    '#ef4444', // Red
    '#10b981', // Emerald
    '#06b6d4', // Cyan / Teal
  ];

  // 3 thickness presets matching Screenshot 2
  const sizePresets = [2, 4, 8];

  function handleToolClick(tool: ToolType) {
    if ($toolSettings.activeTool === tool) {
      dispatch('openToolSettings', tool);
    } else {
      selectTool(tool);
    }
  }

  function handleColorSelect(color: string) {
    if ($toolSettings.activeTool === 'highlighter') {
      setHighlighterColor(color);
    } else {
      setPenColor(color);
    }
  }

  function handleSizeSelect(size: number) {
    if ($toolSettings.activeTool === 'highlighter') {
      setHighlighterSize(size * 4);
    } else {
      setPenSize(size);
    }
  }
</script>

<div class="floating-toolbar">
  <!-- Left Drawing Tools -->
  <div class="tool-group">
    <!-- Lasso Tool -->
    <button
      class="tool-btn"
      class:active={$toolSettings.activeTool === 'lasso'}
      on:click={() => handleToolClick('lasso')}
      title="Lasso Selection"
    >
      <Icons name="lasso" size={17} color={$toolSettings.activeTool === 'lasso' ? '#ffffff' : '#cbd5e1'} />
    </button>

    <!-- Fountain Pen Tool (matching active teal circle in Screenshot 2) -->
    <button
      class="tool-btn"
      class:active={$toolSettings.activeTool === 'pen'}
      on:click={() => handleToolClick('pen')}
      title="Pen"
    >
      <Icons name="pen" size={17} color={$toolSettings.activeTool === 'pen' ? '#ffffff' : '#cbd5e1'} />
    </button>

    <!-- Fine / Ballpoint Pen -->
    <button
      class="tool-btn"
      class:active={$toolSettings.activeTool === 'fountainPen'}
      on:click={() => handleToolClick('fountainPen')}
      title="Calligraphy Pen"
    >
      <Icons name="finePen" size={17} color={$toolSettings.activeTool === 'fountainPen' ? '#ffffff' : '#cbd5e1'} />
    </button>

    <!-- Highlighter -->
    <button
      class="tool-btn"
      class:active={$toolSettings.activeTool === 'highlighter'}
      on:click={() => handleToolClick('highlighter')}
      title="Highlighter"
    >
      <Icons name="highlighter" size={17} color={$toolSettings.activeTool === 'highlighter' ? '#ffffff' : '#cbd5e1'} />
    </button>

    <!-- Eraser -->
    <button
      class="tool-btn"
      class:active={$toolSettings.activeTool === 'eraser'}
      on:click={() => handleToolClick('eraser')}
      title="Eraser"
    >
      <Icons name="eraser" size={17} color={$toolSettings.activeTool === 'eraser' ? '#ffffff' : '#cbd5e1'} />
    </button>

    <!-- Shape Recognition Tool -->
    <button
      class="tool-btn"
      class:active={$toolSettings.activeTool === 'shape'}
      on:click={() => handleToolClick('shape')}
      title="Shape Tool"
    >
      <Icons name="shape" size={17} color={$toolSettings.activeTool === 'shape' ? '#ffffff' : '#cbd5e1'} />
    </button>
  </div>

  <div class="divider"></div>

  <!-- Thickness presets (3 line indicators matching Screenshot 2) -->
  <div class="thickness-group">
    {#each sizePresets as size}
      <button
        class="size-btn"
        class:selected={$toolSettings.penSize === size}
        on:click={() => handleSizeSelect(size)}
        title="{size}px thickness"
      >
        <span class="size-line" style="height: {Math.max(2, size / 1.5)}px;"></span>
      </button>
    {/each}
  </div>

  <div class="divider"></div>

  <!-- Color Swatches (matching Screenshot 2 quick dots) -->
  <div class="color-group">
    {#each quickColors as color}
      <button
        class="color-btn"
        style="background-color: {color};"
        class:selected={$toolSettings.penColor === color}
        on:click={() => handleColorSelect(color)}
      >
        {#if $toolSettings.penColor === color}
          <div class="color-dot-indicator"></div>
        {/if}
      </button>
    {/each}

    <!-- Custom Color Picker -->
    <label class="custom-color-btn" title="Custom color">
      <input
        type="color"
        value={$toolSettings.penColor}
        on:input={(e) => handleColorSelect(e.currentTarget.value)}
        class="color-input"
      />
      <div class="palette-ring"></div>
    </label>
  </div>

  <div class="divider"></div>

  <!-- Undo / Redo buttons -->
  <div class="history-group">
    <button class="tool-btn icon-only" on:click={onUndo} title="Undo (Cmd+Z)">
      <Icons name="undo" size={16} color="#cbd5e1" />
    </button>
    <button class="tool-btn icon-only" on:click={onRedo} title="Redo (Cmd+Shift+Z)">
      <Icons name="redo" size={16} color="#cbd5e1" />
    </button>
  </div>
</div>

<style>
  .floating-toolbar {
    display: flex;
    align-items: center;
    background: #1e1e24; /* Dark floating toolbar matching Screenshot 2 */
    border: 1px solid #333342;
    border-radius: 30px;
    padding: 4px 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    user-select: none;
    z-index: 50;
  }

  .tool-group,
  .thickness-group,
  .color-group,
  .history-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .divider {
    width: 1px;
    height: 20px;
    background-color: #333342;
    margin: 0 6px;
  }

  .tool-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tool-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Active tool styling: signature Goodnotes teal circular indicator matching Screenshot 2 */
  .tool-btn.active {
    background-color: #0d9488; /* Goodnotes active teal */
    box-shadow: 0 2px 8px rgba(13, 148, 136, 0.5);
  }

  /* Thickness lines */
  .size-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .size-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .size-btn.selected {
    background: rgba(255, 255, 255, 0.15);
  }

  .size-line {
    width: 14px;
    background-color: #cbd5e1;
    border-radius: 2px;
  }

  /* Colors */
  .color-btn {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
    padding: 0;
  }

  .color-btn:hover {
    transform: scale(1.15);
  }

  .color-btn.selected {
    border-color: #ffffff;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
  }

  .color-dot-indicator {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #ffffff;
  }

  .custom-color-btn {
    position: relative;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .palette-ring {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
    border: 1.5px solid rgba(255, 255, 255, 0.4);
  }

  .color-input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
</style>
