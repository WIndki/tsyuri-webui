/**
 * 创建一个防抖函数，该函数会延迟调用传入的函数，直到自上次调用防抖函数以来经过了指定的毫秒数。
 *
 * @param func 要防抖的函数
 * @param wait 延迟的毫秒数
 * @param immediate 指定是否在超时开始时调用函数而不是结束时
 * @returns 防抖处理后的函数
 */
export default function Debounce<T extends (...args: Parameters<T>) => unknown>(
    func: T,
    wait: number,
    immediate: boolean = false
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (this: unknown, ...args: Parameters<T>): void {
        const callNow = immediate && !timeout;

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = null;
            if (!immediate) {
                func.apply(this, args);
            }
        }, wait);

        if (callNow) {
            func.apply(this, args);
        }
    };
}
