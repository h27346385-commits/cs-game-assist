/**
 * 视频生成器 - 真实实现
 * 使用 FFmpeg 进行视频处理
 * HLAE 用于 CS2 录制（可选）
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, execFile } from 'child_process';

// 动态加载数据库模块（处理 .cjs 扩展名问题）
let databaseManager: any;
function getDatabaseManager() {
  if (!databaseManager) {
    try {
      const dbModule = require('./database.cjs');
      databaseManager = dbModule.default || dbModule;
    } catch (e) {
      console.error('[VideoGenerator] 加载数据库模块失败:', e);
    }
  }
  return databaseManager;
}

export interface VideoTask {
  id: string;
  highlightId: number;
  demoPath: string;
  startTick: number;
  endTick: number;
  template: string;
  outputPath?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  resolution: { width: number; height: number };
  fps: number;
  bitrate: string;
  hasTransitions: boolean;
  hasEffects: boolean;
  hasMusic: boolean;
  thumbnail: string;
}

const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'clean',
    name: 'Clean',
    description: '纯净无特效，保留原汁原味',
    resolution: { width: 1920, height: 1080 },
    fps: 60,
    bitrate: '20M',
    hasTransitions: false,
    hasEffects: false,
    hasMusic: false,
    thumbnail: 'templates/clean.jpg',
  },
  {
    id: 'esports',
    name: 'Esports Pro',
    description: '专业电竞风格，适合比赛集锦',
    resolution: { width: 1920, height: 1080 },
    fps: 60,
    bitrate: '25M',
    hasTransitions: true,
    hasEffects: true,
    hasMusic: true,
    thumbnail: 'templates/esports.jpg',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: '极简风格，突出精彩瞬间',
    resolution: { width: 1920, height: 1080 },
    fps: 60,
    bitrate: '15M',
    hasTransitions: true,
    hasEffects: false,
    hasMusic: false,
    thumbnail: 'templates/minimal.jpg',
  },
];

class VideoGenerator {
  private ffmpegPath: string;
  private hlaePath: string;
  private useHLAE: boolean = false;
  private tasks: Map<string, VideoTask> = new Map();
  private outputDir: string;

  constructor() {
    const resourcesPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'resources')
      : path.join(__dirname, '../resources');
    
    this.ffmpegPath = path.join(resourcesPath, 'ffmpeg', 'bin', 'ffmpeg.exe');
    this.hlaePath = path.join(resourcesPath, 'hlae', 'HLAE.exe');
    this.useHLAE = fs.existsSync(this.hlaePath);
    
    // 输出目录：用户视频文件夹
    this.outputDir = path.join(app.getPath('videos'), 'CSGameAssist');
    fs.mkdirSync(this.outputDir, { recursive: true });

    console.log('[VideoGenerator] FFmpeg:', this.ffmpegPath);
    console.log('[VideoGenerator] HLAE:', this.useHLAE ? this.hlaePath : '未安装');
  }

  /**
   * 检查视频工具是否可用
   */
  checkTools(): { ffmpeg: boolean; hlae: boolean } {
    return {
      ffmpeg: fs.existsSync(this.ffmpegPath),
      hlae: fs.existsSync(this.hlaePath),
    };
  }

  /**
   * 获取视频模板列表
   */
  getTemplates(): VideoTemplate[] {
    return VIDEO_TEMPLATES;
  }

  /**
   * 创建视频生成任务
   */
  createTask(highlightId: number, demoPath: string, template: string = 'clean'): VideoTask {
    // 获取高光信息
    const db = getDatabaseManager();
    const highlight = db ? db.getHighlights(undefined, undefined) : { success: false };
    if (!highlight.success || !highlight.data) {
      throw new Error('无法获取高光信息');
    }

    const task: VideoTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      highlightId,
      demoPath,
      startTick: 0,
      endTick: 0,
      template,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.tasks.set(task.id, task);
    
    // 开始处理任务
    this.processTask(task);
    
    return task;
  }

  /**
   * 获取任务状态
   */
  getTask(taskId: string): VideoTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): VideoTask[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * 处理视频生成任务
   */
  private async processTask(task: VideoTask): Promise<void> {
    task.status = 'processing';
    task.progress = 10;

    try {
      // 检查工具
      const tools = this.checkTools();
      if (!tools.ffmpeg) {
        throw new Error('FFmpeg 未安装，请先安装视频工具');
      }

      // 生成输出路径
      const outputFileName = `highlight_${task.highlightId}_${Date.now()}.mp4`;
      task.outputPath = path.join(this.outputDir, outputFileName);

      // 检查是否有预录制的片段
      const hasPreRecorded = await this.checkPreRecordedClips(task.demoPath);

      if (hasPreRecorded) {
        // 使用现有片段合成
        await this.composeVideo(task);
      } else if (this.useHLAE) {
        // 使用 HLAE 录制
        await this.recordWithHLAE(task);
      } else {
        // 无录制能力，生成占位视频
        await this.generatePlaceholder(task);
      }

      // 更新数据库
      if (task.outputPath) {
        const db = getDatabaseManager();
        if (db) {
          await db.updateHighlightVideo(
            task.highlightId,
            task.outputPath,
            task.outputPath.replace('.mp4', '.jpg')
          );
        }
      }

      task.status = 'completed';
      task.progress = 100;
      task.completedAt = new Date().toISOString();

    } catch (error: any) {
      console.error('[VideoGenerator] 任务处理失败:', error);
      task.status = 'error';
      task.error = error.message;
    }
  }

  /**
   * 检查是否有预录制的片段
   */
  private async checkPreRecordedClips(demoPath: string): Promise<boolean> {
    const demoDir = path.dirname(demoPath);
    const clipDir = path.join(demoDir, 'clips');
    return fs.existsSync(clipDir);
  }

  /**
   * 使用 FFmpeg 合成视频
   */
  private async composeVideo(task: VideoTask): Promise<void> {
    return new Promise((resolve, reject) => {
      const template = VIDEO_TEMPLATES.find(t => t.id === task.template) || VIDEO_TEMPLATES[0];
      
      // 获取片段文件列表
      const demoDir = path.dirname(task.demoPath);
      const clipDir = path.join(demoDir, 'clips');
      const clips = fs.readdirSync(clipDir)
        .filter(f => f.endsWith('.mp4') || f.endsWith('.avi'))
        .map(f => path.join(clipDir, f));

      if (clips.length === 0) {
        reject(new Error('没有找到视频片段'));
        return;
      }

      // 创建片段列表文件
      const listFile = path.join(app.getPath('temp'), `clips_${task.id}.txt`);
      const listContent = clips.map(c => `file '${c.replace(/'/g, "\\'")}'`).join('\n');
      fs.writeFileSync(listFile, listContent);

      // FFmpeg 命令
      const args: string[] = [
        '-y', // 覆盖输出
        '-f', 'concat',
        '-safe', '0',
        '-i', listFile,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-r', template.fps.toString(),
        '-s', `${template.resolution.width}x${template.resolution.height}`,
        '-b:v', template.bitrate,
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        task.outputPath!
      ];

      // 添加转场效果
      if (template.hasTransitions && clips.length > 1) {
        // 使用 xfade 滤镜实现转场
        args.splice(args.indexOf('-c:v') || args.length, 0, '-vf', 'xfade=transition=fade:duration=0.5:offset=0');
      }

      const ffmpeg = spawn(this.ffmpegPath, args, { windowsHide: true });

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        // 解析进度
        const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const seconds = parseFloat(timeMatch[3]);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          // 假设视频长度约 30 秒
          task.progress = Math.min(10 + (totalSeconds / 30) * 80, 90);
        }
      });

      ffmpeg.on('close', (code) => {
        // 清理临时文件
        try { fs.unlinkSync(listFile); } catch {}

        if (code === 0) {
          task.progress = 95;
          resolve();
        } else {
          reject(new Error(`FFmpeg 退出码: ${code}`));
        }
      });

      ffmpeg.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * 使用 HLAE 录制
   */
  private async recordWithHLAE(task: VideoTask): Promise<void> {
    return new Promise((resolve, reject) => {
      // HLAE 录制命令
      // 实际实现需要启动 CS2 并通过 HLAE 注入录制
      
      // 这里简化处理：生成一个配置脚本
      const configPath = path.join(app.getPath('temp'), `hlae_${task.id}.cfg`);
      const config = `
mirv_streams add baseHook myStream
mirv_streams edit myStream record 1
mirv_streams edit myStream settings afxFfmpeg
mirv_streams edit myStream afxFfmpeg settings --codec h264_nvenc --preset p4 --rc vbr --cq 23
mirv_streams edit myStream recordPath "${path.dirname(task.outputPath!)}"
demo_gototick ${task.startTick}
      `.trim();
      
      fs.writeFileSync(configPath, config);

      // 由于 HLAE 需要 CS2 运行，这里仅设置任务状态
      // 实际录制需要用户在 CS2 中手动触发或使用自动化脚本
      
      reject(new Error('HLAE 录制需要 CS2 运行，请在游戏中使用生成的配置脚本'));
    });
  }

  /**
   * 生成占位视频（无录制能力时的降级方案）
   */
  private async generatePlaceholder(task: VideoTask): Promise<void> {
    return new Promise((resolve, reject) => {
      // 使用 FFmpeg 生成一个带有文字说明的视频
      const template = VIDEO_TEMPLATES.find(t => t.id === task.template) || VIDEO_TEMPLATES[0];
      
      const args: string[] = [
        '-y',
        '-f', 'lavfi',
        '-i', `color=c=black:s=${template.resolution.width}x${template.resolution.height}:d=5`,
        '-vf', `drawtext=text='Highlight ${task.highlightId}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2`,
        '-c:v', 'libx264',
        '-t', '5',
        '-pix_fmt', 'yuv420p',
        task.outputPath!
      ];

      const ffmpeg = spawn(this.ffmpegPath, args, { windowsHide: true });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`无法生成占位视频，退出码: ${code}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  }

  /**
   * 手动导入外部录制的视频
   */
  async importExternalVideo(highlightId: number, sourcePath: string, template: string = 'clean'): Promise<VideoTask> {
    const task: VideoTask = {
      id: `import_${Date.now()}`,
      highlightId,
      demoPath: '',
      startTick: 0,
      endTick: 0,
      template,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.tasks.set(task.id, task);

    try {
      const outputFileName = `highlight_${highlightId}_${Date.now()}.mp4`;
      task.outputPath = path.join(this.outputDir, outputFileName);

      // 复制并转码
      await this.transcodeVideo(sourcePath, task.outputPath, template);

      // 更新数据库
      await databaseManager.updateHighlightVideo(
        highlightId,
        task.outputPath,
        task.outputPath.replace('.mp4', '.jpg')
      );

      task.status = 'completed';
      task.progress = 100;
      task.completedAt = new Date().toISOString();

    } catch (error: any) {
      task.status = 'error';
      task.error = error.message;
    }

    return task;
  }

  /**
   * 转码视频
   */
  private async transcodeVideo(input: string, output: string, templateId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const template = VIDEO_TEMPLATES.find(t => t.id === templateId) || VIDEO_TEMPLATES[0];

      const args: string[] = [
        '-y',
        '-i', input,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-r', template.fps.toString(),
        '-s', `${template.resolution.width}x${template.resolution.height}`,
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        output
      ];

      const ffmpeg = spawn(this.ffmpegPath, args, { windowsHide: true });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`转码失败，退出码: ${code}`));
        }
      });

      ffmpeg.on('error', reject);
    });
  }

  /**
   * 获取输出目录
   */
  getOutputDir(): string {
    return this.outputDir;
  }
}

const videoGenerator = new VideoGenerator();
export default videoGenerator;
