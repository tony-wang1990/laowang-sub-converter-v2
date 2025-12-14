/**
 * 外部配置管理器
 */

export interface ExternalConfig {
    // 重命名规则
    rename?: Record<string, string>

    // 节点包含规则（正则）
    include_remarks?: string[]

    // 节点排除规则（正则）
    exclude_remarks?: string[]

    // 自定义分组
    custom_groups?: Array<{
        name: string
        type: string
        filter?: string
    }>

    // Emoji规则
    emoji?: Record<string, string>

    // 其他自定义规则
    [key: string]: any
}

/**
 * 从URL获取外部配置
 */
export async function fetchExternalConfig(configUrl: string): Promise<ExternalConfig | null> {
    try {
        console.log(`Fetching external config from: ${configUrl}`)

        const response = await fetch(configUrl, {
            headers: {
                'User-Agent': 'LaoWang-Sub-Converter/2.0'
            },
            signal: AbortSignal.timeout(10000)  // 10秒超时
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type')
        let config: ExternalConfig

        // 根据内容类型解析
        if (contentType?.includes('application/json')) {
            config = await response.json()
        } else {
            // 尝试解析为INI格式或纯文本
            const text = await response.text()
            config = parseConfigText(text)
        }

        console.log('✅ External config loaded successfully')
        return config

    } catch (error: any) {
        console.error('Failed to fetch external config:', error.message)
        return null
    }
}

/**
 * 解析配置文本（简单的INI格式或键值对）
 */
function parseConfigText(text: string): ExternalConfig {
    const config: ExternalConfig = {}
    const lines = text.split('\n')

    let currentSection = ''

    for (const line of lines) {
        const trimmed = line.trim()

        // 跳过注释和空行
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';') || trimmed.startsWith('//')) {
            continue
        }

        // 检测节（section）
        const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/)
        if (sectionMatch) {
            currentSection = sectionMatch[1]
            continue
        }

        // 解析键值对
        const kvMatch = trimmed.match(/^([^=]+)=(.*)$/)
        if (kvMatch) {
            const key = kvMatch[1].trim()
            const value = kvMatch[2].trim()

            // 根据section组织数据
            if (currentSection) {
                if (!config[currentSection]) {
                    config[currentSection] = {}
                }
                if (typeof config[currentSection] === 'object') {
                    (config[currentSection] as any)[key] = value
                }
            } else {
                config[key] = value
            }
        }
    }

    return config
}

/**
 * 应用外部配置到节点处理参数
 */
export function applyExternalConfig(
    baseParams: any,
    config: ExternalConfig
): any {
    const params = { ...baseParams }

    // 应用重命名规则
    if (config.rename) {
        const renameRules = Object.entries(config.rename)
            .map(([oldName, newName]) => `${oldName}->${newName}`)
            .join('\n')
        params.rename = renameRules
    }

    // 应用包含规则
    if (config.include_remarks && config.include_remarks.length > 0) {
        params.include = config.include_remarks.join('|')
    }

    // 应用排除规则
    if (config.exclude_remarks && config.exclude_remarks.length > 0) {
        params.exclude = config.exclude_remarks.join('|')
    }

    // 应用Emoji规则（覆盖默认）
    if (config.emoji && Object.keys(config.emoji).length > 0) {
        params.customEmoji = config.emoji
    }

    console.log('Applied external config to parameters')
    return params
}

/**
 * 验证配置文件格式
 */
export function validateConfig(config: any): boolean {
    if (!config || typeof config !== 'object') {
        return false
    }

    // 基础验证通过
    return true
}

export default {
    fetchExternalConfig,
    applyExternalConfig,
    parseConfigText,
    validateConfig
}
