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

// 🔄 BRAND NEW CONTACT FORM - CLEAN START
async function submitContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            interest: formData.get('interest'),
            message: formData.get('message')
        };
        
        console.log('📧 Contact form data being sent:', data);
        
        // Check for missing required fields
        if (!data.firstName || !data.lastName || !data.email || !data.message) {
            throw new Error('Please fill in all required fields: First Name, Last Name, Email, and Message');
        }
        
        const response = await fetch('/.netlify/functions/contact-new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('Contact response:', result);
        
        if (response.ok && result.success) {
            showMessage('✅ Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
            form.reset();
        } else {
            throw new Error(result.error || 'Failed to send message');
        }
        
    } catch (error) {
        console.error('Contact form error:', error);
        showMessage('❌ Error sending message: ' + error.message + '. Please contact us directly at mulambwanesafaris@gmail.com', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// 🔄 BRAND NEW BOOKING FORM - CLEAN START
async function submitBookingForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.textContent = 'Booking...';
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            checkIn: formData.get('checkIn'),
            checkOut: formData.get('checkOut'),
            adults: formData.get('adults'),
            children: formData.get('children'),
            suite: formData.get('suite'),
            specialRequests: formData.get('specialRequests')
        };
        
        console.log('🏨 Booking form data being sent:', data);
        
        // Check for missing required fields
        if (!data.firstName || !data.lastName || !data.email || !data.checkIn || !data.checkOut || !data.adults) {
            throw new Error('Please fill in all required fields: First Name, Last Name, Email, Check-in Date, Check-out Date, and Number of Adults');
        }
        
        const response = await fetch('/.netlify/functions/booking-new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('Booking response:', result);
        
        if (response.ok && result.success) {
            showMessage('✅ Booking request sent successfully! We\'ll contact you within 24 hours.', 'success');
            form.reset();
        } else {
            throw new Error(result.error || 'Failed to send booking request');
        }
        
    } catch (error) {
        console.error('Booking form error:', error);
        showMessage('❌ Error sending booking: ' + error.message + '. Please contact us directly at mulambwanesafaris@gmail.com', 'error');
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
    messageDiv.innerHTML = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 7 seconds
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.remove();
        }
    }, 7000);
}

// WhatsApp Booking Functions
function openWhatsAppBooking(service = 'Safari Experience') {
    const phone = '27733426833'; // WhatsApp format
    const message = `Hello Mulambwane Safaris! I'm interested in booking a ${service}. Could you please provide more information about availability and pricing?`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function bookHuntingSafari() {
    openWhatsAppBooking('Hunting Safari');
}

function bookLodgeStay() {
    openWhatsAppBooking('Lodge Accommodation');
}

function orderGameMeat() {
    const phone = '27733426833';
    const message = 'Hello! I\'m interested in ordering premium game meat products. Could you please share your current selection and pricing?';
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Initialize all event listeners when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 NEW EMAIL SYSTEM INITIALIZED');
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
        console.log('Contact form listener added');
    }
    
    // Booking forms
    const bookingForms = document.querySelectorAll('form[id*="booking"], form[action*="booking"]');
    bookingForms.forEach(form => {
        form.addEventListener('submit', submitBookingForm);
        console.log('Booking form listener added');
    });
    
    // WhatsApp buttons
    const whatsappButtons = document.querySelectorAll('[onclick*="openWhatsApp"]');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openWhatsAppBooking();
        });
    });
    
    console.log('All form handlers ready!');
});