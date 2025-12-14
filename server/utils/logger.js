/**
 * 日志工具
 * @module logger
 */

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
}

class Logger {
    constructor(level = 'INFO') {
        this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO
    }

    /**
     * 格式化日志消息
     * @private
     * @param {string} level - 日志级别
     * @param {string} message - 消息内容
     * @param {Object} meta - 元数据
     * @returns {string} 格式化后的消息
     */
    _format(level, message, meta = {}) {
        const timestamp = new Date().toISOString()
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
        return `[${timestamp}] [${level}] ${message}${metaStr}`
    }

    /**
     * 错误日志
     * @param {string} message - 错误消息
     * @param {Object} meta - 元数据
     */
    error(message, meta) {
        if (this.level >= LOG_LEVELS.ERROR) {
            console.error(this._format('ERROR', message, meta))
        }
    }

    /**
     * 警告日志
     * @param {string} message - 警告消息
     * @param {Object} meta - 元数据
     */
    warn(message, meta) {
        if (this.level >= LOG_LEVELS.WARN) {
            console.warn(this._format('WARN', message, meta))
        }
    }

    /**
     * 信息日志
     * @param {string} message - 信息消息
     * @param {Object} meta - 元数据
     */
    info(message, meta) {
        if (this.level >= LOG_LEVELS.INFO) {
            console.log(this._format('INFO', message, meta))
        }
    }

    /**
     * 调试日志
     * @param {string} message - 调试消息
     * @param {Object} meta - 元数据
     */
    debug(message, meta) {
        if (this.level >= LOG_LEVELS.DEBUG) {
            console.log(this._format('DEBUG', message, meta))
        }
    }
}

// 导出单例
export const logger = new Logger(process.env.LOG_LEVEL || 'INFO')
