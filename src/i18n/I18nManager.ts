import { GenLayerMilestone, HistoryLocalizedText } from '../data/genlayerHistory';
import { SimulationProgressMilestone } from '../data/cryptoMarketCaps';
import {
  LOCALE_OPTIONS,
  LOCALES,
  LocaleOption,
  LocaleStrings,
  SupportedLocale
} from './locales';

const LOCALE_STORAGE_KEY = 'mochi_sky_locale_v2';
const LOCALE_SELECTED_FLAG_KEY = 'mochi_sky_lang_selected_v2';

type LocaleChangeListener = (locale: SupportedLocale, strings: LocaleStrings) => void;

export class I18nManager {
  private static instance: I18nManager;
  private currentLocale: SupportedLocale = 'zh-CN';
  private listeners = new Set<LocaleChangeListener>();

  private constructor() {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as SupportedLocale | null;
    if (saved && LOCALES[saved]) {
      this.currentLocale = saved;
    } else {
      const browserLang = (navigator.language || '').toLowerCase();
      if (browserLang.startsWith('zh')) this.currentLocale = 'zh-CN';
      else if (browserLang.startsWith('ja')) this.currentLocale = 'ja';
      else if (browserLang.startsWith('ko')) this.currentLocale = 'ko';
      else if (browserLang.startsWith('es')) this.currentLocale = 'es';
      else this.currentLocale = 'en';
    }
    this.syncDocumentLang();
  }

  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  public hasSelectedLanguageFirstTime(): boolean {
    return localStorage.getItem(LOCALE_SELECTED_FLAG_KEY) === 'true';
  }

  public getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  public getLocaleOption(): LocaleOption {
    return (
      LOCALE_OPTIONS.find((opt) => opt.code === this.currentLocale) ||
      LOCALE_OPTIONS[0]
    );
  }

  public getStrings(): LocaleStrings {
    return LOCALES[this.currentLocale];
  }

  public setLocale(locale: SupportedLocale, markSelected: boolean = true): void {
    if (!LOCALES[locale]) return;
    this.currentLocale = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    if (markSelected) {
      localStorage.setItem(LOCALE_SELECTED_FLAG_KEY, 'true');
    }
    this.syncDocumentLang();
    const strings = this.getStrings();
    this.listeners.forEach((cb) => cb(locale, strings));
  }

  public onChange(listener: LocaleChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private syncDocumentLang(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = this.currentLocale;
      const opt = this.getLocaleOption();
      document.body.style.fontFamily = opt.fontFamily;
    }
  }

  public format(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) =>
      params[key] !== undefined ? String(params[key]) : '{' + key + '}'
    );
  }

  public getMilestoneText(milestone: GenLayerMilestone): {
    title: string;
    summary: string;
    note: string;
    dateKindLabel: string;
  } {
    const localized: HistoryLocalizedText =
      milestone.i18n[this.currentLocale] ||
      milestone.i18n.en ||
      milestone.i18n['zh-CN'];
    const strings = this.getStrings();
    const dateKindLabel =
      strings.dateKindLabels[milestone.dateKind] || milestone.dateKind;

    return {
      title: localized.title,
      summary: localized.summary,
      note: localized.note || milestone.note,
      dateKindLabel
    };
  }

  public getEarlySimMilestoneText(sim: SimulationProgressMilestone): {
    title: string;
    disclaimer: string;
  } {
    return sim.i18n[this.currentLocale] || sim.i18n.en;
  }

  public formatUSD(amount: number): string {
    const loc = this.currentLocale;
    if (loc === 'zh-CN') {
      if (amount >= 1e12) {
        return '$' + (amount / 1e12).toFixed(2) + 'T (' + (amount / 1e8).toFixed(0) + '亿)';
      }
      if (amount >= 1e9) {
        return '$' + (amount / 1e9).toFixed(2) + 'B (' + (amount / 1e8).toFixed(1) + '亿)';
      }
      return '$' + (amount / 1e6).toFixed(1) + 'M (' + (amount / 1e8).toFixed(2) + '亿)';
    }
    if (loc === 'ja') {
      if (amount >= 1e12) {
        return '$' + (amount / 1e12).toFixed(2) + 'T (' + (amount / 1e8).toFixed(0) + '億ドル)';
      }
      if (amount >= 1e9) {
        return '$' + (amount / 1e9).toFixed(2) + 'B (' + (amount / 1e8).toFixed(1) + '億ドル)';
      }
      return '$' + (amount / 1e6).toFixed(1) + 'M (' + (amount / 1e8).toFixed(2) + '億ドル)';
    }
    if (loc === 'ko') {
      if (amount >= 1e12) {
        return '$' + (amount / 1e12).toFixed(2) + 'T (' + (amount / 1e8).toFixed(0) + '억 달러)';
      }
      if (amount >= 1e9) {
        return '$' + (amount / 1e9).toFixed(2) + 'B (' + (amount / 1e8).toFixed(1) + '억 달러)';
      }
      return '$' + (amount / 1e6).toFixed(1) + 'M (' + (amount / 1e8).toFixed(2) + '억 달러)';
    }
    if (amount >= 1e12) {
      return '$' + (amount / 1e12).toFixed(2) + 'T';
    }
    if (amount >= 1e9) {
      return '$' + (amount / 1e9).toFixed(2) + 'B';
    }
    return '$' + (amount / 1e6).toFixed(1) + 'M';
  }

  public formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    const loc = this.currentLocale;
    if (loc === 'zh-CN' || loc === 'ja') {
      return mins + '分 ' + String(secs).padStart(2, '0') + '.' + ms + '秒';
    }
    if (loc === 'ko') {
      return mins + '분 ' + String(secs).padStart(2, '0') + '.' + ms + '초';
    }
    return mins + 'm ' + String(secs).padStart(2, '0') + '.' + ms + 's';
  }

  /**
   * Smart multi-language Canvas text wrapper supporting both CJK character wrapping
   * and space-separated Latin word wrapping (English/Spanish) with max-lines guard.
   */
  public wrapCanvasText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 4
  ): number {
    const isCJK = this.getLocaleOption().isCJK;
    const units = isCJK ? Array.from(text) : text.split(/(\s+)/);
    let line = '';
    let currentY = y;
    let linesDrawn = 0;

    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const testLine = line + unit;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line.trim().length > 0) {
        linesDrawn++;
        if (linesDrawn >= maxLines) {
          ctx.fillText(line.trimEnd() + '…', x, currentY);
          return currentY + lineHeight;
        }
        ctx.fillText(line.trimEnd(), x, currentY);
        line = unit.trimStart();
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line.trim().length > 0) {
      ctx.fillText(line.trimEnd(), x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  }
}

export const i18n = I18nManager.getInstance();
