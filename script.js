document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const nameInput = document.getElementById('name-input');
    const deptInput = document.getElementById('dept-input');
    const facultyGrid = document.getElementById('faculty-grid');
    const loader = document.getElementById('loader');
    const noResults = document.getElementById('no-results');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    // Modal Elements
    const achievementsModal = document.getElementById('achievements-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalFacultyName = document.getElementById('modal-faculty-name');
    const achievementsList = document.getElementById('achievements-list');
    const noAchievements = document.getElementById('no-achievements');

    const API_URL = 'https://faculty-backend-y5d7.onrender.com/api/faculty';

    closeModalBtn.addEventListener('click', () => {
        achievementsModal.classList.add('hidden');
    });

    achievementsModal.addEventListener('click', (e) => {
        if (e.target === achievementsModal) {
            achievementsModal.classList.add('hidden');
        }
    });

    // Initial load
    fetchFaculty('cse', '');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dept = deptInput.value;
        const name = nameInput.value.trim();
        fetchFaculty(dept, name);
    });

    async function fetchFaculty(dept, name) {
        // Reset state
        facultyGrid.innerHTML = '';
        noResults.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loader.classList.remove('hidden');

        try {
            const url = new URL(API_URL);
            url.searchParams.append('dept', dept);
            if (name) {
                url.searchParams.append('name', name);
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            renderFaculty(data.faculty);

        } catch (error) {
            console.error('Error fetching faculty:', error);
            loader.classList.add('hidden');
            errorText.textContent = error.message || 'Failed to connect to the server.';
            errorMessage.classList.remove('hidden');
        }
    }

    function renderFaculty(facultyList) {
        loader.classList.add('hidden');

        if (!facultyList || facultyList.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }

        facultyList.forEach((faculty, index) => {
            const card = document.createElement('div');
            card.className = 'card glass-panel';
            // Staggered animation
            card.style.animationDelay = `${index * 0.05}s`;

            // Extract initials for avatar
            const initials = faculty.name
                .replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, '') // Remove title
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

            card.innerHTML = `
                <div class="card-header">
                    <div class="avatar">${initials}</div>
                    <div class="card-title">
                        <h3>${faculty.name}</h3>
                        <p>${faculty.designation}</p>
                    </div>
                </div>
                <div class="card-body">
                    <div class="detail">
                        <i class="fa-solid fa-building"></i>
                        <span>Department of ${faculty.department}</span>
                    </div>
                    <div class="detail">
                        <i class="fa-solid fa-envelope"></i>
                        <span>${faculty.email}</span>
                    </div>
                    <div class="detail">
                        <i class="fa-solid fa-briefcase"></i>
                        <span>Experience: ${faculty.experience}</span>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                openModal(faculty);
            });
            
            facultyGrid.appendChild(card);
        });
    }

    function openModal(faculty) {
        modalFacultyName.textContent = faculty.name;
        achievementsList.innerHTML = '';
        
        if (faculty.achievements && faculty.achievements.length > 0) {
            faculty.achievements.forEach(ach => {
                const li = document.createElement('li');
                li.textContent = ach;
                achievementsList.appendChild(li);
            });
            achievementsList.classList.remove('hidden');
            noAchievements.classList.add('hidden');
        } else {
            achievementsList.classList.add('hidden');
            noAchievements.classList.remove('hidden');
        }
        
        achievementsModal.classList.remove('hidden');
    }

    // Chat Widget Logic
    const aadhiFab = document.getElementById('aadhi-fab');
    const chatWidget = document.getElementById('aadhi-chat-widget');
    const closeChatBtn = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Toggle chat widget
    aadhiFab.addEventListener('click', () => {
        chatWidget.classList.toggle('hidden');
        if (!chatWidget.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    closeChatBtn.addEventListener('click', () => {
        chatWidget.classList.add('hidden');
    });

    // Handle chat submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        // Add user message
        addChatMessage(msg, 'user-message');
        chatInput.value = '';

        // Add thinking indicator or just await directly
        setTimeout(async () => {
            const response = await generateAIResponse(msg.toLowerCase());
            addChatMessage(response, 'ai-message');
        }, 500);
    });

    function addChatMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function generateAIResponse(msg) {
        try {
            const response = await fetch('https://faculty-backend-y5d7.onrender.com/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: msg })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Chat API Error:', error);
            return "Sorry, I'm having trouble connecting to the backend right now.";
        }
    }
});
