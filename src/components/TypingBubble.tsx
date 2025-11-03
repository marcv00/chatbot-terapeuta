import { motion } from "framer-motion";

export default function TypingBubble() {
    const dots = [0, 1, 2];

    return (
        <motion.div
            className="self-start bg-emerald-200/50 text-emerald-900 py-4 rounded-2xl max-w-[85px] flex justify-center gap-1"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {dots.map((_, i) => (
                <motion.span
                    key={i}
                    className="w-2 h-2 bg-emerald-900 rounded-full"
                    animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{
                        y: {
                            duration: 0.6,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "loop",
                            repeatDelay: 0.6, // pause after each full cycle
                            delay: i * 0.15, // sequential delay
                        },
                        opacity: {
                            duration: 0.6,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "loop",
                            repeatDelay: 0.6,
                            delay: i * 0.15,
                        },
                    }}
                />
            ))}
        </motion.div>
    );
}
