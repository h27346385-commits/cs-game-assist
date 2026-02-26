; CS游戏助手安装脚本
; 使用 Inno Setup 6 创建专业安装程序

#define MyAppName "CS游戏助手"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "CS Game Assist Team"
#define MyAppURL "https://csgameassist.com"
#define MyAppExeName "CS游戏助手.exe"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/support
AppUpdatesURL={#MyAppURL}/updates
DefaultDirName={autopf}\CSGameAssist
DisableProgramGroupPage=yes
LicenseFile=..
OutputDir=..\release
OutputBaseFilename=CS游戏助手-{#MyAppVersion}-Setup
SetupIconFile=..
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
UninstallDisplayName={#MyAppName}
UninstallDisplayIcon={app}\{#MyAppExeName}
; 需要管理员权限以写入 Program Files
PrivilegesRequired=admin
; 支持 64 位 Windows
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
; 最小 Windows 版本 (Windows 10)
MinVersion=10.0

[Languages]
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

[Files]
; 主程序文件
Source: "..\release\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; 开始菜单
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
; 桌面快捷方式
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
; 快速启动
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
; 安装完成后可选择启动程序
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; 卸载时清理用户数据（可选）
Type: filesandordirs; Name: "{localappdata}\cs-game-assist"

[Code]
// 安装前检查系统要求
function InitializeSetup(): Boolean;
begin
  Result := true;
  
  // 检查 Windows 版本
  if not IsWindows10OrNewer then
  begin
    MsgBox('CS游戏助手需要 Windows 10 或更高版本。', mbError, MB_OK);
    Result := false;
  end;
end;

// 安装完成后执行
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // 创建 .dem 文件关联
    RegWriteStringValue(HKCR, '.dem\OpenWithProgids', 'CSGameAssist', '');
    RegWriteStringValue(HKCR, 'CSGameAssist\shell\open\command', '', ExpandConstant('"{app}\{#MyAppExeName}" "%1"'));
    RegWriteStringValue(HKCR, 'CSGameAssist', '', 'CS2 Demo 文件');
  end;
end;

// 卸载时清理注册表
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
  begin
    RegDeleteKeyIncludingSubkeys(HKCR, 'CSGameAssist');
    RegDeleteKeyIncludingSubkeys(HKCR, '.dem\OpenWithProgids\CSGameAssist');
  end;
end;
