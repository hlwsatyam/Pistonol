import BackgroundTheme from '../assets/img/ThemeBackground.png';
import Logo from '../assets/img/pistonol.jpg';
import tick from '../assets/img/tick.png';
import ThemeBackground from '../assets/img/ThemeBackground.png';
const themeColor = ['#FFA500', '#FF0000', '#0000FF'];
const background = 'blue';

const startDirectionTheme = {x: 0, y: 0};
const endDirectionTheme = {x: 1, y: 0};



const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  return new Date(isoDate).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};











const color = 'white';
export {BackgroundTheme,  ThemeBackground,   formatDate,  tick,   Logo,startDirectionTheme , endDirectionTheme ,   color, background, themeColor};
