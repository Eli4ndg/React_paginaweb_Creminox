import { useState } from "react";

function App() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ IP desde .env.local
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const mandarCorreo = async () => {
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(`${baseURL}/enviar-correo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setStatus(data.message || "Correo enviado correctamente.");
      alert("Correo enviado!");
    } catch (err) {
      setStatus("Error al enviar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Enviar Reporte por Correo</h1>

      <button onClick={mandarCorreo} disabled={loading}>
        {loading ? "Enviando..." : "Enviar correo ahora"}
      </button>

      <p>{status}</p>
    </div>
  );
}

export default App;
