"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { RefreshCw, Moon, Sun, Monitor } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [aiModel, setAiModel] = useState("deepseek-chat");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAiModel("deepseek-chat");

      // Cargar datos completos del usuario desde la API
      loadUserData();
    }

    // Cargar tema guardado
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [user]);

  const loadUserData = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;

        setName(userData.nombre || "");
        setEmail(userData.email || "");
        setTelefono(userData.telefono || "");
        setUbicacion(userData.ubicacion || "");

        toast({
          title: "Datos actualizados",
          description: "Los datos del usuario se han cargado correctamente.",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del usuario.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingAccount(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: name,
          email: email,
          telefono: telefono,
          ubicacion: ubicacion,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil se ha actualizado exitosamente.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al actualizar el perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error de validación",
        description: "Las nuevas contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }
    setIsSavingPassword(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña se ha cambiado exitosamente.",
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al cambiar la contraseña",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingAI(true);

    try {
      const response = await fetch("/api/user/ai-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiModel: aiModel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Preferencias actualizadas",
          description:
            "Las preferencias de IA se han actualizado exitosamente.",
        });
      } else {
        toast({
          title: "Error",
          description:
            data.error || "Error al actualizar las preferencias de IA",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAI(false);
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Aplicar el tema inmediatamente
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      // Sistema - usar preferencia del sistema
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    toast({
      title: "Tema actualizado",
      description: `El tema se ha cambiado a ${newTheme === "system" ? "sistema" : newTheme === "dark" ? "oscuro" : "claro"}.`,
    });
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <p>Debes iniciar sesión para ver la configuración.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Tabs defaultValue="account" className="w-full max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Cuenta</CardTitle>
              <CardDescription>
                Gestiona la configuración de tu cuenta y perfil.
              </CardDescription>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadUserData}
                  disabled={isLoadingData}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoadingData ? "animate-spin" : ""
                    }`}
                  />
                  Recargar Datos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingData && (
                <div className="flex items-center justify-center p-4">
                  <LoadingSpinner />
                  <span className="ml-2">Cargando datos del usuario...</span>
                </div>
              )}
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de Usuario</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    type="text"
                    placeholder="Ciudad, País"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSavingAccount}
                >
                  {isSavingAccount ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </form>
              <Separator />
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old-password">Contraseña Actual</Label>
                  <Input
                    id="old-password"
                    type="password"
                    placeholder="********"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">
                    Confirmar Nueva Contraseña
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="********"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de IA</CardTitle>
              <CardDescription>
                Configura el modelo de IA y las opciones relacionadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAISubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-model">Modelo de IA</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger id="ai-model">
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek-chat">
                        DeepSeek Chat
                      </SelectItem>
                      <SelectItem value="deepseek-coder">
                        DeepSeek Coder
                      </SelectItem>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo (via DeepSeek)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key-status">Estado de la API Key</Label>
                  <Input
                    id="api-key-status"
                    type="text"
                    value="Cargada desde .env"
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    La clave API de DeepSeek se gestiona a través de variables
                    de entorno.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isSavingAI}>
                  {isSavingAI
                    ? "Actualizando..."
                    : "Actualizar Configuración de IA"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personaliza la apariencia de tu dashboard y elige tu tema preferido.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme-select">Tema</Label>
                    <p className="text-sm text-muted-foreground">
                      Elige entre tema claro, oscuro o seguir la preferencia del sistema.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => handleThemeChange("light")}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <Sun className="h-5 w-5" />
                    <span>Claro</span>
                  </Button>
                  
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => handleThemeChange("dark")}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <Moon className="h-5 w-5" />
                    <span>Oscuro</span>
                  </Button>
                  
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => handleThemeChange("system")}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <Monitor className="h-5 w-5" />
                    <span>Sistema</span>
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Configuración actual</Label>
                    <p className="text-sm text-muted-foreground">
                      Tema: {theme === "system" ? "Sistema" : theme === "dark" ? "Oscuro" : "Claro"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
