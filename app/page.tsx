"use client";

import { Navbar, NavbarBrand } from "@heroui/navbar";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

// Interfaces
interface EquipoData {
  mac: string;
  tipo: string;
  modelo: string;
  departamento: string;
  estado: string;
  fabricante?: string;
}

interface Equipo {
  ip: string;
  mac: string;
  tipo: string;
  modelo: string;
  departamento: string;
  estado: string;
  Correcto: string;
}

export default function App() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [conectado, setConectado] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  // Tomamos la IP desde .env.local
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const wsURL = baseURL.replace("http", "ws") + "/ws";

  useEffect(() => {
    const ws = new WebSocket(wsURL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Conectado al WebSocket");
      setConectado(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Record<string, EquipoData>;
        const listaEquipos = Object.entries(data).map(([ip, valores]) => ({
          ip,
          mac: valores.mac,
          tipo: valores.tipo,
          modelo: valores.modelo,
          departamento: valores.departamento,
          estado: valores.estado,
          Correcto: valores.fabricante || "Desconocido",
        }));

        if (updateTimeout.current) clearTimeout(updateTimeout.current);
        updateTimeout.current = setTimeout(() => {
          setEquipos(listaEquipos);
        }, 200);
      } catch {
        console.warn("Mensaje no era JSON:", event.data);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setConectado(false);
    };
    ws.onclose = () => {
      console.log("🔌 WebSocket cerrado");
      setConectado(false);
    };

    return () => {
      ws.close();
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
    };
  }, [wsURL]);

  const enviarCorreo = async () => {
    try {
      const res = await fetch(`${baseURL}/enviar-correo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Correo enviado",
          text: "El reporte fue enviado correctamente.",
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar el correo.",
      });
    }
  };

  const equiposFiltrados = useMemo(
    () =>
      equipos.filter(
        (e) =>
          e.ip.includes(busqueda) ||
          e.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.departamento.toLowerCase().includes(busqueda.toLowerCase())
      ),
    [busqueda, equipos]
  );

  const totalOnline = equipos.filter((e) => e.estado === "online").length;
  const totalOffline = equipos.length - totalOnline;

  return (
    <>
      {/* Navbar */}
      <Navbar className="bg-blue-500 shadow-lg">
        <NavbarBrand className="flex justify-between items-center w-full px-4">
          <div className="flex items-center gap-2">
            <img
              src="/picture.png"
              alt="Logo Sistemas"
              className="h-16 w-16 rounded-full"
              loading="lazy"
            />
            <h1 className="text-xl font-semibold text-white">Sistemas</h1>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              conectado ? "bg-green-600" : "bg-red-600"
            } text-white text-sm`}
          >
            <span className="w-2 h-2 rounded-full bg-white"></span>
            {conectado ? "Conectado" : "Desconectado"}
          </div>
        </NavbarBrand>
      </Navbar>

      {/* Controles superiores */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4 bg-gray-50">
        <input
          type="text"
          placeholder="Buscar por IP, tipo o departamento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/2 shadow-sm focus:ring focus:ring-blue-200"
        />

        <button
          onClick={enviarCorreo}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ✉️ Enviar reporte por correo
        </button>
      </div>

      <div className="flex justify-center gap-6 text-lg font-semibold py-3">
        <span className="text-green-600">🟢 {totalOnline} Online</span>
        <span className="text-red-600">🔴 {totalOffline} Offline</span>
      </div>

      <div className="p-4 overflow-x-auto transition-colors duration-300">
        <table className="min-w-full border border-gray-300 bg-white text-gray-900 rounded-lg shadow">
          <thead className="bg-gray-200 text-gray-900">
            <tr>
              <th className="border px-4 py-2 text-left">Tipo dispositivo</th>
              <th className="border px-4 py-2 text-left">IP</th>
              <th className="border px-4 py-2 text-left">Modelo</th>
              <th className="border px-4 py-2 text-left">Departamento</th>
              <th className="border px-4 py-2 text-left">MAC</th>
              <th className="border px-4 py-2 text-left">Estado</th>
              <th className="border px-4 py-2 text-left">Fabricante</th>
            </tr>
          </thead>
          <tbody>
            {equiposFiltrados.map((equipo, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hover:bg-gray-100 transition-colors"
              >
                <td className="border px-4 py-2">{equipo.tipo}</td>
                <td className="border px-4 py-2">{equipo.ip}</td>
                <td className="border px-4 py-2">{equipo.modelo}</td>
                <td className="border px-4 py-2">{equipo.departamento}</td>
                <td className="border px-4 py-2">{equipo.mac}</td>
                <td
                  className={`border px-4 py-2 font-semibold ${
                    equipo.estado === "online"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {equipo.estado}
                </td>
                <td className="border px-4 py-2">{equipo.Correcto}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
