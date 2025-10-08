// Navigation and Mobile Menu Functions
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.add('hidden');
}

// Chatbot functionality
function openHelpChat() {
    const chatbotBox = document.getElementById('chatbot-box');
    chatbotBox.style.display = 'flex';
    
    // Initialize with welcome message
    const messagesDiv = document.getElementById('chatbot-messages');
    if (messagesDiv.children.length === 0) {
        addChatMessage('bot', 'Hello! How can I help you with Mulambwane Safaris today?');
    }
}

function closeHelpChat() {
    const chatbotBox = document.getElementById('chatbot-box');
    chatbotBox.style.display = 'none';
}

function addChatMessage(sender, message) {
    const messagesDiv = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'bot' ? 'mb-2 text-sm bg-gray-100 p-2 rounded' : 'mb-2 text-sm bg-[#abb874] text-white p-2 rounded ml-8';
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendChatMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage('user', message);
    input.value = '';
    
    // Add thinking indicator
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'mb-2 text-sm bg-gray-100 p-2 rounded';
    thinkingDiv.textContent = 'Thinking...';
    thinkingDiv.id = 'thinking-indicator';
    document.getElementById('chatbot-messages').appendChild(thinkingDiv);
    
    try {
        // Try Netlify function first
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        // Remove thinking indicator
        const thinking = document.getElementById('thinking-indicator');
        if (thinking) thinking.remove();
        
        if (response.ok) {
            const data = await response.json();
            addChatMessage('bot', data.reply || data.message || 'I received your message!');
        } else {
            console.error('Response not OK:', response.status, response.statusText);
            // Fallback to local response
            addChatMessage('bot', getLocalChatResponse(message));
        }
    } catch (error) {
        console.error('Fetch error:', error);
        // Remove thinking indicator
        const thinking = document.getElementById('thinking-indicator');
        if (thinking) thinking.remove();
        
        // Fallback to local response
        addChatMessage('bot', getLocalChatResponse(message));
    }
}

// Local chatbot response function as fallback
function getLocalChatResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! Welcome to Mulambwane Wildlife & Hunting Safaris! I'm here to help you with information about our hunting safaris, luxury lodge, and premium game meat. How can I assist you today?";
    }
    
    // Hunting safari inquiries
    if (lowerMessage.includes('hunt') || lowerMessage.includes('safari') || lowerMessage.includes('big 5')) {
        return "Our professional hunting safaris offer Big 5 experiences including Cape Buffalo, Greater Kudu, and Sable Antelope. We provide expert guides, spoor reading training, and bushcraft skills. Would you like to know more about our hunting packages?";
    }
    
    // Lodge accommodation
    if (lowerMessage.includes('lodge') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay') || lowerMessage.includes('room')) {
        return "Our luxury bush suites offer authentic African accommodation with modern amenities. Features include traditional boma dining, common lounge areas, and cultural experiences. We're located in the heart of Limpopo's wilderness. Would you like to make a reservation?";
    }
    
    // Game meat products
    if (lowerMessage.includes('game meat') || lowerMessage.includes('biltong') || lowerMessage.includes('meat') || lowerMessage.includes('order')) {
        return "We offer premium game meat including traditional biltong, droëwors, prime cuts, and game boerewors. All ethically sourced from our conservation efforts. You can place orders through our website or contact us directly.";
    }
    
    // Booking and contact
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('contact') || lowerMessage.includes('phone')) {
        return "You can book through our website's reservation forms or contact us directly:\n📧 mulambwanesafaris@gmail.com\n📞 +27 73 342 6833\n📍 Waterpoort Louis Trichardt, Limpopo Province, South Africa";
    }
    
    // Default response
    return "Thank you for your interest in Mulambwane Wildlife & Hunting Safaris! We specialize in hunting safaris, luxury lodge accommodation, and premium game meat. For specific questions, contact us at mulambwanesafaris@gmail.com or +27 73 342 6833.";
}

