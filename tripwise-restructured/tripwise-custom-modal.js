/**
 * Tripwise Custom Modal System
 * - Replaces browser prompt() with styled modal
 * - Supports trip naming with validation
 * - Matches site theme and design system
 */

(function() {
    'use strict';

    // Create modal HTML structure
    function createModalHTML() {
        const modalHTML = `
            <div id="tripNameModalOverlay" class="trip-name-modal-overlay">
                <div class="trip-name-modal-content">
                    <div class="trip-name-modal-header">
                        <div class="trip-name-modal-icon">
                            <i class="fas fa-file-signature"></i>
                        </div>
                        <h3 class="trip-name-modal-title">Name Your Trip</h3>
                    </div>
                    <div class="trip-name-modal-body">
                        <label class="trip-name-modal-label" for="tripNameInput">
                            Give your trip a memorable name
                        </label>
                        <input 
                            type="text" 
                            id="tripNameInput" 
                            class="trip-name-modal-input"
                            placeholder="e.g., Summer Japan Adventure"
                            maxlength="100"
                        />
                        <div id="tripNameError" class="trip-name-modal-error">
                            Please enter a trip name
                        </div>
                    </div>
                    <div class="trip-name-modal-footer">
                        <button id="tripNameCancelBtn" class="trip-name-modal-btn trip-name-modal-btn-cancel">
                            <i class="fas fa-times"></i>
                            Cancel
                        </button>
                        <button id="tripNameSaveBtn" class="trip-name-modal-btn trip-name-modal-btn-save">
                            <i class="fas fa-check"></i>
                            Save Trip
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Append to body if not exists
        if (!document.getElementById('tripNameModalOverlay')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    /**
     * Show custom trip naming modal
     * @param {string} defaultName - Default trip name to display
     * @param {function} onSave - Callback when user saves (receives trip name)
     * @param {function} onCancel - Callback when user cancels (optional)
     */
    window.showTripNameModal = function(defaultName = '', onSave, onCancel) {
        // Ensure modal exists
        createModalHTML();

        const overlay = document.getElementById('tripNameModalOverlay');
        const input = document.getElementById('tripNameInput');
        const error = document.getElementById('tripNameError');
        const saveBtn = document.getElementById('tripNameSaveBtn');
        const cancelBtn = document.getElementById('tripNameCancelBtn');

        // Set default value
        input.value = defaultName;
        error.classList.remove('show');

        // Show modal
        overlay.classList.add('active');
        
        // Focus input after animation
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);

        // Close modal function
        function closeModal() {
            overlay.classList.remove('active');
            input.value = '';
            error.classList.remove('show');
            
            // Remove event listeners
            saveBtn.removeEventListener('click', handleSave);
            cancelBtn.removeEventListener('click', handleCancel);
            input.removeEventListener('keypress', handleKeyPress);
            overlay.removeEventListener('click', handleOverlayClick);
        }

        // Handle save
        function handleSave() {
            const tripName = input.value.trim();
            
            if (!tripName) {
                error.classList.add('show');
                input.focus();
                return;
            }

            closeModal();
            
            if (typeof onSave === 'function') {
                onSave(tripName);
            }
        }

        // Handle cancel
        function handleCancel() {
            closeModal();
            
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }

        // Handle Enter key
        function handleKeyPress(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
        }

        // Handle click outside modal
        function handleOverlayClick(e) {
            if (e.target === overlay) {
                handleCancel();
            }
        }

        // Attach event listeners
        saveBtn.addEventListener('click', handleSave);
        cancelBtn.addEventListener('click', handleCancel);
        input.addEventListener('keypress', handleKeyPress);
        overlay.addEventListener('click', handleOverlayClick);
    };

    /**
     * Promise-based version of showTripNameModal
     * @param {string} defaultName - Default trip name
     * @returns {Promise<string>} - Resolves with trip name, rejects on cancel
     */
    window.showTripNameModalAsync = function(defaultName = '') {
        return new Promise((resolve, reject) => {
            window.showTripNameModal(
                defaultName,
                (tripName) => resolve(tripName),
                () => reject(new Error('User cancelled'))
            );
        });
    };

    console.log('✅ Tripwise Custom Modal loaded');
})();
