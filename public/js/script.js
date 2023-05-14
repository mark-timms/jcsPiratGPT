document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.querySelector('.chat-box');
    const greeting = document.querySelector('.greeting');
    const mode = document.getElementById('mode');

    const greetings = {
        standard: 'Go ahead: make my day... & ask me a question',
        catgpt: "Meeeow's it going? ask me a question...",
        piratgpt: "Yarrrrrr, ask me anythin'... worst case scenario: I'll make ye walk the plank!",
    };

    function updateGreeting() {
        greeting.textContent = greetings[mode.value];
    }

    updateGreeting();

    mode.addEventListener('change', updateGreeting);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = userInput.value;
        userInput.value = '';
        chatBox.innerHTML += `<p>You: ${text}</p>`;

        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                mode: mode.value,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                chatBox.innerHTML += `<p>Chatbot: ${data.response}</p>`;
            });
    });
});