// Contact form submission
async function submitContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/netlify/functions/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
            form.reset();
        } else {
            showMessage('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
        }
    } catch (error) {
        showMessage('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Booking form submission
async function submitBookingForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/netlify/functions/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Thank you! Your booking request has been submitted. We\'ll contact you within 24 hours to confirm your safari experience.', 'success');
            form.reset();
        } else {
            showMessage('Sorry, there was an error processing your booking. Please try again or contact us directly.', 'error');
        }
    } catch (error) {
        showMessage('Sorry, there was an error processing your booking. Please try again or contact us directly.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Utility function to show messages
function showMessage(message, type) {
    // Remove existing message
    const existingMessage = document.getElementById('form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.id = 'form-message';
    messageDiv.className = `fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.remove();
        }
    }, 5000);
}

// Smooth scroll functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add ripple effect to buttons
function addRippleEffect(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Apply ripple effect to all buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', addRippleEffect);
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
    });
});

// Clean navigation script
(function() {
    function cleanNav() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        const junkSelectors = [
            '.nav-message',
            '[data-injected-message]',
            '.greeting-banner',
            '.notice',
            '.announcement',
            '.toast',
            '.snackbar'
        ];
        junkSelectors.forEach(sel => nav.querySelectorAll(sel).forEach(el => el.remove()));
    }

    document.addEventListener('DOMContentLoaded', cleanNav);
    window.addEventListener('load', cleanNav);
})();

// Intersection Observer for animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate in
    document.querySelectorAll('.fade-in, .hover-lift, .card-hover').forEach(el => {
        observer.observe(el);
    });
});

// Form submission functions for individual pages
function submitBookingForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('booking-submit-btn');
    const messageDiv = document.getElementById('booking-message');
    
    // Show loading state
    submitBtn.textContent = 'Processing Booking...';
    submitBtn.disabled = true;
    
    // Simulate booking processing
    setTimeout(() => {
        messageDiv.className = 'text-center p-4 rounded-lg bg-green-100 text-green-700';
        messageDiv.textContent = 'Booking inquiry received! We will contact you within 24 hours to confirm availability and finalize your reservation.';
        messageDiv.classList.remove('hidden');
        
        // Reset form
        form.reset();
        submitBtn.textContent = 'Reserve Your Wildlife Experience';
        submitBtn.disabled = false;
        
        // Hide message after 10 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 10000);
    }, 2000);
}

function submitGameMeatOrder(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('order-submit-btn');
    const messageDiv = document.getElementById('order-message');
    
    // Get selected products
    const selectedProducts = [];
    const productCheckboxes = form.querySelectorAll('input[name="products"]:checked');
    productCheckboxes.forEach(checkbox => {
        selectedProducts.push(checkbox.value);
    });
    
    if (selectedProducts.length === 0) {
        messageDiv.className = 'text-center p-4 rounded-lg bg-red-100 text-red-700';
        messageDiv.textContent = 'Please select at least one product.';
        messageDiv.classList.remove('hidden');
        return;
    }
    
    // Show loading state
    submitBtn.textContent = 'Processing Order...';
    submitBtn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        messageDiv.className = 'text-center p-4 rounded-lg bg-green-100 text-green-700';
        messageDiv.textContent = 'Order received! We will contact you within 24 hours to confirm details and arrange payment.';
        messageDiv.classList.remove('hidden');
        
        // Reset form
        form.reset();
        submitBtn.textContent = 'Place Order';
        submitBtn.disabled = false;
        
        // Hide message after 10 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 10000);
    }, 2000);
}

function submitContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('contact-submit-btn');
    const messageDiv = document.getElementById('contact-message-result');
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        messageDiv.className = 'text-center p-4 rounded-lg bg-green-100 text-green-700';
        messageDiv.textContent = 'Thank you for your inquiry! We will respond within 24 hours with detailed information about your safari adventure.';
        messageDiv.classList.remove('hidden');
        
        // Reset form
        form.reset();
        submitBtn.textContent = 'Send Inquiry';
        submitBtn.disabled = false;
        
        // Hide message after 10 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 10000);
    }, 2000);
}