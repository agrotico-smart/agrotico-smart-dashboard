"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SensorData } from "@/actions/ai";
import {
  Brain,
  ArrowLeft,
  Send,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  FileText,
  Bot as RobotIcon,
  Plus,
  MessageSquare,
  Save,
} from "lucide-react";
import Link from "next/link";
import { chatWithAI } from "@/actions/ai";
import { saveReport } from "@/actions/reports";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Robot {
  uuid: string;
  nombre: string;
  estado: string;
}

interface AIChatInterfaceProps {
  initialSensorData: SensorData | null;
}

const WELCOME_MESSAGE_CONTENT = `# 🌱 ¡Bienvenido a AgroTico AI!

Soy tu asistente especializado en **agricultura de precisión** y análisis de datos agrícolas. Estoy aquí para ayudarte a optimizar tus cultivos y tomar decisiones informadas basadas en los datos de tus sensores.

## 🎯 ¿En qué puedo ayudarte?

- **📊 Análisis de datos**: Interpretación de condiciones ambientales
- **🌱 Recomendaciones de cultivos**: Qué plantar según las condiciones
- **💧 Gestión del riego**: Optimización del uso del agua
- **⚠️ Alertas tempranas**: Detección de problemas potenciales
- **🔬 Diagnóstico**: Identificación de enfermedades y plagas
- **📈 Optimización**: Mejora del rendimiento de cultivos

## 💡 Ejemplos de preguntas:
- "¿Cómo están mis cultivos hoy?"
- "¿Necesito regar más?"
- "¿Qué cultivos son mejores para esta época?"
- "¿Hay algún problema con mis plantas?"

**¿En qué puedo ayudarte hoy?** 🤔`;

const getInitialMessages = (): Message[] => [
  {
    id: "welcome",
    role: "assistant",
    content: WELCOME_MESSAGE_CONTENT,
  },
];

