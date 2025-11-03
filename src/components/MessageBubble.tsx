import { motion } from "framer-motion";

export type MessageBubbleProps = {
    from: "user" | "bot";
    text: string;
    isTyping?: boolean; // new flag for typing animation
};

export default function MessageBubble({ from, text }: MessageBubbleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`w-fit lg:py-4 py-3 px-7 lg:rounded-3xl rounded-2xl shadow-md backdrop-blur-xl  md:max-w-[75%]  max-w-[90%] break-words whitespace-pre-wrap ${
                from === "bot"
                    ? "bg-emerald-200/50 text-emerald-900 self-start"
                    : "bg-sky-200/50 text-sky-900 self-end ml-auto text-right"
            }`}
        >
            {text}
        </motion.div>
    );
}
