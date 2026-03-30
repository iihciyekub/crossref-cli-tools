const fs = require("fs");
const path = require("path");

function readVersion(baseDir) {
    try {
        const packagePath = path.join(baseDir, "package.json");
        return JSON.parse(fs.readFileSync(packagePath, "utf8")).version || "0.0.0";
    } catch {
        return "0.0.0";
    }
}

function getIntEnv(name, defaultValue) {
    const raw = process.env[name];
    if (raw === undefined || raw === null || raw === "") {
        return defaultValue;
    }

    const parsed = Number.parseInt(String(raw), 10);
    if (!Number.isFinite(parsed)) {
        return defaultValue;
    }

    return parsed;
}

function getRetryConfig() {
    const retries = Math.max(0, getIntEnv("CROSSREFCLI_RETRIES", 2));
    const maxTimeSeconds = Math.max(1, getIntEnv("CROSSREFCLI_MAX_TIME", 60));
    const fetchTimeoutMs = Math.max(
        1000,
        getIntEnv("CROSSREFCLI_FETCH_TIMEOUT_MS", maxTimeSeconds * 1000),
    );

    return {
        retries,
        fetchTimeoutMs,
    };
}

async function fetchWithRetry(url, options = {}) {
    const { retries, fetchTimeoutMs } = getRetryConfig();
    const method = options.method || "GET";
    const headers = options.headers || {};
    const body = options.body;
    const redirect = options.redirect || "follow";
    const expectedStatus = options.expectedStatus || "ok";

    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);

        try {
            const response = await fetch(url, {
                method,
                headers,
                body,
                redirect,
                signal: controller.signal,
            });

            if (expectedStatus === "ok" && !response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            clearTimeout(timeout);
            return response;
        } catch (error) {
            clearTimeout(timeout);
            lastError = error && error.name === "AbortError"
                ? new Error(`Request timed out after ${fetchTimeoutMs}ms`)
                : error;

            if (attempt >= retries) {
                throw lastError;
            }

            const backoffMs = Math.min(1000, 250 * (attempt + 1));
            await sleep(backoffMs);
        }
    }

    throw lastError || new Error("Request failed");
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readStdin() {
    if (process.stdin.isTTY) {
        return "";
    }

    return new Promise((resolve, reject) => {
        let data = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => {
            data += chunk;
        });
        process.stdin.on("end", () => resolve(data));
        process.stdin.on("error", reject);
    });
}

function trim(value) {
    return String(value || "").trim();
}

function strictUrlEncode(value) {
    return encodeURIComponent(String(value || "")).replace(/[!'()*]/g, (char) =>
        `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
    );
}

function sanitizeFilename(value) {
    return String(value || "")
        .replace(/[\/\\:*?"<>|]/g, "_")
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "") || "item";
}

function decodeHtmlEntities(value) {
    return String(value || "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">");
}

function levenshtein(a, b) {
    const left = String(a || "");
    const right = String(b || "");
    const rows = Array.from({ length: left.length + 1 }, () => []);

    for (let index = 0; index <= left.length; index += 1) {
        rows[index][0] = index;
    }

    for (let index = 0; index <= right.length; index += 1) {
        rows[0][index] = index;
    }

    for (let i = 1; i <= left.length; i += 1) {
        for (let j = 1; j <= right.length; j += 1) {
            const cost = left[i - 1] === right[j - 1] ? 0 : 1;
            rows[i][j] = Math.min(
                rows[i - 1][j] + 1,
                rows[i][j - 1] + 1,
                rows[i - 1][j - 1] + cost,
            );
        }
    }

    return rows[left.length][right.length];
}

function formatStyleSuggestions(requestedStyle, items) {
    const needle = String(requestedStyle || "").toLowerCase();
    const exact = items.find((item) => item.toLowerCase() === needle);
    if (exact) {
        return { ok: true, suggestions: [] };
    }

    const seen = new Set();
    const contains = items.filter((item) => item.toLowerCase().includes(needle));
    const ranked = [...items].sort((left, right) => {
        return levenshtein(left.toLowerCase(), needle) - levenshtein(right.toLowerCase(), needle)
            || left.localeCompare(right);
    });

    const suggestions = [];
    for (const item of [...contains, ...ranked]) {
        if (seen.has(item)) {
            continue;
        }
        seen.add(item);
        suggestions.push(item);
        if (suggestions.length >= 5) {
            break;
        }
    }

    return { ok: false, suggestions };
}

function splitNonEmptyLines(value) {
    return String(value || "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
}

module.exports = {
    decodeHtmlEntities,
    fetchWithRetry,
    formatStyleSuggestions,
    readStdin,
    readVersion,
    sanitizeFilename,
    splitNonEmptyLines,
    strictUrlEncode,
    trim,
};
