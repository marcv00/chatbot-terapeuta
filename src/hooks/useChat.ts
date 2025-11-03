// src/hooks/useChat.ts
import { useState, useEffect, useCallback } from "react";
import type { MessageBubbleProps } from "../components/MessageBubble";

export type Conversation = {
    id: string;
    title: string;
    date: string;
    messages: MessageBubbleProps[];
    titleGenerated?: boolean;
};

// Hook para generar título
const useGenerateTitle = (API_URL: string) => {
    const generateTitle = useCallback(async (messages: MessageBubbleProps[]) => {
        if (messages.length < 6) return null;

        try {
            const payload = messages
                .slice(0, 6) // solo los primeros 6 mensajes
                .map(m => ({
                    role: m.from === "user" ? "user" : "assistant",
                    content: m.text,
                }));

            const res = await fetch(`${API_URL}/generate-title`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: payload }),
            });

            if (!res.ok) return null;
            const data = await res.json();

            if (!data.title) return null;

            // Limpiar espacios y comillas del principio y final
            const cleanTitle = data.title.trim().replace(/^["']+|["']+$/g, "");

            return cleanTitle;
        } catch (err) {
            console.error("Error generando título:", err);
            return null;
        }
    }, [API_URL]);

    return generateTitle;
};


// Dentro de useChat
export function useChat(API_URL: string) {
    const [conversations, setConversations] = useState<Conversation[]>(() => {
        const saved = localStorage.getItem("conversations");
        return saved ? JSON.parse(saved) : [];
    });
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<MessageBubbleProps[]>([]);
    const [input, setInput] = useState("");
    const [firstMessageSent, setFirstMessageSent] = useState(false);
    const [isNewConversation, setIsNewConversation] = useState(true);

    const generateTitle = useGenerateTitle(API_URL); // <--- usamos el hook

    useEffect(() => {
        localStorage.setItem("conversations", JSON.stringify(conversations));
    }, [conversations]);

    useEffect(() => {
        if (activeConversationId) {
            const conv = conversations.find(c => c.id === activeConversationId);
            setMessages(conv?.messages || []);
            setIsNewConversation(false);
        } else {
            setMessages([]);
            setIsNewConversation(true);
        }
    }, [activeConversationId, conversations]);

    const startNewConversation = () => {
        setActiveConversationId(null);
        setMessages([]);
        setFirstMessageSent(false);
        setIsNewConversation(true);
    };

    const sendMessage = useCallback(async () => {
        if (!input.trim()) return;
        const userText = input;
        setInput("");
        setFirstMessageSent(true);

        let convId = activeConversationId;
        const userMessage: MessageBubbleProps = { from: "user", text: userText };

        if (!convId) {
            convId = Date.now().toString();
            const newConv: Conversation = {
                id: convId,
                title: "Nueva conversación",
                date: new Date().toLocaleDateString(),
                messages: [],
                titleGenerated: false,
            };
            setConversations(prev => [newConv, ...prev]);
            setActiveConversationId(convId);
            setIsNewConversation(false);
        }

        setMessages(prev => [...prev, userMessage]);
        const typingBubble: MessageBubbleProps = { from: "bot", text: "", isTyping: true };
        setMessages(prev => [...prev, typingBubble]);

        const conv = conversations.find(c => c.id === convId);
        const messagesForAPI = [
            ...(conv?.messages || []).map(m => ({
                role: m.from === "user" ? "user" : "assistant",
                content: m.text,
            })),
            { role: "user", content: userText },
        ];

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: messagesForAPI }),
            });

            if (!res.body) throw new Error("No stream disponible");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let botText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                botText += decoder.decode(value);
            }

            const typingTime = Math.min(Math.max((botText.length / 100) * 2000, 1500), 10000);
            await new Promise(r => setTimeout(r, typingTime));

            setMessages(prev =>
                prev.map((m, i) =>
                    i === prev.length - 1 ? { from: "bot", text: botText, isTyping: false } : m
                )
            );

            setConversations(prev => {
                return prev.map(c => {
                    if (c.id !== convId) return c;

                    // Generar título solo si no se ha hecho antes y hay al menos 6 mensajes
                    if (!c.titleGenerated && [...c.messages, userMessage, { from: "bot", text: botText }].length >= 6) {
                        generateTitle([...c.messages, userMessage, { from: "bot", text: botText }]).then(title => {
                            if (title) {
                                setConversations(prev2 =>
                                    prev2.map(c2 =>
                                        c2.id === convId ? { ...c2, title, titleGenerated: true } : c2
                                    )
                                );
                            }
                        });
                    }

                    return { ...c, messages: [...c.messages, userMessage, { from: "bot", text: botText }] };
                });
            });
        } catch {
            setMessages(prev =>
                prev.map((m, i) =>
                    i === prev.length - 1
                        ? { from: "bot", text: "⚠️ Hubo un problema con la conexión.", isTyping: false }
                        : m
                )
            );
        }
    }, [input, activeConversationId, conversations, API_URL, generateTitle]);

    const deleteConversation = (id: string) => {
        const updated = conversations.filter(c => c.id !== id);
        setConversations(updated);
        localStorage.setItem("conversations", JSON.stringify(updated));
    };

    return {
        messages,
        input,
        setInput,
        firstMessageSent,
        isNewConversation,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        startNewConversation,
        deleteConversation,
    };
}
