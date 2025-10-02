import { MessageSquare } from "lucide-react";

type ChatHeaderProps = {
    isMobile: boolean;
    onOpenSidebar: () => void;
};

export default function ChatHeader({
    isMobile,
    onOpenSidebar,
}: ChatHeaderProps) {
    return (
        <header className="absolute top-0 md:h-[50px] h-[60px] w-full flex items-center justify-between md:py-8 p-4 bg-white/20 backdrop-blur-md border-b border-emerald-200 z-10">
            {isMobile && (
                <button
                    onClick={onOpenSidebar}
                    className="p-2 rounded-full shadow-md"
                    aria-label="Abrir conversaciones"
                >
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                </button>
            )}
            <h1 className="hidden md:block absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-wide text-emerald-800">
                Nueva Conversacion
            </h1>
        </header>
    );
}
