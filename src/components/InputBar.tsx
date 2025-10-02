import { motion } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { Send } from "lucide-react";

type InputBarProps = {
    input: string;
    setInput: (val: string) => void;
    sendMessage: () => void;
    focused: boolean;
    setFocused: (f: boolean) => void;
    firstMessageSent: boolean;
};

export default function InputBar({
    input,
    setInput,
    sendMessage,
    focused,
    setFocused,
    firstMessageSent,
}: InputBarProps) {
    return (
        <motion.div
            initial={false}
            animate={
                firstMessageSent
                    ? { bottom: 24, top: "auto", translateY: "0%" }
                    : { top: "50%", bottom: "auto", translateY: "-50%" }
            }
            transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            className="absolute w-full flex flex-col items-center pointer-events-none px-4 lg:px-0"
        >
            {!firstMessageSent && (
                <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="md:text-3xl text-2xl text-center font-semibold text-emerald-800 mb-8 pointer-events-auto"
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
                className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-3xl bg-white/70 backdrop-blur-xl border border-emerald-300 shadow-lg w-full max-w-4xl"
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
