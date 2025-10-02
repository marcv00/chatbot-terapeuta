// src/App.tsx
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessagesList from "./components/MessagesList";
import InputBar from "./components/InputBar";
import type { MessageBubbleProps } from "./components/MessageBubble";

// ---- Hook de estado persistente ----
function usePersistentState<T>(key: string, defaultValue: T) {
    const [state, setState] = useState<T>(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    });

    const setPersistentState = (value: T | ((prev: T) => T)) => {
        setState((prev) => {
            const newValue =
                typeof value === "function" ? (value as any)(prev) : value;
            localStorage.setItem(key, JSON.stringify(newValue));
            return newValue;
        });
    };

    return [state, setPersistentState] as const;
}

// ---- Tipo de conversación ----
type Conversation = {
    id: string;
    title: string;
    date: string;
    messages: MessageBubbleProps[];
};

export default function App() {
    // Estado global persistente
    const [conversations, setConversations] = usePersistentState<
        Conversation[]
    >("conversations", []);
    const [activeConversationId, setActiveConversationId] = usePersistentState<
        string | null
    >("activeConversationId", null);

    // Estado del chat activo
    const [messages, setMessages] = useState<MessageBubbleProps[]>([]);
    const [input, setInput] = useState("");
    const [focused, setFocused] = useState(false);

    // Flag para saber si es nueva conversación
    const [isNewConversation, setIsNewConversation] = useState(true);

    // Layout (sidebar responsive)
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [sidebarOpen, setSidebarOpen] = useState(
        () => window.innerWidth >= 768
    );

    const [firstMessageSent, setFirstMessageSent] = useState(false);
    const SIDEBAR_OPEN_PX = 320;
    const SIDEBAR_CLOSED_PX = 56;

    // ---- Sincronizar mensajes del chat activo ----
    useEffect(() => {
        if (activeConversationId) {
            const conv = conversations.find(
                (c) => c.id === activeConversationId
            );
            setMessages(conv ? conv.messages : []);
            setIsNewConversation(false);
        } else {
            // Nueva conversación → limpiar mensajes
            setMessages([]);
            setIsNewConversation(true);
        }
    }, [activeConversationId, conversations]);

    // ---- Listener de resize ----
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ---- Crear nueva conversación (modo pendiente) ----
    const startNewConversation = () => {
        setActiveConversationId(null); // todavía no hay id
        setMessages([]);
        setFirstMessageSent(false);
        setIsNewConversation(true);
    };

    // ---- Enviar mensaje ----
    const sendMessage = useCallback(async () => {
        if (!input.trim()) return;

        setFirstMessageSent(true);

        const userMessage: MessageBubbleProps = { from: "user", text: input };
        let botIndex: number;

        // Caso: todavía no existe la conversación → crearla recién ahora
        let convId = activeConversationId;
        if (!convId) {
            convId = Date.now().toString();
            const newConv: Conversation = {
                id: convId,
                title: "Nueva conversación",
                date: new Date().toLocaleDateString(),
                messages: [],
            };
            setConversations((prev) => [newConv, ...prev]);
            setActiveConversationId(convId);
            setIsNewConversation(false);
        }

        // Actualizamos UI (chat activo)
        setMessages((prev) => {
            const updated = [
                ...prev,
                userMessage,
                { from: "bot" as const, text: "" },
            ];
            botIndex = updated.length - 1;
            return updated;
        });

        // Actualizamos conversaciones en memoria
        setConversations((prev) =>
            prev.map((c) =>
                c.id === convId
                    ? {
                          ...c,
                          messages: [
                              ...c.messages,
                              userMessage,
                              { from: "bot", text: "" },
                          ],
                      }
                    : c
            )
        );

        // Construcción del prompt
        const conv = conversations.find((c) => c.id === convId);
        const messagesForAPI = [
            ...(conv?.messages || []).map((m) => ({
                role: m.from === "user" ? "user" : "assistant",
                content: m.text,
            })),
            { role: "user", content: input },
        ];

        try {
            const res = await fetch("/api/llmProxy", {
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

                // Actualizamos en caliente
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[botIndex!] = { from: "bot", text: botText };
                    return newMessages;
                });

                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === convId
                            ? {
                                  ...c,
                                  messages: c.messages.map((m, i) =>
                                      i === c.messages.length - 1
                                          ? { from: "bot", text: botText }
                                          : m
                                  ),
                              }
                            : c
                    )
                );
            }
        } catch (err) {
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[botIndex!] = {
                    from: "bot",
                    text: "⚠️ Hubo un problema con la conexión.",
                };
                return newMessages;
            });
        }

        setInput("");
    }, [input, activeConversationId, conversations, setConversations]);

    // ---- Borrar conversación ----
    const handleDeleteConversation = (id: string) => {
        const updated = conversations.filter((c) => c.id !== id);
        setConversations(updated);
        localStorage.setItem("conversations", JSON.stringify(updated));
    };
    return (
        <div className="flex h-screen bg-gradient-to-br from-emerald-100 via-white to-sky-100 text-gray-800">
            <Sidebar
                isOpen={sidebarOpen}
                isMobile={isMobile}
                setSidebarOpen={setSidebarOpen}
                SIDEBAR_OPEN_PX={SIDEBAR_OPEN_PX}
                SIDEBAR_CLOSED_PX={SIDEBAR_CLOSED_PX}
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={(id) => setActiveConversationId(id)}
                onNewConversation={startNewConversation}
                onDeleteConversation={handleDeleteConversation}
            />

            <motion.div
                initial={false}
                animate={
                    isMobile
                        ? { marginLeft: 0 }
                        : {
                              marginLeft: sidebarOpen
                                  ? SIDEBAR_OPEN_PX
                                  : SIDEBAR_CLOSED_PX,
                          }
                }
                transition={{ duration: 0.36, ease: "easeInOut" }}
                className="flex-1 flex flex-col relative"
            >
                <ChatHeader
                    isMobile={isMobile}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />
                <MessagesList messages={messages} />
                <InputBar
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    focused={focused}
                    setFocused={setFocused}
                    firstMessageSent={firstMessageSent}
                    isNewConversation={isNewConversation}
                />
            </motion.div>
        </div>
    );
}
