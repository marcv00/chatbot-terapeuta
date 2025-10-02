import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import type { MessageBubbleProps } from "./MessageBubble";

type MessagesListProps = {
    messages: MessageBubbleProps[];
};

export default function MessagesList({ messages }: MessagesListProps) {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Scroll into view whenever messages change
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <main className="flex-1 overflow-y-auto pb-[70vh] md:pt-[6rem]">
            <div className="max-w-4xl mx-auto px-4 lg:px-0 space-y-6 flex flex-col">
                {messages.map((msg, i) => (
                    <MessageBubble key={i} from={msg.from} text={msg.text} />
                ))}
                {/* invisible anchor to scroll to */}
                <div ref={bottomRef} />
            </div>
        </main>
    );
}
