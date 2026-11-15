export type Lang = 'en' | 'fr' | 'de' | 'ar';
export type Mode = 'dark' | 'light';

export interface Project { id: string; title: string; desc: string; tech: string[]; gh: string; live: string; hue: string; motif: string; }
export interface Job { role: string; company: string; date: string; desc: string; now: boolean; }
export interface Edu { date: string; title: string; desc: string; }
export interface SkillGroup { key: string; label: string; items: string[]; core: boolean; }
export interface Content {
  ui: Record<string, string>;
  type: string[];
  now: string;
  guide: Record<string, any>;
  skills: SkillGroup[];
  projects: Project[];
  jobs: Job[];
  edu: Edu[];
}

export const LINKS = {
  cv: 'https://drive.google.com/file/d/1ucq3uOuMHMxDRxRFfX7oy3XTGdMYhkS3/view?usp=drive_link',
  email: 'ayoubrazali28@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ayoub-razali-507a791a8/',
  github: 'https://github.com/youbo28',
  youtube: 'https://www.youtube.com/@ayoubrazali2484',
};
