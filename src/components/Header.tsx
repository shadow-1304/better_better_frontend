import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  
  const headerBg = theme === 'dark' 
    ? 'bg-gradient-to-r from-gray-900 via-teal-900 to-gray-900' 
    : 'bg-gradient-to-r from-teal-50 via-teal-100 to-teal-50';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const logoColor = theme === 'dark' ? 'text-teal-400' : 'text-teal-600';

  return (
    <header className={`
      ${headerBg} border-b transition-theme
      ${theme === 'dark' ? 'border-teal-800' : 'border-teal-200'}
      px-6 py-4 flex items-center justify-between shadow-sm
    `}>
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className={`
            md:hidden p-2 rounded-lg transition-all duration-200
            ${theme === 'dark' 
              ? 'text-teal-400 hover:bg-teal-400 hover:bg-opacity-10' 
              : 'text-teal-600 hover:bg-teal-600 hover:bg-opacity-10'
            }
          `}
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center shadow-lg
            ${theme === 'dark' ? 'bg-teal-400' : 'bg-teal-600'}
          `}>
            <div className="w-5 h-5 rounded-full bg-white opacity-90"></div>
          </div>
          <div>
            <h1 className={`text-xl font-bold ${logoColor}`}>
              LineoMatic AI
            </h1>
            <p className={`text-xs opacity-70 ${textColor}`}>
              Intelligent Assistant
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className={`theme-toggle ${theme}`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center shadow-lg
            ${theme === 'dark' ? 'bg-gray-700 border-2 border-teal-400' : 'bg-gray-200 border-2 border-teal-600'}
          `}>
            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}`}>
              U
            </span>
          </div>
          <div className="hidden sm:block">
            <span className={`text-sm font-medium ${textColor}`}>
              User Name
            </span>
            <p className={`text-xs opacity-70 ${textColor}`}>
              Premium User
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;