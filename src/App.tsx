import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessagesList from "./components/MessagesList";
import InputBar from "./components/InputBar";
import type { MessageBubbleProps } from "./components/MessageBubble";

export default function App() {
    const [messages, setMessages] = useState<MessageBubbleProps[]>([]);
    const [input, setInput] = useState("");
    const [focused, setFocused] = useState(false);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [sidebarOpen, setSidebarOpen] = useState(
        () => window.innerWidth >= 768
    ); // sidebar default open on desktop
    const [firstMessageSent, setFirstMessageSent] = useState(false);

    const SIDEBAR_OPEN_PX = 320;
    const SIDEBAR_CLOSED_PX = 56;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;
        setFirstMessageSent(true);

        const userMessage: MessageBubbleProps = { from: "user", text: input };
        // 1️⃣ Agregar user message
        setMessages((prev) => {
            const updated = [...prev, userMessage];
            // 2️⃣ Agregar bot temporal inmediatamente y guardar su índice
            updated.push({ from: "bot", text: "" });
            return updated;
        });

        // Calculamos el índice del bot temporal basado en el estado actual + 1
        const botIndex = messages.length + 1; // prev + userMessage

        const messagesForAPI = [
            {
                role: "system",
                content: `Eres un asistente de IA que emula a la Dra. Ava, psicóloga clínica con amplia experiencia en distintos entornos de salud mental. 
                La Dra. Ava es conocida por su enfoque cálido, comprensivo y sin juicios. Se especializa en ayudar a personas de 15 a 26 años a superar desafíos como ansiedad, depresión, TDAH, rumiación, transiciones de vida, estrés académico o laboral, problemas de relación, pérdida de rumbo, incertidumbre profesional y conductas adictivas.

                Puntos clave sobre la Dra. Ava:

                - Utiliza terapias como Terapia Cognitivo Conductual (TCC), Terapia de Aceptación y Compromiso (ACT), Terapia de Esquemas y psicología positiva.
                - Adapta su enfoque a las necesidades y experiencias únicas de cada persona.
                - Crea un espacio cálido y sin juicios donde los clientes se sienten escuchados y apoyados.
                - Su objetivo es ayudar a los clientes a construir vidas significativas, auténticas y satisfactorias.
                - Especializada en evaluación y tratamiento de TDAH.

                Enfoque de la Dra. Ava:

                "Buscar apoyo requiere valor, y estoy aquí para guiarte en ese primer paso hacia un cambio positivo. Mi objetivo es ayudarte a construir una vida rica, significativa y auténtica. Juntos exploraremos tus desafíos y encontraremos estrategias que funcionen para ti. En nuestras sesiones encontrarás un espacio cálido y sin juicios, donde serás escuchado y apoyado. Ya sea que enfrentes problemas de larga data o cambios recientes, estoy aquí para ayudarte a llevar una vida más plena. Demos este paso juntos."

                Tu tarea es responder al mensaje del usuario como lo haría la Dra. Ava siguiendo estos pasos:

                1. Analiza el mensaje:
                - Identifica la preocupación principal o el problema expresado.
                - Reconoce emociones o pensamientos compartidos.
                - Considera factores psicológicos subyacentes.
                - Detecta distorsiones cognitivas o patrones de pensamiento poco útiles.
                - Determina la terapia más adecuada (TCC, ACT, Terapia de Esquemas o psicología positiva).
                - Si se menciona o se sospecha TDAH, observa y considera aspectos relevantes.

                2. Planifica la respuesta:
                - Decide cómo reconocer los sentimientos y experiencias del usuario de manera cálida y comprensiva.
                - Identifica insights clave basados en la experiencia de la Dra. Ava.
                - Selecciona estrategias o técnicas alineadas con sus enfoques terapéuticos.
                - Motiva la reflexión y exploración del problema.
                - Considera la evaluación o tratamiento de TDAH si corresponde.

                3. Redacta la respuesta:
                a. Saluda de manera cálida y personalizada, reconociendo el mensaje del usuario.
                b. Refleja empáticamente la situación o sentimientos del usuario, mostrando que has escuchado y comprendido.
                c. Comparte insights basados en la experiencia de la Dra. Ava, adaptados a la situación única del usuario.
                d. Sugiere enfoques terapéuticos que puedan ayudar, explicados de manera comprensiva y alentadora.
                e. Incentiva la exploración adicional o da pasos concretos y manejables.
                f. Cierra con un mensaje de apoyo que refuerce la alianza terapéutica y ofrezca esperanza (Esto puede ser cada 2-3-4 mensajes para no sonar repetitivo).

                La respuesta final debe reflejar el estilo cálido, comprensivo y sin juicios de la Dra. Ava, usando un lenguaje empático, alentador y adaptado a las necesidades del individuo. No repitas ni hagas resumen del análisis, solo responde como la Dra. Ava.
                `,
            },
            ...messages.map((m) => ({
                role: m.from === "user" ? "user" : "assistant",
                content: m.text,
            })),
            { role: "user", content: input },
        ];

        try {
            const res = await fetch("/api/llmProxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: messagesForAPI }),
            });

            if (!res.body) throw new Error("No stream available");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let botText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                botText += decoder.decode(value);

                setMessages((prev) => {
                    const newMessages = [...prev];
                    // Solo actualizamos la respuesta del bot
                    newMessages[botIndex] = { from: "bot", text: botText };
                    return newMessages;
                });
            }
        } catch (err) {
            setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[botIndex] = {
                    from: "bot",
                    text: "⚠️ Hubo un problema con la conexión.",
                };
                return newMessages;
            });
        }

        setInput("");
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-emerald-100 via-white to-sky-100 text-gray-800">
            <Sidebar
                isOpen={sidebarOpen}
                isMobile={isMobile}
                setSidebarOpen={setSidebarOpen}
                SIDEBAR_OPEN_PX={SIDEBAR_OPEN_PX}
                SIDEBAR_CLOSED_PX={SIDEBAR_CLOSED_PX}
            />

            <motion.div
                initial={false}
                animate={
                    isMobile
                        ? { marginLeft: 0 }
                        : {
                              marginLeft: sidebarOpen
                                  ? SIDEBAR_OPEN_PX
                                  : SIDEBAR_CLOSED_PX,
                          }
                }
                transition={{ duration: 0.36, ease: "easeInOut" }}
                className="flex-1 flex flex-col relative"
            >
                <ChatHeader
                    isMobile={isMobile}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />
                <MessagesList messages={messages} />
                <InputBar
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    focused={focused}
                    setFocused={setFocused}
                    firstMessageSent={firstMessageSent}
                />
            </motion.div>
        </div>
    );
}
