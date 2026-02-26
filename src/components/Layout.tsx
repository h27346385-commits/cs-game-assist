import { useState } from 'react';
import { 
  Home, 
  Trophy, 
  Video, 
  Settings, 
  Bell, 
  Shield,
  Target,
  Map,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { 
    id: 'home', 
    label: '首页', 
    icon: <Home size={20} />,
    children: [
      { id: 'profile', label: '个人主页', icon: <User size={16} /> },
      { id: 'stats', label: '个人数据', icon: <Target size={16} /> },
      { id: 'heatmap', label: '热力地图', icon: <Map size={16} /> },
      { id: 'idol', label: '偶像模板', icon: <Shield size={16} /> },
    ]
  },
  { 
    id: 'highlights', 
    label: '视频管理', 
    icon: <Video size={20} />,
    children: [
      { id: 'highlights-list', label: '高光列表', icon: <Video size={16} /> },
      { id: 'matches', label: '比赛历史', icon: <Trophy size={16} /> },
      { id: 'generating', label: '生成中', icon: <div className="w-4 h-4 rounded-full border-2 border-current" /> },
    ]
  },
  { id: 'pro-players', label: '职业选手', icon: <Trophy size={20} /> },
  { id: 'armory', label: '军需库', icon: <Shield size={20} /> },
];

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['home', 'highlights']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (itemId: string) => activeTab === itemId;
  const isChildActive = (item: NavItem) => item.children?.some(child => child.id === activeTab);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            <span className="font-bold text-lg text-gray-900">CS游戏助手</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.children) {
                    toggleMenu(item.id);
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors
                  ${(isActive(item.id) || isChildActive(item)) 
                    ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.children && (
                  <svg 
                    className={`w-4 h-4 transition-transform ${expandedMenus.includes(item.id) ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              
              {/* Submenu */}
              {item.children && expandedMenus.includes(item.id) && (
                <div className="bg-gray-50 py-1">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => onTabChange(child.id)}
                      className={`w-full flex items-center gap-3 px-8 py-2 text-sm transition-colors
                        ${isActive(child.id) 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <Settings size={18} />
            <span>设置</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Breadcrumb or title could go here */}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
