import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/index';
import './ChatBot.css';

export default function ChatBot({ onUpdateDesign, externalMessage }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Effect to handle external messages (e.g. from suggestions)
    React.useEffect(() => {
        if (externalMessage && !isTyping) {
            setIsOpen(true);
            handleSend(externalMessage);
        }
    }, [externalMessage]);

    const handleSend = async (msgText = input) => {
        const textToSend = msgText || input;
        if (!textToSend.trim()) return;

        const userMsg = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        setInput('');

        try {
            const res = await axios.post(`${API_URL}/api/ai/design-chat`, {
                userRequest: textToSend
            });

            const data = res.data;

            if (data.type === 'design_update') {
                const botMsg = { role: 'bot', text: data.message };
                setMessages(prev => [...prev, botMsg]);
                if (onUpdateDesign) {
                    onUpdateDesign(data.config);
                }
            } else {
                const botMsg = { role: 'bot', text: data.message };
                setMessages(prev => [...prev, botMsg]);
            }

        } catch (error) {
            console.error(error);
            const errMsg = { role: 'bot', text: "Sorry, I can't connect to the server." };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {!isOpen && (
                <button
                    className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 hover:bg-blue-700 transition"
                    onClick={() => setIsOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </button>
            )}

            {isOpen && (
                <div className="chatbot-container">
                    <div className="chat-header">
                        <span>AI Designer</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-10">
                                <p>Hello! I can help you redesign this page.</p>
                                <p className="text-sm mt-2">Try: "Make it look like a luxury coffee shop"</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.role}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && <div className="message bot">Thinking...</div>}
                    </div>

                    <div className="chat-input-area">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your design..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isTyping}
                        />
                        <button onClick={handleSend} disabled={isTyping || !input.trim()}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
