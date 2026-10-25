











const CRYPTO_KEY_B64 = "__FURUP_CRYPTO_KEY_PLACEHOLDER__";
const PLACEHOLDER = "__FURUP_CRYPTO_KEY_PLACEHOLDER__";
const KDF_LABEL = "FurUp:data:key:v1:";

let cachedMasterKeyBytes = null;
let cachedAesKeyPromise = null;
let cachedHmacKeyPromise = null;
const cachedDerivedAesKeyPromises = new Map();




function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function getMasterKeyBytes() {
    if (cachedMasterKeyBytes) return cachedMasterKeyBytes;
    if (CRYPTO_KEY_B64 === PLACEHOLDER) {
        throw new Error("加密密钥未配置");
    }
    const keyBytes = base64ToUint8Array(CRYPTO_KEY_B64);
    if (keyBytes.byteLength !== 32) {
        throw new Error("加密密钥长度必须为 32 字节");
    }
    cachedMasterKeyBytes = keyBytes;
    return cachedMasterKeyBytes;
}

function getDataContextFromUrl(url) {
    try {
        const base = typeof location !== "undefined" ? location.href : "http://localhost/";
        const parsed = new URL(url, base);
        if (parsed.protocol === "data:" || parsed.protocol === "blob:") return null;

        const pathname = String(parsed.pathname || "").replace(/\\/g, "/");
        const marker = "/data/";
        const index = pathname.lastIndexOf(marker);
        if (index !== -1) {
            const context = pathname.slice(index + marker.length);
            return context || null;
        }

        const parts = pathname.split("/");
        return parts[parts.length - 1] || null;
    } catch (e) {
        return null;
    }
}

function resolveDecryptContext(url, encryptedData) {
    const fromUrl = getDataContextFromUrl(url);
    if (fromUrl) {
        if (encryptedData?.context && encryptedData.context !== fromUrl) {
            throw new Error("加密上下文不匹配");
        }
        return fromUrl;
    }
    if (encryptedData?.context) return encryptedData.context;
    return null;
}

async function getAesKey() {
    if (!cachedAesKeyPromise) {
        cachedAesKeyPromise = crypto.subtle.importKey(
            "raw",
            getMasterKeyBytes(),
            { name: "AES-GCM" },
            false,
            ["decrypt"]
        );
    }
    return cachedAesKeyPromise;
}

async function getHmacKey() {
    if (!cachedHmacKeyPromise) {
        cachedHmacKeyPromise = crypto.subtle.importKey(
            "raw",
            getMasterKeyBytes(),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
    }
    return cachedHmacKeyPromise;
}

async function getDerivedAesKey(context) {
    if (!context) {
        throw new Error("无法确定解密上下文");
    }

    if (!cachedDerivedAesKeyPromises.has(context)) {
        cachedDerivedAesKeyPromises.set(
            context,
            (async () => {
                const hmacKey = await getHmacKey();
                const msg = new TextEncoder().encode(`${KDF_LABEL}${context}`);
                const derivedKeyBytes = new Uint8Array(await crypto.subtle.sign("HMAC", hmacKey, msg));
                return crypto.subtle.importKey(
                    "raw",
                    derivedKeyBytes,
                    { name: "AES-GCM" },
                    false,
                    ["decrypt"]
                );
            })()
        );
    }

    return cachedDerivedAesKeyPromises.get(context);
}




function isEncryptedData(data) {
    return (
        data &&
        typeof data === "object" &&
        data.encrypted === true &&
        data.algorithm === "AES-256-GCM" &&
        typeof data.iv === "string" &&
        typeof data.data === "string"
    );
}




async function decryptData(encryptedData, url) {
    const iv = base64ToUint8Array(encryptedData.iv);
    const ciphertext = base64ToUint8Array(encryptedData.data);

    const kdf = encryptedData?.kdf || "none";
    const context = resolveDecryptContext(url, encryptedData);
    const cryptoKey = kdf === "HMAC-SHA256" ? await getDerivedAesKey(context) : await getAesKey();

    const algorithm = { name: "AES-GCM", iv };
    if (kdf === "HMAC-SHA256") {
        algorithm.additionalData = new TextEncoder().encode(context);
    }

    const decrypted = await crypto.subtle.decrypt(algorithm, cryptoKey, ciphertext);

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decrypted);
    return JSON.parse(jsonString);
}








export async function loadSecureData(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (isEncryptedData(data)) {
        try {
            return await decryptData(data, url);
        } catch (error) {
            console.error("[dataLoader] 解密失败:", error);
            throw new Error("数据解密失败");
        }
    }

    
    return data;
}




export function isEncryptionEnabled() {
    return CRYPTO_KEY_B64 !== PLACEHOLDER;
}

export { isEncryptedData };
