// Get Help Component Loader
class GetHelpComponent {
    static async load() {
        try {
            // Load the get-help component
            const response = await fetch('./components/get-help.html');
            if (!response.ok) {
                console.warn('Get Help component not found, using fallback');
                this.createFallback();
                return;
            }
            
            const html = await response.text();
            
            // Create a container for the component
            const container = document.createElement('div');
            container.innerHTML = html;
            
            // Insert the component into the body
            document.body.insertBefore(container, document.body.firstChild);
            
            // Add mobile button to mobile menus with a slight delay
            setTimeout(() => {
                this.addMobileButton();
            }, 100);
            
            console.log('Get Help component loaded successfully');
        } catch (error) {
            console.warn('Failed to load Get Help component:', error);
            this.createFallback();
        }
    }
    
    static createFallback() {
        // Fallback implementation if component file can't be loaded
        const fallbackHTML = `
            <!-- Get Help Component (Fallback) -->
            <button id="get-help-btn" onclick="openHelpChat()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-3.1A7.96 7.96 0 913 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Get Help
            </button>

            <div id="chatbot-modal" class="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
                <div class="bg-white rounded-lg shadow-2xl w-full max-w-sm m-2 md:m-6 p-4 flex flex-col max-h-96" style="display:none; pointer-events:auto;" id="chatbot-box">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold text-lg text-[#abb874]">Mulambwane Live Help</span>
                        <button onclick="closeHelpChat()" class="text-gray-500 hover:text-gray-900">&times;</button>
                    </div>
                    <div id="chatbot-messages" class="flex-1 overflow-y-auto mb-2" style="max-height: 300px;"></div>
                    <form id="chatbot-form" class="flex gap-2" onsubmit="sendChatMessage(event)">
                        <input type="text" id="chatbot-input" class="flex-1 border rounded px-2 py-1" placeholder="Type your question..." autocomplete="off" required />
                        <button type="submit" class="bg-[#abb874] text-white px-4 py-1 rounded font-semibold hover:bg-[#889976]">Send</button>
                    </form>
                </div>
            </div>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = fallbackHTML;
        document.body.insertBefore(container, document.body.firstChild);
        
        // Add mobile button to mobile menus
        this.addMobileButton();
    }
    
    static addMobileButton() {
        const mobileMenus = document.querySelectorAll('#mobile-menu .space-y-1');
        
        if (mobileMenus.length > 0) {
            const buttonHTML = `
                <button onclick="openHelpChat(); closeMobileMenu()" class="block w-full text-left px-3 py-2 text-white rounded transition-all duration-300 flex items-center gap-2" style="background: linear-gradient(135deg, #abb874, #889976);">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-3.1A7.96 7.96 0 913 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    Get Help
                </button>
            `;
            
            mobileMenus.forEach(menu => {
                // Check if button already exists to avoid duplicates
                if (!menu.querySelector('button[onclick*="openHelpChat"]')) {
                    menu.insertAdjacentHTML('beforeend', buttonHTML);
                }
            });
            
            console.log('Mobile Get Help button added to', mobileMenus.length, 'mobile menus');
        } else {
            console.log('No mobile menus found for Get Help button');
        }
    }
}

// Auto-load the component when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    GetHelpComponent.load();
});