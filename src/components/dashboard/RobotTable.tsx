"use client";

import { RobotStats } from "@/lib/types";
import { Users, MapPin } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import RobotLocationMap from "./RobotLocationMap";

interface RobotTableProps {
  robots: RobotStats[];
  handleViewRobot: (robot: RobotStats) => void;
}

const getStatusColor = (estado: string | undefined) => {
  switch (estado) {
    case "activo":
      return "text-white border-0";
    case "inactivo":
      return "bg-slate-100 text-slate-700 border border-slate-200";
    case "mantenimiento":
      return "text-white border-0";
    case "error":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
};

const getStatusStyle = (estado: string | undefined) => {
  switch (estado) {
    case "activo":
      return { backgroundColor: "#4caf50" };
    case "mantenimiento":
      return { backgroundColor: "#0057a3" };
    default:
      return {};
  }
};

export default function RobotTable({
  robots,
  handleViewRobot,
}: RobotTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Nombre
            </TableHead>
            <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Estado
            </TableHead>
            <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Ubicación
            </TableHead>
            <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Total Lecturas
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {robots.map((robot) => (
            <TableRow
              key={robot.id}
              className="hover:bg-slate-50 cursor-pointer transition-colors duration-200 border-b border-slate-100"
              onClick={() => handleViewRobot(robot)}
              title="Haz clic para ver detalles del robot"
            >
              <TableCell className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3 sm:mr-4"
                    style={{ backgroundColor: "#0057a3", opacity: 0.1 }}
                  >
                    <span className="text-sm sm:text-lg">🤖</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm sm:text-base font-semibold text-slate-900 block truncate">
                      {robot.nombre || "Sin nombre"}
                    </span>
                    <div className="text-xs sm:text-sm text-slate-500 font-mono truncate">
                      {robot.uuid || "Sin UUID"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium capitalize ${getStatusColor(
                    robot.estado || "desconocido"
                  )}`}
                  style={getStatusStyle(robot.estado)}
                >
                  {robot.estado || "desconocido"}
                </span>
              </TableCell>
              <TableCell className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                <div className="flex justify-center sm:justify-start">
                  <RobotLocationMap
                    lat={robot.latitud}
                    lng={robot.longitud}
                    ubicacion={robot.ubicacion || "Costa Rica"}
                  />
                </div>
              </TableCell>
              <TableCell className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap text-sm sm:text-base text-slate-900 font-medium">
                {(robot.total_registros || 0).toLocaleString("es-ES")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {robots.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No se encontraron robots
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
