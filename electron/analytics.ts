/**
 * 埋点统计系统
 * 收集用户行为数据
 */

import { app } from 'electron';
import * as os from 'os';

// 事件类型
export type EventType = 
  | 'app_launch'
  | 'app_close'
  | 'page_view'
  | 'feature_use'
  | 'demo_parse'
  | 'video_generate'
  | 'error';

// 事件数据
export interface AnalyticsEvent {
  id: string;
  type: EventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  data?: Record<string, any>;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId: string;
  private isEnabled = true;

  constructor() {
    this.sessionId = this.generateId();
    this.userId = this.getOrCreateUserId();
  }

  /**
   * 追踪事件
   */
  track(eventType: EventType, data?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      id: this.generateId(),
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      data: {
        ...data,
        appVersion: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
      },
    };

    this.events.push(event);
    console.log('[Analytics]', eventType, data);

    // 批量上报
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  /**
   * 页面浏览
   */
  pageView(pageName: string, pageData?: Record<string, any>): void {
    this.track('page_view', { page: pageName, ...pageData });
  }

  /**
   * 功能使用
   */
  featureUse(featureName: string, featureData?: Record<string, any>): void {
    this.track('feature_use', { feature: featureName, ...featureData });
  }

  /**
   * 错误追踪
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  /**
   * 上报数据
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // TODO: 实现真实的数据上报
      console.log('[Analytics] 上报数据:', eventsToSend.length, '条事件');
      
      // 模拟上报
      // await fetch('https://api.csgame.assist/analytics', {
      //   method: 'POST',
      //   body: JSON.stringify(eventsToSend),
      // });

    } catch (error) {
      console.error('[Analytics] 上报失败:', error);
      // 重新放回队列
      this.events.unshift(...eventsToSend);
    }
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    return {
      platform: process.platform,
      arch: process.arch,
      cpu: os.cpus()[0]?.model || 'unknown',
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      appVersion: app.getVersion(),
    };
  }

  /**
   * 启用/禁用统计
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log('[Analytics] 统计状态:', enabled ? '启用' : '禁用');
  }

  // ============ 私有方法 ============

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  private getOrCreateUserId(): string {
    // TODO: 从本地存储读取或生成用户ID
    return 'user_' + this.generateId();
  }
}

export const analytics = new AnalyticsService();
export default analytics;
