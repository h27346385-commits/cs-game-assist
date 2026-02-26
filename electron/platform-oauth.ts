/**
 * 平台 OAuth 授权管理
 * 支持完美世界、5E、Faceit、Steam 平台
 */

import { BrowserWindow } from 'electron';
import * as path from 'path';

// 平台配置
const PLATFORMS = {
  perfect: {
    name: '完美世界竞技平台',
    loginUrl: 'https://passport.wanmei.com/sso/login?service=https://pvp.wanmei.com/',
    cookieDomain: '.wanmei.com',
  },
  '5e': {
    name: '5E对战平台',
    loginUrl: 'https://www.5eplay.com/login',
    cookieDomain: '.5eplay.com',
  },
  faceit: {
    name: 'FACEIT',
    loginUrl: 'https://www.faceit.com/en/login',
    cookieDomain: '.faceit.com',
  },
  steam: {
    name: 'Steam',
    loginUrl: 'https://store.steampowered.com/login',
    cookieDomain: '.steampowered.com',
  },
};

export type PlatformType = keyof typeof PLATFORMS;

// 授权信息接口
export interface OAuthCredentials {
  platform: PlatformType;
  cookies?: Record<string, string>;
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  userInfo?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

class PlatformOAuthService {
  private credentials: Map<PlatformType, OAuthCredentials> = new Map();
  private authWindows: Map<PlatformType, BrowserWindow> = new Map();

  /**
   * 检查平台是否已授权
   */
  isAuthorized(platform: PlatformType): boolean {
    return this.credentials.has(platform);
  }

  /**
   * 获取授权信息
   */
  getCredentials(platform: PlatformType): OAuthCredentials | undefined {
    return this.credentials.get(platform);
  }

  /**
   * 获取所有已授权平台
   */
  getAuthorizedPlatforms(): PlatformType[] {
    return Array.from(this.credentials.keys());
  }

  /**
   * 开始 OAuth 授权流程
   */
  async startAuth(platform: PlatformType): Promise<OAuthCredentials | null> {
    const config = PLATFORMS[platform];
    if (!config) {
      throw new Error(`不支持的平台: ${platform}`);
    }

    console.log(`[OAuth] 开始授权: ${config.name}`);

    return new Promise((resolve, reject) => {
      // 创建授权窗口
      const authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: `授权 - ${config.name}`,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      this.authWindows.set(platform, authWindow);

      // 加载登录页面
      authWindow.loadURL(config.loginUrl);

      // 监听导航事件
      authWindow.webContents.on('did-navigate', async (_, url) => {
        console.log(`[OAuth] 导航: ${url}`);

        // 检查是否登录成功（根据URL判断）
        if (this.isLoginSuccess(url, platform)) {
          try {
            // 获取 cookies
            const cookies = await authWindow.webContents.session.cookies.get({
              domain: config.cookieDomain,
            });

            const cookieMap: Record<string, string> = {};
            for (const cookie of cookies) {
              cookieMap[cookie.name] = cookie.value;
            }

            // 创建凭证
            const credentials: OAuthCredentials = {
              platform,
              cookies: cookieMap,
              userInfo: await this.fetchUserInfo(platform, cookieMap),
            };

            this.credentials.set(platform, credentials);

            // 关闭窗口
            authWindow.close();
            this.authWindows.delete(platform);

            console.log(`[OAuth] 授权成功: ${config.name}`);
            resolve(credentials);
          } catch (error) {
            reject(error);
          }
        }
      });

      // 窗口关闭
      authWindow.on('closed', () => {
        this.authWindows.delete(platform);
        if (!this.credentials.has(platform)) {
          resolve(null);
        }
      });
    });
  }

  /**
   * 解除授权
   */
  async revokeAuth(platform: PlatformType): Promise<boolean> {
    const config = PLATFORMS[platform];
    if (!config) return false;

    // 清除凭证
    this.credentials.delete(platform);

    // 清除 cookies
    const authWindow = this.authWindows.get(platform);
    if (authWindow) {
      await authWindow.webContents.session.clearStorageData({
        storages: ['cookies'],
      });
    }

    console.log(`[OAuth] 已解除授权: ${config.name}`);
    return true;
  }

  /**
   * 获取所有平台信息
   */
  getPlatforms() {
    return Object.entries(PLATFORMS).map(([key, config]) => ({
      id: key,
      name: config.name,
      authorized: this.isAuthorized(key as PlatformType),
    }));
  }

  // ============ 私有方法 ============

  private isLoginSuccess(url: string, platform: PlatformType): boolean {
    // 简化判断：登录成功后通常跳转到主页或特定页面
    const patterns: Record<PlatformType, RegExp[]> = {
      perfect: [/pvp\.wanmei\.com/],
      '5e': [/www\.5eplay\.com\/home/],
      faceit: [/www\.faceit\.com\/en\/(home|hub)/],
      steam: [/store\.steampowered\.com/],
    };

    const platformPatterns = patterns[platform];
    if (!platformPatterns) return false;

    return platformPatterns.some(pattern => pattern.test(url));
  }

  private async fetchUserInfo(platform: PlatformType, cookies: Record<string, string>): Promise<{ id: string; name: string; avatar?: string }> {
    // 模拟获取用户信息
    // TODO: 实现真实的 API 调用
    
    const mockInfo: Record<PlatformType, { id: string; name: string; avatar?: string }> = {
      perfect: { id: 'perfect_123', name: '完美玩家', avatar: '' },
      '5e': { id: '5e_456', name: '5E玩家', avatar: '' },
      faceit: { id: 'faceit_789', name: 'FaceitPlayer', avatar: '' },
      steam: { id: 'steam_000', name: 'SteamUser', avatar: '' },
    };

    return mockInfo[platform];
  }
}

export const platformOAuth = new PlatformOAuthService();
export default platformOAuth;
