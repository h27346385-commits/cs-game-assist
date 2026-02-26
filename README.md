# CS游戏助手 (CS Game Assist)

CS2 游戏数据分析与视频集锦生成工具 - 完全离线优先的 Windows 桌面应用

## 技术架构

### 核心栈
- **前端**: React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 3.4
- **桌面**: Electron 40.6.1
- **数据库**: SQLite (better-sqlite3) - 本地存储，无需配置
- **构建**: electron-builder (便携版 + Inno Setup 安装程序)

### 真实组件集成
1. **better-sqlite3**: 高性能本地数据库，存储比赛/玩家/高光数据
2. **FFmpeg**: 视频合成与转码（需要用户安装或自动下载）
3. **HLAE**: CS2 录制工具（可选，需用户安装）
4. **CSDA**: CS Demo 解析器（Go 二进制，可选）

## 功能特性

### Phase 0 - 基础工程 (已实现)
- [x] Electron 桌面应用框架
- [x] React 前端 UI (8 个页面)
- [x] SQLite 本地数据库
- [x] Demo 解析集成框架
- [x] 视频生成框架
- [x] IPC 通信桥接

### 核心页面
1. **首页** - 数据概览与快速操作
2. **数据统计** - 深度游戏数据分析
3. **热力图** - 击杀/死亡位置可视化
4. **我的偶像** - 关注职业选手数据
5. **职业选手** - 职业选手库与对比
6. **武器库** - 武器数据分析
7. **比赛列表** - Demo 管理与解析
8. **高光时刻** - 自动识别精彩镜头

## 快速开始

### 开发模式
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在另一个终端启动 Electron
npm run electron:dev
```

### 构建便携版
```bash
npm run electron:build:portable
# 输出: release/CS游戏助手-1.0.0-便携版.exe
```

### 构建安装程序
1. 安装 [Inno Setup 6](https://jrsoftware.org/isinfo.php)
2. 编译安装脚本:
   ```bash
   iscc build\installer.iss
   ```
3. 输出: `release/CS游戏助手-1.0.0-Setup.exe`

## 项目结构

```
cs-game-assist/
├── electron/              # Electron 主进程
│   ├── main.ts           # 主入口
│   ├── preload.ts        # 预加载脚本
│   ├── database.ts       # SQLite 数据库实现
│   ├── demo-parser.ts    # Demo 解析器
│   ├── video-generator.ts # 视频生成器
│   └── build.cjs         # 构建脚本
├── src/                   # React 前端
│   ├── pages/            # 8 个功能页面
│   ├── components/       # 共享组件
│   └── App.tsx           # 主应用
├── resources/             # 外部资源
│   ├── ffmpeg/           # FFmpeg 二进制
│   ├── hlae/             # HLAE 录制工具
│   └── csda/             # CSDA 解析器
├── build/                 # 构建配置
│   └── installer.iss     # Inno Setup 脚本
├── dist/                  # Vite 构建输出
├── dist-electron/         # Electron 编译输出
└── release/               # 最终发布包
```

## 数据库架构

SQLite 数据库包含以下表:

- **matches** - 比赛基础信息
- **player_stats** - 玩家统计数据
- **rounds** - 回合数据
- **kill_events** - 击杀事件
- **highlights** - 高光时刻
- **user_settings** - 用户设置

数据存储位置:
- 开发: `%APPDATA%/cs-game-assist/`
- 生产: 同开发位置

## 外部工具配置

### FFmpeg (必需)
1. 自动检测: 应用启动时检查 `resources/ffmpeg/bin/ffmpeg.exe`
2. 手动安装: 下载 [FFmpeg](https://ffmpeg.org/download.html) 并放入 resources/ffmpeg/
3. 自动下载: 首次启动时应用可自动下载

### HLAE (可选)
1. 下载 [HLAE](https://github.com/advancedfx/advancedfx/releases)
2. 解压到 `resources/hlae/`
3. 用于 CS2 游戏内录制

### CSDA (可选)
1. 编译或下载 CSDA (CS Demo Analyzer)
2. 放入 `resources/csda/csda.exe`
3. 提供深度 Demo 解析

## 离线优先设计

- 所有数据本地存储 (SQLite)
- 无需互联网连接即可使用核心功能
- 更新检查可选，不影响使用
- 首次启动自动初始化

## 发布

### 版本号
格式: `主版本.次版本.修订号`
- 主版本: 重大功能更新
- 次版本: 新功能添加
- 修订号: Bug 修复

### 构建流程
1. 更新 `package.json` 中的版本号
2. 运行测试
3. 构建便携版验证
4. 构建安装程序
5. 签名发布包

## 许可证

MIT License - 详见 LICENSE 文件

## 致谢

- [HLAE](https://advancedfx.org/) - CS2 录制工具
- [CSDA](https://github.com/esportal/csgodemoapi) - Demo 解析
- [FFmpeg](https://ffmpeg.org/) - 视频处理
