import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Plus, Trash } from "lucide-react";
import { useState } from "react";

type Conversation = {
    id: string;
    title: string;
    date: string;
};

type SidebarProps = {
    isOpen: boolean;
    isMobile: boolean;
    setSidebarOpen: (open: boolean) => void;
    SIDEBAR_OPEN_PX: number;
    SIDEBAR_CLOSED_PX: number;
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
    onDeleteConversation: (id: string) => void;
};

export default function Sidebar({
    isOpen,
    isMobile,
    setSidebarOpen,
    SIDEBAR_OPEN_PX,
    SIDEBAR_CLOSED_PX,
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
}: SidebarProps) {
    const [conversationToDelete, setConversationToDelete] = useState<
        string | null
    >(null);
    return (
        <AnimatePresence>
            <motion.aside
                initial={false}
                animate={
                    isMobile
                        ? { x: isOpen ? 0 : "-100%", width: "100%" }
                        : {
                              x: 0,
                              width: isOpen
                                  ? SIDEBAR_OPEN_PX
                                  : SIDEBAR_CLOSED_PX,
                          }
                }
                transition={{ duration: 0.36, ease: "easeInOut" }}
                className={`fixed top-0 left-0 h-full z-30 backdrop-blur-xl bg-white/40 border-r border-emerald-200 flex flex-col ${
                    isMobile ? "shadow-xl" : "shadow-sm"
                }`}
                style={{ overflow: "hidden" }}
            >
                <div className="flex items-center justify-between p-4">
                    {isOpen ? (
                        <>
                            <h2 className="text-lg font-semibold text-emerald-800">
                                Conversaciones
                            </h2>
                            <button
                                aria-label="Cerrar"
                                onClick={() => setSidebarOpen(false)}
                                className="p-1 rounded hover:bg-white/30"
                            >
                                <X className="w-6 h-6 text-emerald-600" />
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex items-center justify-center">
                            <button
                                aria-label="Abrir"
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-full hover:bg-white/30"
                            >
                                <MessageSquare className="w-5 h-5 text-emerald-600" />
                            </button>
                        </div>
                    )}
                </div>

                {isOpen && (
                    <div className="flex-1 overflow-y-auto px-4 pb-6">
                        <button
                            onClick={() => {
                                onNewConversation();

                                if (isMobile) {
                                    setTimeout(
                                        () => setSidebarOpen(false),
                                        300
                                    );
                                }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-5 rounded-xl bg-emerald-100 hover:bg-emerald-200 cursor-pointer mb-4"
                        >
                            <Plus className="w-4 h-4 text-emerald-700" />
                            <span className="text-sm font-medium text-emerald-700">
                                Nueva conversación
                            </span>
                        </button>

                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => {
                                    onSelectConversation(conv.id);

                                    if (isMobile) {
                                        setTimeout(
                                            () => setSidebarOpen(false),
                                            300
                                        );
                                    }
                                }}
                                className={`relative group px-3 py-4 rounded-xl cursor-pointer shadow-sm border mb-3 ${
                                    conv.id === activeConversationId
                                        ? "bg-emerald-200 border-emerald-400"
                                        : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                }`}
                            >
                                <p className="text-sm font-medium text-emerald-800 relative overflow-hidden whitespace-nowrap pr-6">
                                    {conv.title}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1">
                                    {conv.date}
                                </p>

                                {/* Botón eliminar */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConversationToDelete(conv.id);
                                    }}
                                    className={`absolute top-2 right-2 p-1 rounded hover:bg-white/50 
      ${isMobile ? "block" : "hidden group-hover:block"}`}
                                >
                                    <Trash className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </motion.aside>

            {/* 👇 Modal global va acá, al final del return */}
            <AnimatePresence>
                {conversationToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                ¿Eliminar conversación?
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() =>
                                        setConversationToDelete(null)
                                    }
                                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        onDeleteConversation(
                                            conversationToDelete
                                        );
                                        setConversationToDelete(null);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
}
