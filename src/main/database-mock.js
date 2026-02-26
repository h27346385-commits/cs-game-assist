"use strict";
/**
 * 内存数据库 - 演示版
 * 用于快速开发和演示，数据存储在内存中
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDB = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// 数据存储
const memoryDB = {
    matches: [],
    rounds: [],
    kills: [],
    playerStats: [],
    highlights: [],
    userSettings: new Map(),
};
// 持久化文件路径
function getDataPath() {
    const userData = electron_1.app.getPath('userData');
    return path.join(userData, 'data.json');
}
class MockDatabaseService {
    constructor() {
        this.initialized = false;
    }
    /**
     * 初始化数据库
     */
    async initialize() {
        console.log('[MockDB] 初始化内存数据库...');
        // 尝试从文件加载数据
        this.loadFromFile();
        this.initialized = true;
        console.log('[MockDB] 数据库初始化完成');
        console.log(`[MockDB] 当前数据: ${memoryDB.matches.length} 场比赛, ${memoryDB.highlights.length} 个高光`);
        return true;
    }
    /**
     * 检查状态
     */
    async checkStatus() {
        return {
            initialized: this.initialized,
            running: this.initialized,
        };
    }
    /**
     * 启动服务（内存数据库无需启动）
     */
    async start() {
        return true;
    }
    /**
     * 停止服务（保存数据到文件）
     */
    async stop() {
        this.saveToFile();
        return true;
    }
    /**
     * 运行迁移（内存数据库无需迁移）
     */
    async runMigrations() {
        return true;
    }
    // ============ CRUD 操作 ============
    /**
     * 插入数据
     */
    insert(table, data) {
        const id = this.generateId();
        const record = { ...data, id, created_at: new Date().toISOString() };
        if (Array.isArray(memoryDB[table])) {
            memoryDB[table].push(record);
        }
        this.saveToFile();
        return record;
    }
    /**
     * 查询所有
     */
    select(table, where) {
        const data = memoryDB[table];
        if (!Array.isArray(data))
            return [];
        if (!where)
            return [...data];
        return data.filter(item => {
            return Object.entries(where).every(([key, value]) => item[key] === value);
        });
    }
    /**
     * 查询单条
     */
    selectOne(table, where) {
        const results = this.select(table, where);
        return results.length > 0 ? results[0] : null;
    }
    /**
     * 更新数据
     */
    update(table, where, data) {
        const items = memoryDB[table];
        const updated = [];
        for (const item of items) {
            if (Object.entries(where).every(([key, value]) => item[key] === value)) {
                Object.assign(item, data, { updated_at: new Date().toISOString() });
                updated.push(item);
            }
        }
        this.saveToFile();
        return updated;
    }
    /**
     * 删除数据
     */
    delete(table, where) {
        const items = memoryDB[table];
        const initialLength = items.length;
        const filtered = items.filter(item => {
            return !Object.entries(where).every(([key, value]) => item[key] === value);
        });
        memoryDB[table] = filtered;
        const deleted = initialLength - filtered.length;
        if (deleted > 0)
            this.saveToFile();
        return deleted;
    }
    /**
     * 获取统计
     */
    getStats() {
        return {
            totalMatches: memoryDB.matches.length,
            totalHighlights: memoryDB.highlights.length,
            totalKills: memoryDB.matches.reduce((sum, m) => sum + (m.kills || 0), 0),
        };
    }
    // ============ 业务方法 ============
    saveMatch(matchData) {
        return this.insert('matches', matchData);
    }
    getMatches(limit) {
        const matches = this.select('matches');
        return limit ? matches.slice(0, limit) : matches;
    }
    getMatchById(id) {
        return this.selectOne('matches', { id });
    }
    saveHighlight(highlight) {
        return this.insert('highlights', highlight);
    }
    getHighlights(limit) {
        const highlights = this.select('highlights');
        return limit ? highlights.slice(0, limit) : highlights;
    }
    // ============ 私有方法 ============
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    loadFromFile() {
        try {
            const dataPath = getDataPath();
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                Object.assign(memoryDB, data);
                console.log('[MockDB] 从文件加载数据');
            }
        }
        catch (error) {
            console.error('[MockDB] 加载数据失败:', error);
        }
    }
    saveToFile() {
        try {
            const dataPath = getDataPath();
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
            fs.writeFileSync(dataPath, JSON.stringify({
                matches: memoryDB.matches,
                rounds: memoryDB.rounds,
                kills: memoryDB.kills,
                playerStats: memoryDB.playerStats,
                highlights: memoryDB.highlights,
            }, null, 2));
        }
        catch (error) {
            console.error('[MockDB] 保存数据失败:', error);
        }
    }
}
exports.mockDB = new MockDatabaseService();
exports.default = exports.mockDB;
//# sourceMappingURL=database-mock.js.map