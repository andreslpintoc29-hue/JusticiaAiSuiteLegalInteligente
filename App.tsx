
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TutelaScreen from './components/TutelaScreen';
import HabeasCorpusScreen from './components/HabeasCorpusScreen';
import HabeasCorpusInteligenteScreen from './components/HabeasCorpusInteligenteScreen';
import DesacatosScreen from './components/DesacatosScreen';
import DesacatoInteligenteScreen from './components/DesacatoInteligenteScreen';
import CorteConstitucionalScreen from './components/CorteConstitucionalScreen';
import ApoyoJudicialScreen from './components/ApoyoJudicialScreen';
import TutelaIntegralScreen from './components/TutelaIntegralScreen';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/tutela" replace />} />
          <Route path="/tutela" element={<TutelaScreen />} />
          <Route path="/tutela-integral" element={<TutelaIntegralScreen />} />
          <Route path="/habeas-corpus" element={<HabeasCorpusScreen />} />
          <Route path="/habeas-corpus-inteligente" element={<HabeasCorpusInteligenteScreen />} />
          <Route path="/desacatos" element={<DesacatosScreen />} />
          <Route path="/desacato-inteligente" element={<DesacatoInteligenteScreen />} />
          <Route path="/corte-constitucional" element={<CorteConstitucionalScreen />} />
          <Route path="/apoyo-judicial" element={<ApoyoJudicialScreen />} />
          <Route path="*" element={<Navigate to="/tutela" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
