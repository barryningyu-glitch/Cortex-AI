import React from 'react';
import { useTheme } from './ThemeProvider';

const ThemeToggle = ({ className = '' }) => {
  const { getCurrentTheme, toggleTheme } = useTheme();
  const currentTheme = getCurrentTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      title={`当前: ${currentTheme.name}，点击切换`}
      aria-label={`当前: ${currentTheme.name}，点击切换`}
    >
      <span className="theme-icon">
        {currentTheme.icon}
      </span>
      <span className="theme-text">
        {currentTheme.name}
      </span>
    </button>
  );
};

export default ThemeToggle;

