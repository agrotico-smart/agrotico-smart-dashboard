"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RobotStats } from "@/lib/types";
import { getRobotsData } from "@/actions/dashboard";

import RobotTableControls from "./dashboard/RobotTableControls";
import RobotTable from "./dashboard/RobotTable";
import EditRobotModal from "./dashboard/EditRobotModal";
import LinkRobotModal from "./dashboard/LinkRobotModal";
import LoadingSpinner from "./shared/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

interface DashboardProps {
  initialRobots: RobotStats[];
  initialLastUpdate: string;
}

export default function DashboardClient({
  initialRobots,
  initialLastUpdate,
}: DashboardProps) {
  const router = useRouter();
  const [robots, setRobots] = useState<RobotStats[]>(initialRobots);
  const [lastUpdate, setLastUpdate] = useState(initialLastUpdate);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [selectedRobot, setSelectedRobot] = useState<RobotStats | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const { robots, lastUpdate } = await getRobotsData();
      setRobots(robots);
      setLastUpdate(lastUpdate);
    });
  };

  const handleViewRobot = (robot: RobotStats) => {
    router.push(`/robot/${(robot as any).uuid}`);
  };

  const handleSaveRobot = (updatedRobot: RobotStats) => {
    // In a real app, you would call a server action to save the robot
    setSelectedRobot(null);
    handleRefresh();
  };

  const handleLinkRobot = async (uuid: string) => {
    // Aquí implementarías la lógica para vincular el robot
    // Por ahora solo simulamos la vinculación

    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Recargar datos después de vincular
    handleRefresh();
  };

  const filteredRobots = robots.filter((robot) => {
    const matchesSearch =
      (robot.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((robot as any).uuid || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "todos" || (robot.estado || "desconocido") === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {isPending && <LoadingSpinner />}

        {/* Header con botón de vincular robot */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Dashboard de Robots
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Gestiona y monitorea tus robots agrícolas
            </p>
          </div>
          <Button
            onClick={() => setShowLinkModal(true)}
            className="flex items-center space-x-2 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
            style={{ backgroundColor: "#0057a3" }}
          >
            <Link className="h-4 w-4" />
            <span className="text-sm sm:text-base">Vincular Robot</span>
          </Button>
        </div>

        <Card className="p-4 sm:p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <RobotTableControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            loading={isPending}
            handleRefresh={handleRefresh}
          />
          <div className="mt-4 sm:mt-6">
            <RobotTable
              robots={filteredRobots}
              handleViewRobot={handleViewRobot}
            />
          </div>
        </Card>

        <div className="mt-6 sm:mt-8 text-center text-sm text-slate-500">
          <p className="flex items-center justify-center gap-2">
            <span className="text-lg">🌱</span>
            <span>
              Agrotico Smart Dashboard - Sistema de Monitoreo Agrícola
            </span>
          </p>
          {lastUpdate && (
            <p className="mt-1 text-xs sm:text-sm">
              Última actualización: {lastUpdate}
            </p>
          )}
        </div>
      </div>

      <EditRobotModal
        robot={selectedRobot}
        onClose={() => setSelectedRobot(null)}
        onSave={handleSaveRobot}
      />

      <LinkRobotModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onLinkRobot={handleLinkRobot}
      />
    </div>
  );
}
