
/**
 * Modal Component
 */

import { getIcon } from './sidebar.js';

let modalOverlay = null;

/**
 * Show modal
 * @param {object} props
 * @param {string} props.title
 * @param {HTMLElement|string} props.content
 * @param {Array} props.actions
 */
export function showModal({ title = '', content = '', actions = [] }) {
  // Create overlay if not exists
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);

    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideModal();
      }
    });
  }

  modalOverlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" aria-label="Close">
          ${getIcon('x')}
        </button>
      </div>
      <div class="modal-body"></div>
      ${actions.length > 0 ? `
        <div class="modal-footer">
          ${actions.map(action => `
            <button class="btn ${action.className || 'btn-secondary'}" data-action="${action.id}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  // Add content
  const modalBody = modalOverlay.querySelector('.modal-body');
  if (typeof content === 'string') {
    modalBody.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    modalBody.appendChild(content);
  }

  // Add action listeners
  modalOverlay.querySelectorAll('[data-action]').forEach(btn => {
    const action = actions.find(a => a.id === btn.dataset.action);
    if (action && action.onClick) {
      btn.addEventListener('click', action.onClick);
    }
  });

  // Close button
  const closeBtn = modalOverlay.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideModal);
  }

  // Show
  modalOverlay.classList.add('open');
}

/**
 * Hide modal
 */
export function hideModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
  }
}