export default function AIChatInterface({
  initialSensorData,
}: AIChatInterfaceProps) {
  const [sensorData, setSensorData] = useState<SensorData | null>(
    initialSensorData
  );
  const [loadingSensorData, setLoadingSensorData] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<string>("");
  const [loadingRobots, setLoadingRobots] = useState(false);
  const [savedChats, setSavedChats] = useState<{ [key: string]: Message[] }>(
    {}
  );
  const [currentChatId, setCurrentChatId] = useState<string>("default");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedRobotMeta = useMemo(
    () => robots.find((robot) => robot.uuid === selectedRobot) || null,
    [robots, selectedRobot]
  );
  const friendlyRobotName = selectedRobotMeta?.nombre
    ? selectedRobotMeta.nombre
    : selectedRobotMeta
    ? selectedRobotMeta.uuid
    : "tu robot";
  const suggestedPrompts = useMemo(
    () => [
      "Genera un diagnóstico integral del microclima actual.",
      `¿Qué alertas debo monitorear para ${friendlyRobotName}?`,
      "Sugiere acciones de riego y nutrición para las próximas 24 horas.",
    ],
    [friendlyRobotName]
  );
  const savedChatIds = Object.keys(savedChats);

  const canChat = Boolean(
    selectedRobot && selectedRobot !== "all" && robots.length > 0
  );

  // Estados para paneles colapsables

  // Función para guardar el chat en la base de datos
  const saveChatToDatabase = async () => {
    if (messages.length <= 1) {
      toast({
        title: "No hay conversación",
        description: "No hay mensajes para guardar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Crear el reporte en formato Markdown
      const reportContent = messages
        .filter(
          (msg) =>
            msg.role !== "assistant" ||
            !msg.content.includes("¡Bienvenido a AgroTico AI!")
        )
        .map((msg) => {
          if (msg.role === "user") {
            return `## Pregunta del Usuario\n\n${msg.content}`;
          } else {
            return `## Respuesta de AgroTico AI\n\n${msg.content}`;
          }
        })
        .join("\n\n---\n\n");

      // Obtener el robot seleccionado
      const robotUuid =
        !selectedRobot || selectedRobot === "all" ? null : selectedRobot;

      // Llamar a la función de guardar reporte
      const result = await saveReport(
        robotUuid || "general", // Usar "general" si no hay robot específico
        reportContent,
        new Date().toISOString().split("T")[0] // Fecha actual en formato YYYY-MM-DD
      );

      if (result.success) {
        toast({
          title: "✅ Chat guardado",
          description:
            "La conversación se ha guardado exitosamente en la base de datos.",
        });
      } else {
        toast({
          title: "❌ Error al guardar",
          description: result.error || "No se pudo guardar la conversación.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al guardar chat:", error);
      toast({
        title: "❌ Error al guardar",
        description: "Ocurrió un error inesperado al guardar la conversación.",
        variant: "destructive",
      });
    }
  };

  const { toast } = useToast();

  // Manual chat state management
  const [messages, setMessages] = useState<Message[]>(() => getInitialMessages());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Cargar robots del usuario
  const loadRobots = async () => {
    setLoadingRobots(true);
    try {
      const response = await fetch("/api/analytics/robots");

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data && data.data.robots) {
          setRobots(data.data.robots);
        } else {
          setRobots([]);
        }
      } else {
        console.error("❌ Error en la respuesta:", response.status);
        setRobots([]);
      }
    } catch (error) {
      console.error("❌ Error loading robots:", error);
      setRobots([]);
    } finally {
      setLoadingRobots(false);
    }
  };

  // Actualizar datos de sensores basado en robot seleccionado
  const updateSensorData = useCallback(async (robotUuid: string) => {
    setLoadingSensorData(true);
    try {
      const response = await fetch(`/api/analytics/current?robot=${robotUuid}`);

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          const robotData = data.data[0];
          const rawLat = robotData?.location?.latitud;
          const rawLng = robotData?.location?.longitud;
          const normalizedLat =
            typeof rawLat === "number"
              ? rawLat
              : typeof rawLat === "string"
              ? parseFloat(rawLat)
              : Number.NaN;
          const normalizedLng =
            typeof rawLng === "number"
              ? rawLng
              : typeof rawLng === "string"
              ? parseFloat(rawLng)
              : Number.NaN;

          setSensorData({
            id: 0,
            robot_uuid: robotData.robot_uuid || "",
            timestamp: robotData.timestamp || new Date().toISOString(),
            location: {
              latitud: Number.isFinite(normalizedLat)
                ? normalizedLat
                : Number.NaN,
              longitud: Number.isFinite(normalizedLng)
                ? normalizedLng
                : Number.NaN,
            },
            temperature: robotData.temperature,
            humidity: robotData.humidity,
            light: robotData.light,
            soil: robotData.soil,
            climate: robotData.climate,
          });
        } else {
          setSensorData(null);
        }
      } else {
        console.error("❌ Error en la respuesta de sensores:", response.status);
        setSensorData(null);
      }
    } catch (error) {
      console.error("❌ Error updating sensor data:", error);
      setSensorData(null);
    } finally {
      setLoadingSensorData(false);
    }
  }, []);

  // Manejar cambio de robot seleccionado
  const handleRobotChange = (value: string) => {
    setSelectedRobot(value);
    if (!value || value === "all") {
      setSensorData(null);
    }
  };

  useEffect(() => {
    if (robots.length === 0) {
      if (selectedRobot !== "") {
        setSelectedRobot("");
      }
      setSensorData(null);
      return;
    }

    if (robots.length === 1) {
      const soleRobotUuid = robots[0].uuid;
      if (selectedRobot !== soleRobotUuid) {
        setSelectedRobot(soleRobotUuid);
      }
      return;
    }

    const robotExists = robots.some((robot) => robot.uuid === selectedRobot);
    if (!selectedRobot || !robotExists) {
      if (selectedRobot !== "all") {
        setSelectedRobot("all");
      }
      setSensorData(null);
    }
  }, [robots, selectedRobot]);

  useEffect(() => {
    if (!selectedRobot || selectedRobot === "all") {
      return;
    }

    setSensorData(null);
    updateSensorData(selectedRobot);
  }, [selectedRobot, updateSensorData]);

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!canChat) {
      toast({
        title: "Selecciona un robot",
        description:
          robots.length === 0
            ? "No hay robots vinculados. Vincula un robot para poder chatear."
            : "Elige un robot específico para obtener respuestas precisas.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      return newMessages;
    });
    setInput("");
    setIsLoading(true);

    try {
      // Call real AI
      const responseText = await chatWithAI(
        [...messages, userMessage],
        sensorData
      );

      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content:
          responseText ||
          "Lo siento, no pude procesar tu solicitud. Intenta de nuevo.",
      };

      setMessages((prev) => {
        const newMessages = [...prev, aiResponse];
        // Guardar automáticamente el chat
        setTimeout(() => {
          const updatedChats = {
            ...savedChats,
            [currentChatId]: newMessages,
          };
          setSavedChats(updatedChats);
          localStorage.setItem("ai-chats", JSON.stringify(updatedChats));
        }, 100);
        return newMessages;
      });
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Error en chat:", error);
      setIsLoading(false);

      // Add error message
      const errorResponse: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Lo siento, hubo un error al procesar tu mensaje. Por favor, verifica tu conexión e intenta de nuevo.",
      };

      setMessages((prev) => [...prev, errorResponse]);

      toast({
        title: "Error en el chat",
        description: "No se pudo procesar tu mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Debug logs for messages
  useEffect(() => {
    // Messages updated
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar robots al montar el componente
  useEffect(() => {
    loadRobots();
    loadSavedChats();
  }, []);

  // Guardar chats en localStorage
  const saveChats = () => {
    try {
      localStorage.setItem("ai-chats", JSON.stringify(savedChats));
    } catch (error) {
      console.error("Error saving chats:", error);
    }
  };

  // Cargar chats desde localStorage
  const loadSavedChats = () => {
    try {
      const saved = localStorage.getItem("ai-chats");
      if (saved) {
        const chats = JSON.parse(saved);
        setSavedChats(chats);
        if (chats[currentChatId]) {
          setMessages(chats[currentChatId]);
        }
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  // Guardar mensajes actuales
  const saveCurrentChat = () => {
    const updatedChats = {
      ...savedChats,
      [currentChatId]: messages,
    };
    setSavedChats(updatedChats);
    localStorage.setItem("ai-chats", JSON.stringify(updatedChats));
  };

  // Crear nuevo chat
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setCurrentChatId(newChatId);
    setMessages(getInitialMessages());
  };

  // Cargar chat específico
  const loadChat = (chatId: string) => {
    setCurrentChatId(chatId);
    if (savedChats[chatId]) {
      setMessages(savedChats[chatId]);
    } else {
      setMessages(getInitialMessages());
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setSavedChats((prev) => {
      const updatedChats = { ...prev };
      delete updatedChats[chatId];
      if (typeof window !== "undefined") {
        localStorage.setItem("ai-chats", JSON.stringify(updatedChats));
      }
      return updatedChats;
    });

    if (currentChatId === chatId) {
      setCurrentChatId("default");
      setMessages(getInitialMessages());
    }

    toast({
      title: "Chat eliminado",
      description: "La conversación se eliminó del historial.",
    });
  };

  // Handle sensor data refresh
  const handleRefreshSensorData = async () => {
    setLoadingSensorData(true);
    try {
      // Simulate API call to refresh sensor data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Datos actualizados",
        description: "Los datos de sensores se han actualizado.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos de sensores.",
        variant: "destructive",
      });
    } finally {
      setLoadingSensorData(false);
    }
  };

  // Handle clear chat
  const handleClearChat = () => {
    setMessages(getInitialMessages());
    toast({
      title: "Chat limpiado",
      description: "La conversación ha sido reiniciada.",
    });
  };

  // Handle copy message
  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast({
        title: "Copiado",
        description: "El mensaje se ha copiado al portapapeles.",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el mensaje.",
        variant: "destructive",
      });
    }
  };

  // Handle generate report
  const handleGenerateReport = async () => {
    try {
      // Verificar que hay mensajes para generar reporte
      if (messages.length <= 1) {
        toast({
          title: "No hay conversación",
          description:
            "Necesitas tener una conversación para generar un reporte.",
          variant: "destructive",
        });
        return;
      }

      // Verificar que hay respuestas del asistente
      const assistantMessages = messages.filter(
        (msg) => msg.role === "assistant"
      );
      if (assistantMessages.length === 0) {
        toast({
          title: "No hay respuestas del asistente",
          description:
            "Necesitas respuestas del asistente para generar un reporte.",
          variant: "destructive",
        });
        return;
      }

      // Generar reporte basado en la conversación y datos de sensores
      const reportContent = `# Reporte Agrícola - ${new Date().toLocaleDateString("es-ES", { timeZone: "America/Costa_Rica" })}

## 📊 Datos de Sensores

${
  sensorData
    ? `
- **Temperatura**: ${sensorData.temperature?.temperatura_celsius || "N/A"}°C
- **Humedad**: ${sensorData.humidity?.humedad_pct || "N/A"}%
- **Luminosidad**: ${sensorData.light?.lux || "N/A"} lux
- **Humedad del Suelo**: ${sensorData.soil?.humedad_suelo || "N/A"}%
- **Temperatura del Suelo**: ${
        sensorData.soil?.temperatura_suelo_celsius || "N/A"
      }°C
`
    : "Datos de sensores no disponibles"
}

## 💬 Conversación

${messages
  .filter((msg) => msg.role === "assistant")
  .map((msg) => `### ${msg.content}`)
  .join("\n\n")}

---
*Reporte generado automáticamente el ${new Date().toLocaleString("es-ES", { timeZone: "America/Costa_Rica" })}*
`;

      // Guardar reporte en la base de datos
      const result = await saveReport(
        "default-robot-uuid", // TODO: Obtener UUID del robot actual
        reportContent
      );

      if (result.success) {
        toast({
          title: "Reporte generado",
          description: `Reporte guardado con ID: ${result.id}`,
        });

        // Agregar mensaje de confirmación al chat
        const confirmationMessage: Message = {
          id: `report-${Date.now()}`,
          role: "assistant",
          content: `✅ **Reporte generado exitosamente**

📊 **ID del Reporte**: ${result.id}
📅 **Fecha**: ${new Date().toLocaleDateString("es-ES", { timeZone: "America/Costa_Rica" })}
📝 **Contenido**: Incluye datos de sensores y conversación

El reporte ha sido guardado en la base de datos y está disponible para consulta.`,
        };

        setMessages((prev) => [...prev, confirmationMessage]);
      } else {
        toast({
          title: "Error al generar reporte",
          description: result.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al generar reporte:", error);
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-emerald-50/40 via-white to-white flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-emerald-100/70 bg-white/80 backdrop-blur">
        <div className="px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center min-w-0 gap-4">
              <Link href="/" className="flex items-center">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0">
                  <Brain className="h-9 w-9 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold text-slate-900 truncate">
                    AgroTico AI
                  </h1>
                  <p className="text-sm text-slate-500 truncate">
                    Conversaciones agrícolas con inteligencia de contexto
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Robot
                </span>
                {robots.length > 0 ? (
                  <Select
                    value={selectedRobot || undefined}
                    onValueChange={handleRobotChange}
                  >
                    <SelectTrigger className="w-52 h-9" disabled={loadingRobots}>
                      <SelectValue placeholder="Selecciona un robot" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {robots.length > 1 && (
                        <SelectItem value="all">
                          <div className="flex items-center">
                            <RobotIcon className="h-4 w-4 mr-2" />
                            <span>Todos los robots</span>
                          </div>
                        </SelectItem>
                      )}
                      {robots.map((robot) => (
                        <SelectItem key={robot.uuid} value={robot.uuid}>
                          <div className="flex items-center">
                            <RobotIcon className="h-4 w-4 mr-2" />
                            <span className="truncate">
                              {robot.nombre || robot.uuid}
                            </span>
                            <Badge
                              variant="secondary"
                              className="ml-2 text-[10px]"
                              style={{
                                backgroundColor:
                                  robot.estado === "activo"
                                    ? "#059669"
                                    : "#d97706",
                                color: "white",
                              }}
                            >
                              {robot.estado}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Sin robots vinculados
                  </Badge>
                )}
                {loadingRobots && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Cargando…
                  </span>
                )}
                {selectedRobot === "all" && robots.length > 1 && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                    Elige un robot específico
                  </Badge>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    <MessageSquare className="h-3.5 w-3.5 mr-2" />
                    Historial
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Chats guardados</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {savedChatIds.length === 0 ? (
                    <DropdownMenuItem disabled>
                      No hay conversaciones guardadas
                    </DropdownMenuItem>
                  ) : (
                    savedChatIds.map((chatId) => (
                      <DropdownMenuItem
                        key={chatId}
                        onSelect={() => loadChat(chatId)}
                        className="text-sm"
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate">
                              {chatId === "default"
                                ? "Chat principal"
                                : `Chat ${chatId.split("-")[1]}`}
                            </span>
                            <span className="text-xs text-slate-400">
                              {savedChats[chatId]?.length || 0}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-red-500"
                            disabled={chatId === "default"}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleDeleteChat(chatId);
                            }}
                            aria-label={
                              chatId === "default"
                                ? "Eliminar chat principal (deshabilitado)"
                                : "Eliminar chat"
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => createNewChat()}
                    className="text-emerald-600"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Nuevo chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={handleRefreshSensorData}
                disabled={loadingSensorData || !canChat}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 mr-2 ${
                    loadingSensorData ? "animate-spin" : ""
                  }`}
                />
                Sincronizar
              </Button>
              <Button
                onClick={saveChatToDatabase}
                size="sm"
                variant="outline"
                className="h-8 px-3"
                disabled={!canChat || messages.length <= 1}
              >
                <Save className="h-3.5 w-3.5 mr-2" />
                Guardar
              </Button>
              <Button
                onClick={handleGenerateReport}
                variant="outline"
                size="sm"
                className="h-8 px-3"
                disabled={!canChat || messages.length <= 1}
              >
                <FileText className="h-3.5 w-3.5 mr-2" />
                Reporte
              </Button>
              <Button
                onClick={handleClearChat}
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] group`}
                  >
                    <div
                      className={`relative overflow-hidden ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto shadow-lg"
                          : "bg-white/95 text-gray-900 shadow-lg border border-emerald-100"
                      } rounded-2xl transition-shadow duration-200`}
                    >
                      {/* Header del mensaje */}
                      <div
                        className={`px-5 py-4 border-b ${
                          message.role === "user"
                            ? "border-blue-400/30"
                            : "border-emerald-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                message.role === "user"
                                  ? "bg-blue-400"
                                  : "bg-emerald-100"
                              }`}
                            >
                              {message.role === "user" ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4 text-emerald-600" />
                              )}
                            </div>
                            <div>
                              <span
                                className={`text-sm font-semibold ${
                                  message.role === "user"
                                    ? "text-white"
                                    : "text-slate-800"
                                }`}
                              >
                                {message.role === "user" ? "Tú" : "AgroTico AI"}
                              </span>
                              {message.role === "assistant" && (
                                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                  🌱 Especialista Agrícola
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyMessage(message.content, message.id)
                              }
                              className={`h-7 w-7 p-0 ${
                                message.role === "user"
                                  ? "hover:bg-blue-400/20 text-white"
                                  : "hover:bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Contenido del mensaje */}
                      <div className="px-5 py-6">
                        <div className="prose prose-sm max-w-none break-words prose-p:mb-4 prose-headings:mb-3 prose-ul:mb-4 prose-ol:mb-4 prose-li:mb-1">
                          {message.role === "assistant" ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="whitespace-pre-wrap text-white leading-relaxed">
                              {message.content}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Decoración sutil */}
                      {message.role === "assistant" && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-400"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador de procesamiento */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]`}>
                    <div className="relative overflow-hidden bg-white/95 text-gray-900 shadow-lg border border-emerald-100 rounded-2xl">
                      <div className="px-5 py-4 border-b border-emerald-50">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100">
                            <Bot className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-800">
                              AgroTico AI
                            </span>
                            <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                              🌱 Especialista Agrícola
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-6">
                        <div className="flex items-center space-x-3">
                          <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
                          <div>
                            <span className="text-sm font-medium text-slate-800">
                              Analizando tus datos agrícolas...
                            </span>
                            <p className="text-xs text-slate-600 mt-1">
                              Procesando información de sensores y generando recomendaciones
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-400"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-emerald-100/60 bg-white/85 backdrop-blur px-4 py-4">
            <div className="max-w-6xl mx-auto">
              {!canChat && (
                <p className="mb-3 text-sm text-amber-600">
                  {robots.length === 0
                    ? "Robots no disponibles. Vincula un robot antes de conversar."
                    : selectedRobot === "all"
                    ? "Selecciona un robot específico para evitar respuestas genéricas."
                    : "Selecciona un robot disponible para chatear con AgroTico AI."}
                </p>
              )}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Describe la situación de tu cultivo o formula una pregunta…"
                    disabled={isLoading || !canChat}
                    className="h-12 rounded-xl border-emerald-100 bg-white/95 pr-16 text-base focus-visible:ring-emerald-500"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center text-xs text-slate-400 sm:flex">
                    {canChat ? "⇧ + Enter" : "Conecta un robot"}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim() || !canChat}
                  size="sm"
                  className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span>Procesando…</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      <span>Enviar</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
