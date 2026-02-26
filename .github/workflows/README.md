# GitHub Actions 工作流说明

本项目配置了以下自动化工作流：

## 1. Build and Test (`build.yml`)

**触发条件：**
- Push 到 main/master/develop 分支
- Pull Request 到 main/master/develop 分支

**任务：**
| 任务 | 说明 |
|------|------|
| `lint-and-typecheck` | ESLint 代码检查 + TypeScript 类型检查 |
| `build-web` | 构建前端并上传产物 |
| `build-windows` | 构建 Windows 便携版应用 |
| `test` | 多平台（Ubuntu/Windows）和多版本（Node 18/20/22）构建测试 |

## 2. Release (`release.yml`)

**触发条件：**
- 推送版本标签（如 `v1.0.0`）

**任务：**
| 任务 | 说明 |
|------|------|
| `create-release` | 创建 GitHub Release（草稿状态） |
| `build-windows-portable` | 构建便携版并上传到 Release |
| `build-windows-installer` | 构建安装包并上传到 Release |

**使用方法：**
```bash
# 1. 更新 package.json 中的版本号
# 2. 提交更改
git add .
git commit -m "Release v1.0.0"

# 3. 创建标签并推送
git tag v1.0.0
git push origin v1.0.0
```

推送标签后，工作流会自动构建并创建 Release。

## 3. Scheduled Maintenance (`scheduled.yml`)

**触发条件：**
- 每周一凌晨 2 点自动运行
- 手动触发（workflow_dispatch）

**任务：**
| 任务 | 说明 |
|------|------|
| `security-audit` | 运行 `npm audit` 检查安全漏洞 |
| `outdated-deps` | 检查过时的依赖包 |
| `build-health` | 验证多平台构建健康度 |

## 环境变量配置

无需额外配置，GitHub Actions 会自动提供 `GITHUB_TOKEN`。

## 查看运行结果

1. 进入 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择对应的工作流查看详细日志

## 常见问题

### Q: 构建失败怎么办？
A: 检查 Actions 日志中的错误信息，常见原因：
- 依赖安装失败 → 检查 package.json 和 package-lock.json
- 类型错误 → 运行 `npx tsc --noEmit` 本地检查
- ESLint 错误 → 运行 `npm run lint` 本地修复

### Q: 如何跳过 CI？
A: 在 commit message 中添加 `[skip ci]` 或 `[ci skip]`：
```bash
git commit -m "Update docs [skip ci]"
```

### Q: 如何手动触发工作流？
A: 进入 Actions 页面，选择对应工作流，点击 **Run workflow** 按钮。
