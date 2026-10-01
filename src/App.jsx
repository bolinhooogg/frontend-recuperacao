// ██╗   ██╗██╗ ██████╗████████╗ ██████╗ ██████╗
// ██║   ██║██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
// ██║   ██║██║██║        ██║   ██║   ██║██████╔╝
// ╚██╗ ██╔╝██║██║        ██║   ██║   ██║██╔══██╗
//  ╚████╔╝ ██║╚██████╗   ██║   ╚██████╔╝██║  ██║
//   ╚═══╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
// VICTOR

import React, { useState } from 'react';

const codigoClima = {
  0: 'Céu limpo', 1: 'Quase limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Neblina', 48: 'Neblina com geada', 51: 'Garoa leve', 53: 'Garoa', 55: 'Garoa forte',
  61: 'Chuva leve', 63: 'Chuva', 65: 'Chuva forte', 71: 'Neve leve', 73: 'Neve', 75: 'Neve forte',
  80: 'Pancadas leves', 81: 'Pancadas de chuva', 82: 'Pancadas fortes', 95: 'Trovoada',
};

export default function App() {
  const [cidade, setCidade] = useState('');
  const [clima, setClima] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function buscarClima(event) {
    event.preventDefault();
    const busca = cidade.trim();
    if (!busca) {
      setErro('Digite o nome de uma cidade para fazer a busca.');
      setClima(null);
      return;
    }

    setCarregando(true);
    setErro('');
    setClima(null);
    try {
      const geocode = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca)}&count=1&language=pt&format=json`);
      if (!geocode.ok) throw new Error('Não foi possível consultar a busca agora.');
      const dadosLugar = await geocode.json();
      const lugar = dadosLugar.results?.[0];
      if (!lugar) {
        setErro('Não encontrei essa cidade. Confira o nome e tente novamente.');
        return;
      }

      const previsao = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lugar.latitude}&longitude=${lugar.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`);
      if (!previsao.ok) throw new Error('O serviço de clima está indisponível. Tente de novo daqui a pouco.');
      const dados = await previsao.json();
      setClima({ lugar, atual: dados.current });
    } catch (e) {
      setErro(e.message || 'Aconteceu um erro na busca. Verifique sua conexão.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="pagina">
      <header className="topo"><span className="marca">☀</span><span>CLIMA AGORA</span><span className="status">Consulta ao vivo</span></header>
      <section className="introducao">
        <p className="etiqueta">PAINEL DO TEMPO</p>
        <h1>Como está o clima<br /><span>por aí?</span></h1>
        <p className="descricao">Pesquise uma cidade e veja as condições atuais.</p>
        <form className="busca" onSubmit={buscarClima}>
          <span aria-hidden="true">⌕</span>
          <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Digite uma cidade..." aria-label="Nome da cidade" />
          <button disabled={carregando}>{carregando ? 'Buscando...' : 'Buscar'}</button>
        </form>
      </section>

      {erro && <div className="aviso" role="alert">{erro}</div>}
      {clima && (
        <section className="cartao" aria-live="polite">
          <div className="cartao-cabecalho"><div><p className="etiqueta">AGORA EM</p><h2>{clima.lugar.name}</h2><p className="regiao">{[clima.lugar.admin1, clima.lugar.country].filter(Boolean).join(', ')}</p></div><span className="icone-clima">{clima.atual.temperature_2m > 27 ? '☀️' : '🌤️'}</span></div>
          <div className="temperatura">{Math.round(clima.atual.temperature_2m)}<span>°C</span></div>
          <p className="condicao">{codigoClima[clima.atual.weather_code] || 'Condição atual'}</p>
          <div className="detalhes">
            <div><span>SENSAÇÃO</span><strong>{Math.round(clima.atual.apparent_temperature)}°C</strong></div>
            <div><span>UMIDADE</span><strong>{clima.atual.relative_humidity_2m}%</strong></div>
            <div><span>VENTO</span><strong>{Math.round(clima.atual.wind_speed_10m)} km/h</strong></div>
          </div>
        </section>
      )}
      {!clima && !erro && !carregando && <div className="dica">Experimente buscar por São Paulo, Rio de Janeiro ou outra cidade.</div>}
      <footer>Dados meteorológicos: Open-Meteo</footer>
    </main>
  );
}
