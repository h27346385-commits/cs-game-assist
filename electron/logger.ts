/**
 * 日志系统 - 支持文件日志和控制台输出
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

class Logger {
  private logFile: string = '';
  private initialized: boolean = false;
  private buffer: string[] = [];

  constructor() {
    // 只设置控制台日志，文件日志延迟初始化
    console.log('[Logger] 初始化中...');
  }

  private ensureInitialized() {
    if (this.initialized) return;
    
    try {
      // 检查 app 是否可用
      if (!app || !app.getPath) {
        return; // 还不能初始化，使用缓冲区
      }
      
      const logDir = path.join(app.getPath('userData'), 'logs');
      this.logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
      
      fs.mkdirSync(logDir, { recursive: true });
      this.initialized = true;
      
      // 刷新缓冲区
      if (this.buffer.length > 0) {
        for (const line of this.buffer) {
          fs.appendFileSync(this.logFile, line + '\n');
        }
        this.buffer = [];
      }
    } catch (e) {
      // 初始化失败，继续使用缓冲区
    }
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const argsStr = args.length > 0 ? ' ' + args.map(a => {
      if (typeof a === 'object') {
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      }
      return String(a);
    }).join(' ') : '';
    return `[${timestamp}] [${level}] ${message}${argsStr}`;
  }

  private write(formattedMessage: string) {
    // 尝试初始化
    this.ensureInitialized();
    
    // 如果已初始化，写入文件
    if (this.initialized && this.logFile) {
      try {
        fs.appendFileSync(this.logFile, formattedMessage + '\n');
      } catch (e) {
        // 写入失败，加入缓冲区
        this.buffer.push(formattedMessage);
      }
    } else {
      // 未初始化，加入缓冲区
      this.buffer.push(formattedMessage);
    }
  }

  debug(message: string, ...args: any[]) {
    const formatted = this.formatMessage('DEBUG', message, ...args);
    console.debug(formatted);
    this.write(formatted);
  }

  info(message: string, ...args: any[]) {
    const formatted = this.formatMessage('INFO', message, ...args);
    console.log(formatted);
    this.write(formatted);
  }

  warn(message: string, ...args: any[]) {
    const formatted = this.formatMessage('WARN', message, ...args);
    console.warn(formatted);
    this.write(formatted);
  }

  error(message: string, ...args: any[]) {
    const formatted = this.formatMessage('ERROR', message, ...args);
    console.error(formatted);
    this.write(formatted);
  }

  getLogPath(): string {
    this.ensureInitialized();
    return this.logFile;
  }

  getRecentLogs(lines: number = 100): string[] {
    this.ensureInitialized();
    if (!this.logFile || !fs.existsSync(this.logFile)) {
      return this.buffer.slice(-lines);
    }
    
    try {
      const content = fs.readFileSync(this.logFile, 'utf-8');
      const allLines = content.split('\n').filter(line => line.trim());
      return allLines.slice(-lines);
    } catch (e) {
      return this.buffer.slice(-lines);
    }
  }
}

const logger = new Logger();

export { logger };
export default logger;
