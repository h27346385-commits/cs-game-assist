import { useState } from 'react';
import { Layout } from './components/Layout';
import { Profile } from './pages/Profile';
import { Stats } from './pages/Stats';
import { Heatmap } from './pages/Heatmap';
import { IdolTemplate } from './pages/IdolTemplate';
import { ProPlayers } from './pages/ProPlayers';
import { Matches } from './pages/Matches';
import { Highlights } from './pages/Highlights';
import { Generating } from './pages/Generating';

function App() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'stats':
        return <Stats />;
      case 'heatmap':
        return <Heatmap />;
      case 'idol':
        return <IdolTemplate />;
      case 'pro-players':
        return <ProPlayers />;
      case 'matches':
        return <Matches />;
      case 'highlights-list':
        return <Highlights />;
      case 'generating':
        return <Generating />;
      default:
        return <Profile />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
