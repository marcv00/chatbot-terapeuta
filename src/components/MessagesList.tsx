import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import type { MessageBubbleProps } from "./MessageBubble";

type MessagesListProps = {
    messages: MessageBubbleProps[];
};

export default function MessagesList({ messages }: MessagesListProps) {
    const lastUserMsgRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (lastUserMsgRef.current && containerRef.current) {
            const container = containerRef.current;
            const element = lastUserMsgRef.current;

            const offset = 80; // px from the top
            const topPos = element.offsetTop - offset;

            container.scrollTo({
                top: topPos,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const lastUserIndex = [...messages]
        .reverse()
        .findIndex((msg) => msg.from === "user");

    const targetIndex =
        lastUserIndex !== -1 ? messages.length - 1 - lastUserIndex : -1;

    return (
        <main
            ref={containerRef}
            className="flex-1 overflow-y-auto pb-[60vh] md:pt-[6rem]"
        >
            <div className="max-w-4xl mx-auto px-4 lg:px-0 space-y-6 flex flex-col">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        ref={i === targetIndex ? lastUserMsgRef : null}
                    >
                        <MessageBubble from={msg.from} text={msg.text} />
                    </div>
                ))}
            </div>
        </main>
    );
}
