import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 从localStorage读取保存的主题，默认为深色
    return localStorage.getItem('theme') || 'dark';
  });

  const themes = [
    { id: 'dark', name: '深色模式', icon: '🌙' },
    { id: 'light', name: '浅色模式', icon: '☀️' },
    { id: 'gundam-light', name: '高达白蓝红', icon: '🤖' }
  ];

  useEffect(() => {
    // 保存主题到localStorage
    localStorage.setItem('theme', theme);
    
    // 更新document的data-theme属性
    document.documentElement.setAttribute('data-theme', theme);
    
    // 更新body的class
    const themeClasses = {
      'dark': 'dark-theme',
      'light': 'light-theme',
      'gundam-light': 'gundam-light-theme'
    };
    document.body.className = themeClasses[theme] || 'dark-theme';
  }, [theme]);

  const toggleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].id);
  };

  const setSpecificTheme = (themeId) => {
    setTheme(themeId);
  };

  const getCurrentTheme = () => {
    return themes.find(t => t.id === theme) || themes[0];
  };

  const value = {
    theme,
    themes,
    toggleTheme,
    setSpecificTheme,
    getCurrentTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isGundam: theme === 'gundam-light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

