// Toast 通知管理器
import { createApp, ComponentPublicInstance } from 'vue'
import ToastNotification from '../components/ToastNotification.vue'

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
    type?: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

class ToastManager {
    private container: HTMLElement | null;

    constructor() {
        this.container = null
    }

    private init() {
        if (!this.container) {
            this.container = document.createElement('div')
            this.container.className = 'toast-container'
            this.container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
            `
            document.body.appendChild(this.container)
        }
    }

    show({ type = 'info', title = '', message, duration = 3000 }: ToastOptions) {
        this.init()

        const toastWrapper = document.createElement('div')
        this.container!.appendChild(toastWrapper)

        const toastApp = createApp(ToastNotification, {
            type,
            title,
            message,
            duration,
            onClose: () => {
                toastApp.unmount()
                if (this.container && this.container.contains(toastWrapper)) {
                    this.container.removeChild(toastWrapper)
                }
            }
        })

        toastApp.mount(toastWrapper)
    }

    success(message: string, title = '成功') {
        this.show({ type: 'success', title, message })
    }

    error(message: string, title = '错误') {
        this.show({ type: 'error', title, message, duration: 5000 })
    }

    warning(message: string, title = '警告') {
        this.show({ type: 'warning', title, message })
    }

    info(message: string, title = '') {
        this.show({ type: 'info', title, message })
    }
}

export const toast = new ToastManager()
