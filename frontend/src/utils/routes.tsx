import { Home } from '../pages/Home';
import { Tutorials } from '../pages/Tutorials';
import { default as TutorialDetail } from '../pages/TutorialDetail';
import { About } from '../pages/About';
import { Tools } from '../pages/Tools';
import { Newest } from '../pages/Newest';
import { default as Countdown } from '../pages/Countdown';

export interface Route {
  path: string;
  component: React.ComponentType;
  label: string;
}

export const routes: Route[] = [
  { path: '/', component: Home, label: '首页' },
  { path: '/tutorials', component: Tutorials, label: '教程' },
  { path: '/tutorial/:file', component: TutorialDetail, label: '教程详情' },
  { path: '/tools', component: Tools, label: '工具' },
  { path: '/about', component: About, label: '关于' },
  { path: '/newest', component: Newest, label: '最新' },
  { path: '/countdown', component: Countdown, label: '高考倒计时' },
];
