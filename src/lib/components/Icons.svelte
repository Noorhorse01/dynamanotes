<script lang="ts">
  export let name: string;
  export let size: number = 20;
  export let color: string = 'currentColor';
  export let strokeWidth: number = 2;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon icon-{name}"
>
  {#if name === 'pen'}
    <!-- Fountain / Nib Pen -->
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  {:else if name === 'finePen'}
    <!-- Ballpoint / Technical pen -->
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  {:else if name === 'highlighter'}
    <!-- Highlighter -->
    <path d="m9 11-6 6v3h3l6-6" />
    <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
  {:else if name === 'eraser'}
    <!-- Eraser -->
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
    <path d="M22 21H7" />
    <path d="m5 11 9 9" />
  {:else if name === 'lasso'}
    <!-- Lasso Selection -->
    <path d="M7 22a5 5 0 0 1-2-4c0-3.8 4.2-6.2 8-6 2.5.1 4.5 1 5.5 2.5" />
    <path d="M19 19a4 4 0 0 1-4 3c-1.5 0-3-.5-4-1.5" />
    <circle cx="12" cy="7" r="5" stroke-dasharray="3 3" />
  {:else if name === 'shape'}
    <!-- Geometric Shapes -->
    <circle cx="8" cy="8" r="4" />
    <rect width="8" height="8" x="13" y="13" rx="1.5" />
    <path d="M18 5 15 10h6Z" />
  {:else if name === 'text'}
    <!-- Text T tool -->
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" x2="15" y1="20" y2="20" />
    <line x1="12" x2="12" y1="4" y2="20" />
  {:else if name === 'laser'}
    <!-- Laser Pointer / Wand -->
    <path d="m15 4-2 2" />
    <path d="M15 9 9 15" />
    <path d="M4 20l5-5" />
    <circle cx="19" cy="5" r="2" fill={color} />
  {:else if name === 'undo'}
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  {:else if name === 'redo'}
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  {:else if name === 'documents'}
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M6 6h10" />
    <path d="M6 10h10" />
  {:else if name === 'folder'}
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  {:else if name === 'star'}
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  {:else if name === 'shared'}
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  {:else if name === 'marketplace'}
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" x2="21" y1="6" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  {:else if name === 'search'}
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  {:else if name === 'plus'}
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  {:else if name === 'share'}
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" x2="12" y1="2" y2="15" />
  {:else if name === 'more'}
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  {:else if name === 'grid'}
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  {:else if name === 'list'}
    <line x1="8" x2="21" y1="6" y2="6" />
    <line x1="8" x2="21" y1="12" y2="12" />
    <line x1="8" x2="21" y1="18" y2="18" />
    <line x1="3" x2="3.01" y1="6" y2="6" />
    <line x1="3" x2="3.01" y1="12" y2="12" />
    <line x1="3" x2="3.01" y1="18" y2="18" />
  {:else if name === 'arrowLeft'}
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  {:else if name === 'close'}
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  {:else if name === 'trash'}
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  {:else if name === 'bell'}
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  {:else if name === 'sidebar'}
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  {:else}
    <circle cx="12" cy="12" r="10" />
  {/if}
</svg>
