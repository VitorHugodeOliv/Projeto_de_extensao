import React, { useEffect, useState } from "react";
import api from "../../apis/apiAxios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import "../css/cssPainelAdmin.css";

interface Totais {
  total: number;
  aprovadas: number;
  rejeitadas: number;
  em_analise: number;
}

const COLORS = ["#009170", "#FFBB28", "#FF8042", "#0088FE", "#E83E8C"];

const PainelAdmin: React.FC = () => {
  const [dadosCategoria, setDadosCategoria] = useState<any[]>([]);
  const [dadosStatus, setDadosStatus] = useState<any[]>([]);
  const [dadosTemporais, setDadosTemporais] = useState<any[]>([]);
  const [periodo, setPeriodo] = useState(3);
  const [totais, setTotais] = useState<Totais | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const res = await api.get("/admin/estatisticas");
        setDadosCategoria(res.data.porCategoria || []);
        setDadosStatus(res.data.porStatus || []);
        setTotais(res.data.totais || null);
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregarEstatisticas();
  }, []);

  useEffect(() => {
    const carregarTemporais = async () => {
      try {
        const res = await api.get(`/admin/estatisticas-temporais?meses=${periodo}`);
        setDadosTemporais(res.data.dados || []);
      } catch (err) {
        console.error("Erro ao carregar dados temporais:", err);
      }
    };
    carregarTemporais();
  }, [periodo]);

  if (carregando) return <p>Carregando estatísticas...</p>;

  return (
    <div className="painel-admin">
      <h2>📊 Painel Estatístico</h2>
      <p>Resumo geral das histórias enviadas e aprovadas no sistema.</p>

      {totais && (
        <div className="cards-totais">
          <div className="card-info total">
            <h4>Total de Histórias</h4>
            <p>{totais.total}</p>
          </div>
          <div className="card-info aprovadas">
            <h4>Aprovadas</h4>
            <p>{totais.aprovadas}</p>
          </div>
          <div className="card-info rejeitadas">
            <h4>Rejeitadas</h4>
            <p>{totais.rejeitadas}</p>
          </div>
          <div className="card-info analise">
            <h4>Em Análise</h4>
            <p>{totais.em_analise}</p>
          </div>
        </div>
      )}

      <div className="graficos-container">
        <div className="grafico-card">
          <h4>Histórias por Categoria</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosCategoria}
                dataKey="total"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {dadosCategoria.map((_: any, index: number) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grafico-card">
          <h4>Histórias por Status</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#009170" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grafico-card">
        <div className="filtro-tempo">
          <h4>Evolução de Envios</h4>
          <select value={periodo} onChange={(e) => setPeriodo(Number(e.target.value))}>
            <option value={1}>Último mês</option>
            <option value={3}>Últimos 3 meses</option>
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Últimos 12 meses</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosTemporais}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#009170"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PainelAdmin;
