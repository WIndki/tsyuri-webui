import { useEffect, useState } from "react";

/**
 *  ForwardEventListener 是一个自定义 React Hook，用于监听浏览器的前进和后退事件。
 *
 * @returns 产生一个状态变化的事件监听器，当浏览器前进或后退时触发。
 */
const ForwardEventListener = () => {
    const [state, setState] = useState(true);
    useEffect(() => {
        const handlePopState = () => setState(!state);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [state]);
    return state;
};

export default ForwardEventListener;
