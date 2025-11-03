import { motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessagesList from "./components/MessagesList";
import InputBar from "./components/InputBar";
import { useChat } from "./hooks/useChat";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
    const {
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
    } = useChat(API_URL);

    // Layout states
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [sidebarOpen, setSidebarOpen] = useState(
        () => window.innerWidth >= 768
    );
    const SIDEBAR_OPEN_PX = 320;
    const SIDEBAR_CLOSED_PX = 56;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                onSelectConversation={setActiveConversationId}
                onNewConversation={startNewConversation}
                onDeleteConversation={deleteConversation}
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
                    firstMessageSent={firstMessageSent}
                    isNewConversation={isNewConversation}
                    windowHeight={windowHeight}
                />
            </motion.div>
        </div>
    );
}
