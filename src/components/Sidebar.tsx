import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import conversationsData from "../assets/conversations.json";

type SidebarProps = {
    isOpen: boolean;
    isMobile: boolean;
    setSidebarOpen: (open: boolean) => void;
    SIDEBAR_OPEN_PX: number;
    SIDEBAR_CLOSED_PX: number;
};

export default function Sidebar({
    isOpen,
    isMobile,
    setSidebarOpen,
    SIDEBAR_OPEN_PX,
    SIDEBAR_CLOSED_PX,
}: SidebarProps) {
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
                                aria-label="Cerrar conversaciones"
                                onClick={() => setSidebarOpen(false)}
                                className="p-1 rounded hover:bg-white/30"
                            >
                                <X className="w-6 h-6 text-emerald-600" />
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex items-center justify-center">
                            <button
                                aria-label="Abrir conversaciones"
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
                        {conversationsData.map((conv) => (
                            <div
                                key={conv.id}
                                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 cursor-pointer shadow-sm border border-emerald-200 mb-3"
                            >
                                <p className="text-sm font-medium text-emerald-800">
                                    {conv.title}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1">
                                    {conv.date}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </motion.aside>
        </AnimatePresence>
    );
}
