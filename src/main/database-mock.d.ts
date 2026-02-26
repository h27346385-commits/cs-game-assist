/**
 * 内存数据库 - 演示版
 * 用于快速开发和演示，数据存储在内存中
 */
declare const memoryDB: {
    matches: any[];
    rounds: any[];
    kills: any[];
    playerStats: any[];
    highlights: any[];
    userSettings: Map<string, string>;
};
declare class MockDatabaseService {
    private initialized;
    /**
     * 初始化数据库
     */
    initialize(): Promise<boolean>;
    /**
     * 检查状态
     */
    checkStatus(): Promise<{
        initialized: boolean;
        running: boolean;
    }>;
    /**
     * 启动服务（内存数据库无需启动）
     */
    start(): Promise<boolean>;
    /**
     * 停止服务（保存数据到文件）
     */
    stop(): Promise<boolean>;
    /**
     * 运行迁移（内存数据库无需迁移）
     */
    runMigrations(): Promise<boolean>;
    /**
     * 插入数据
     */
    insert(table: keyof typeof memoryDB, data: any): any;
    /**
     * 查询所有
     */
    select(table: keyof typeof memoryDB, where?: Partial<any>): any[];
    /**
     * 查询单条
     */
    selectOne(table: keyof typeof memoryDB, where: Partial<any>): any | null;
    /**
     * 更新数据
     */
    update(table: keyof typeof memoryDB, where: Partial<any>, data: Partial<any>): any[];
    /**
     * 删除数据
     */
    delete(table: keyof typeof memoryDB, where: Partial<any>): number;
    /**
     * 获取统计
     */
    getStats(): any;
    saveMatch(matchData: any): any;
    getMatches(limit?: number): any[];
    getMatchById(id: string): any;
    saveHighlight(highlight: any): any;
    getHighlights(limit?: number): any[];
    private generateId;
    private loadFromFile;
    private saveToFile;
}
export declare const mockDB: MockDatabaseService;
export default mockDB;
//# sourceMappingURL=database-mock.d.ts.map