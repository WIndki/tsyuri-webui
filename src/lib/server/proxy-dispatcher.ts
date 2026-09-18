import "server-only";

import { EnvHttpProxyAgent, setGlobalDispatcher } from "undici";

/**
 * Routes outbound server requests through the proxy described by the environment.
 *
 * Node's built-in `fetch` resolves hostnames directly and ignores `HTTP_PROXY` / `HTTPS_PROXY` /
 * `NO_PROXY`. Every other HTTP client on a machine with those variables set honours them — `curl`
 * does, and so does the browser — so without this the server can be the only process in the
 * environment that cannot reach the network. The symptom is `getaddrinfo ENOTFOUND` or a hang
 * followed by our own timeout, on a host that responds in under a second through the proxy.
 *
 * `EnvHttpProxyAgent` reads the three standard variables itself, including `NO_PROXY`, which is what
 * keeps same-origin requests to `127.0.0.1` direct. When none of the variables are set it proxies
 * nothing, so this is a no-op on a host without an egress proxy.
 *
 * Called once when a server data module is first loaded, before any request is issued.
 */
let configured = false;

export function configureProxyDispatcher(): void {
    if (configured) return;
    configured = true;

    const { HTTPS_PROXY, https_proxy, HTTP_PROXY, http_proxy } = process.env;
    if (!HTTPS_PROXY && !https_proxy && !HTTP_PROXY && !http_proxy) return;

    // Node's fetch keeps a reference to the previous dispatcher, so the global is replaced rather
    // than wrapped; requests already in flight are unaffected.
    setGlobalDispatcher(new EnvHttpProxyAgent());
}
