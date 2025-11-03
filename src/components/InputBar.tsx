import { motion } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { Send } from "lucide-react";
import { useState, useEffect } from "react";

type InputBarProps = {
    input: string;
    setInput: (val: string) => void;
    sendMessage: () => void;
    firstMessageSent: boolean;
    isNewConversation: boolean;
    sidebarOpen: boolean;
    SIDEBAR_OPEN_PX: number;
    SIDEBAR_CLOSED_PX: number;
};

export default function InputBar({
    input,
    setInput,
    sendMessage,
    firstMessageSent,
    isNewConversation,
    sidebarOpen,
    SIDEBAR_OPEN_PX,
    SIDEBAR_CLOSED_PX,
}: InputBarProps) {
    const [focused, setFocused] = useState(false);
    const [keyboardOffset, setKeyboardOffset] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Detect keyboard and resize
    useEffect(() => {
        let timeout: any;

        const handleResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (window.visualViewport) {
                    const offset =
                        window.innerHeight - window.visualViewport.height;
                    setKeyboardOffset(offset > 0 ? offset + 8 : 0);
                }
            }, 80);
        };

        if (window.visualViewport)
            window.visualViewport.addEventListener("resize", handleResize);

        const handleWidth = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleWidth);

        return () => {
            if (window.visualViewport)
                window.visualViewport.removeEventListener(
                    "resize",
                    handleResize
                );
            window.removeEventListener("resize", handleWidth);
            clearTimeout(timeout);
        };
    }, []);

    const shouldCenter = isNewConversation && !firstMessageSent;
    const offset = isMobile
        ? 0
        : sidebarOpen
        ? SIDEBAR_OPEN_PX
        : SIDEBAR_CLOSED_PX;

    return (
        <motion.div
            initial={false}
            animate={
                shouldCenter
                    ? {
                          top: "50%",
                          left: `calc(${offset}px + 50% - ${offset / 2}px)`,
                          x: "-50%",
                          y: "-50%",
                          bottom: "auto",
                      }
                    : {
                          top: "auto",
                          left: `calc(${offset}px + 50% - ${offset / 2}px)`,
                          x: "-50%",
                          y: 0,
                          bottom: keyboardOffset > 0 ? keyboardOffset + 8 : 24,
                      }
            }
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed w-full max-w-4xl flex flex-col items-center px-4 lg:px-0"
        >
            {shouldCenter && (
                <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="md:text-3xl text-2xl text-center font-semibold text-emerald-800 mb-8"
                >
                    ¿En qué estás pensando? 🌱
                </motion.h2>
            )}

            <motion.div
                animate={{
                    boxShadow: focused
                        ? "0px 0px 20px rgba(52, 211, 153, 0.6)"
                        : "0px 0px 6px rgba(0,0,0,0.08)",
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-white/70 backdrop-blur-xl border border-emerald-300 shadow-lg w-full max-w-4xl"
            >
                <TextareaAutosize
                    minRows={1}
                    maxRows={5}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        (e.preventDefault(), sendMessage())
                    }
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400 px-2 py-2"
                />

                <motion.button
                    whileTap={{ scale: 0.88 }}
                    whileHover={{ scale: 1.06 }}
                    onClick={() => {
                        sendMessage();
                        setFocused(true);
                        setTimeout(() => setFocused(false), 600);
                    }}
                    className="relative p-2 rounded-full bg-gradient-to-r from-emerald-300 to-sky-300 text-gray-800 shadow cursor-pointer"
                    aria-label="Enviar mensaje"
                >
                    <Send className="w-5 h-5 relative z-10" />
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
