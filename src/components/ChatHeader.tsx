import { MessageSquare, User } from "lucide-react";

type ChatHeaderProps = {
    isMobile: boolean;
    onOpenSidebar: () => void;
};

export default function ChatHeader({
    isMobile,
    onOpenSidebar,
}: ChatHeaderProps) {
    return (
        <header className="flex items-center justify-between p-4 backdrop-blur-xl bg-white/50 border-b border-emerald-200">
            <div className="flex items-center gap-3">
                {isMobile && (
                    <button
                        onClick={onOpenSidebar}
                        className="p-2 rounded-full bg-white/60 shadow-md"
                        aria-label="Abrir conversaciones"
                    >
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </button>
                )}
                <h1 className="text-lg font-bold tracking-wide text-emerald-800">
                    Nueva Conversacion
                </h1>
            </div>
            <User className="w-6 h-6 cursor-pointer text-sky-600" />
        </header>
    );
}
