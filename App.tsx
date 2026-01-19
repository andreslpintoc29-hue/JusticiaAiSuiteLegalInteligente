
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import TutelaScreen from './components/TutelaScreen';
import HabeasCorpusScreen from './components/HabeasCorpusScreen';
import DesacatosScreen from './components/DesacatosScreen';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/tutela" replace />} />
          <Route path="/tutela" element={<TutelaScreen />} />
          <Route path="/habeas-corpus" element={<HabeasCorpusScreen />} />
          <Route path="/desacatos" element={<DesacatosScreen />} />
          <Route path="*" element={<Navigate to="/tutela" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
