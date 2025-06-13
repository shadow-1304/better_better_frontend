import React from 'react';
import { MessageCircle, History, Settings, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  
  const sidebarBg = theme === 'dark' 
    ? 'bg-gradient-to-b from-gray-900 via-teal-900 to-gray-900' 
    : 'bg-gradient-to-b from-teal-50 via-teal-100 to-teal-50';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const logoColor = theme === 'dark' ? 'text-teal-400' : 'text-teal-600';

  const menuItems = [
    { icon: MessageCircle, label: 'Chat', active: true },
    { icon: History, label: 'History', active: false },
    { icon: Settings, label: 'Settings', active: false },
    { icon: LogOut, label: 'Logout', active: false },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <div className={`
        sidebar fixed md:static top-0 left-0 h-full w-64 
        ${sidebarBg} border-r transition-theme z-50
        ${theme === 'dark' ? 'border-teal-800' : 'border-teal-200'}
        ${isOpen ? 'open' : ''}
      `}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${theme === 'dark' ? 'bg-teal-400' : 'bg-teal-600'}
              shadow-lg
            `}>
              <div className="w-5 h-5 rounded-full bg-white opacity-90"></div>
            </div>
            <h1 className={`text-xl font-bold ${logoColor}`}>
              LineoMatic AI
            </h1>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`
                    sidebar-item ${theme}
                    ${textColor}
                    ${item.active ? 
                      theme === 'dark' 
                        ? 'bg-teal-400 bg-opacity-20 text-teal-400 border-l-4 border-teal-400' 
                        : 'bg-teal-600 bg-opacity-20 text-teal-600 border-l-4 border-teal-600'
                      : ''
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
              );
            })}
          </nav>

          <div className={`
            mt-8 p-4 rounded-lg
            ${theme === 'dark' ? 'bg-gray-800 border border-teal-800' : 'bg-white border border-teal-200'}
          `}>
            <h3 className={`text-sm font-semibold mb-2 ${logoColor}`}>
              Quick Stats
            </h3>
            <div className="space-y-2 text-xs">
              <div className={`flex justify-between ${textColor}`}>
                <span>Conversations</span>
                <span className={logoColor}>24</span>
              </div>
              <div className={`flex justify-between ${textColor}`}>
                <span>Messages</span>
                <span className={logoColor}>156</span>
              </div>
              <div className={`flex justify-between ${textColor}`}>
                <span>Active Time</span>
                <span className={logoColor}>2.5h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;