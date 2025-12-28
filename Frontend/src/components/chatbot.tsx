import React, { useEffect } from 'react';

const ChatWidget = () => {
    useEffect(() => {
        // 1. Set the global config variable
        window.chtlConfig = { chatbotId: "7911792567" };

        // 2. Create and append the main embed script
        const script = document.createElement('script');
        script.id = 'chtl-script';
        script.setAttribute('data-id', '7911792567');
        script.src = 'https://chatling.ai/js/embed.js';
        script.async = true;
        script.type = 'text/javascript';

        document.body.appendChild(script);

        // Clean up function: Remove the script when the component unmounts
        return () => {
            const existingScript = document.getElementById('chtl-script');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
            // You might also need to clean up any elements/styles created by the widget
            // though this is often tricky for third-party scripts.
        };
    }, []); // Empty dependency array ensures it runs only once after initial render

    // This component doesn't render any visible elements itself, 
    // as the script handles injecting the chat widget into the DOM.
    return null;
};

// Example of how to use it in your main App component
const chat = () => {
    return (
        <div>
            {/* Your main application content */}
            <h1>Welcome to My App</h1>

            {/* The Chat Widget will be active here */}
            <ChatWidget />
        </div>
    );
};

export default chat;
