import halfred, { Resource } from "halfred";
import {
    ApiError,
    NotFoundError,
    NetworkError,
    AuthenticationError,
    ServerError,
    ValidationError,
} from "@/types/errors";

const PROD_API_BASE_URL = "https://api.firstlegoleague.win";

// Env variables starting with NEXT_PUBLIC_ are available to the client.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || PROD_API_BASE_URL;

export function mergeHal<T>(obj: Resource): (T & Resource) {
    return Object.assign(obj, halfred.parse(obj)) as T & Resource;
}

export function mergeHalArray<T>(objs: Resource[]): (T & Resource)[] {
    return objs.map(o => Object.assign(o, halfred.parse(o)) as T & Resource);
}

/**
 * Fetches a HAL collection and returns a merged array of resources
 * @param path - API endpoint path
 * @param authProvider - Authentication strategy
 * @param embeddedKey - Key for embedded array in HAL response
 */
export async function fetchHalCollection<T>(
    path: string,
    authProvider: { getAuth: () => Promise<string | null> },
    embeddedKey: string
): Promise<(T & Resource)[]> {
    const resource = await getHal(path, authProvider);
    const embedded = resource.embeddedArray(embeddedKey) || [];
    return mergeHalArray<T>(embedded);
}

/**
 * Fetches a single HAL resource and returns it merged
 * @param path - API endpoint path
 * @param authProvider - Authentication strategy
 */
export async function fetchHalResource<T>(
    path: string,
    authProvider: { getAuth: () => Promise<string | null> }
): Promise<T & Resource> {
    const resource = await getHal(path, authProvider);
    return mergeHal<T>(resource);
}

/**
 * Creates a HAL resource via POST with null-check
 * @param path - API endpoint path
 * @param data - Resource data to create
 * @param authProvider - Authentication strategy
 * @param resourceName - Name of resource for error messages (lowercase)
 */
export async function createHalResource<T>(
    path: string,
    data: Resource,
    authProvider: { getAuth: () => Promise<string | null> },
    resourceName: string
): Promise<T & Resource> {
    const resource = await postHal(path, data, authProvider);
    if (!resource) {
        throw new ApiError(
            `Failed to create ${resourceName}: No response from server`,
            500,
            true
        );
    }
    return mergeHal<T>(resource);
}

/**
 * Updates a HAL resource via PUT with null-check
 * @param path - API endpoint path
 * @param data - Resource data to update
 * @param authProvider - Authentication strategy
 * @param resourceName - Name of resource for error messages (lowercase)
 */
export async function updateHalResource<T>(
    path: string,
    data: Resource,
    authProvider: { getAuth: () => Promise<string | null> },
    resourceName: string
): Promise<T & Resource> {
    const resource = await putHal(path, data, authProvider);
    if (!resource) {
        throw new ApiError(
            `Failed to update ${resourceName}: No response from server`,
            500,
            true
        );
    }
    return mergeHal<T>(resource);
}

/**
 * Safely parses response body as HAL+JSON, returning null for 204 No Content responses
 */
async function parseResponseBody(res: Response): Promise<Resource | null> {
    if (res.status === 204 || res.headers.get("content-length") === "0") {
        return null;
    }
    return halfred.parse(await res.json());
}

/**
 * Handles fetch errors and HTTP status codes, converting them to specific error types
 */
async function handleApiError(error: unknown, res?: Response): Promise<never> {
    // Handle network errors (fetch failures - API unavailable)
    if (error instanceof TypeError) {
        throw new NetworkError(undefined, error);
    }

    // Handle HTTP status codes
    if (res && !res.ok) {
        const status = res.status;

        // Try to parse error message from response body
        let errorMessage: string | undefined;
        try {
            const contentType = res.headers.get("content-type");
            if (contentType?.toLowerCase().includes("json")) {
                const errorBody = await res.json();
                errorMessage = errorBody.message || errorBody.error || errorBody.detail;
            }
        } catch {
            // Ignore JSON parsing errors, use default messages
        }

        // Map status codes to specific error types
        switch (status) {
            case 404:
                throw new NotFoundError(errorMessage, error);
            case 401:
            case 403:
                throw new AuthenticationError(errorMessage, status, error);
            case 400:
                throw new ValidationError(errorMessage, error);
            case 500:
            case 502:
            case 503:
            case 504:
                throw new ServerError(errorMessage, status, error);
            default:
                throw new ApiError(
                    errorMessage || "An error occurred. Please try again.",
                    status,
                    true,
                    error
                );
        }
    }

    // Fallback for unknown errors
    throw new ApiError("An unexpected error occurred. Please try again.", undefined, true, error);
}

export async function getHal(path: string, authProvider: { getAuth: () => Promise<string | null> }): Promise<Resource> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const authorization = await authProvider.getAuth();
    
    try {
        const res = await fetch(url, {
            headers: {
                "Accept": "application/hal+json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });
        
        if (!res.ok) {
            await handleApiError(new Error(`HTTP ${res.status}`), res);
            // TypeScript doesn't know handleApiError always throws, so we need this line
            throw new Error("Unreachable");
        }
        
        return halfred.parse(await res.json());
    } catch (error) {
        // If it's already a custom error, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }
        // Otherwise, handle it as a network error
        await handleApiError(error);
        // TypeScript doesn't know handleApiError always throws, so we need this line
        throw new Error("Unreachable");
    }
}

export async function putHal(path: string, body: Resource, authProvider: { getAuth: () => Promise<string | null> }): Promise<Resource | null> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const authorization = await authProvider.getAuth();
    
    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/hal+json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });
        
        if (!res.ok) {
            await handleApiError(new Error(`HTTP ${res.status}`), res);
            throw new Error("Unreachable");
        }
        
        return await parseResponseBody(res);
    } catch (error) {
        // If it's already a custom error, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }
        // Otherwise, handle it as a network error
        await handleApiError(error);
        // TypeScript doesn't know handleApiError always throws, so we need this line
        throw new Error("Unreachable");
    }
}

export async function deleteHal(path: string, authProvider: { getAuth: () => Promise<string | null> }): Promise<Resource | null> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const authorization = await authProvider.getAuth();
    
    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "Accept": "application/hal+json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            cache: "no-store",
        });
        
        if (!res.ok) {
            await handleApiError(new Error(`HTTP ${res.status}`), res);
            throw new Error("Unreachable");
        }
        
        return await parseResponseBody(res);
    } catch (error) {
        // If it's already a custom error, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }
        // Otherwise, handle it as a network error
        await handleApiError(error);
        // TypeScript doesn't know handleApiError always throws, so we need this line
        throw new Error("Unreachable");
    }
}

export async function postHal(path: string, body: Resource, authProvider: { getAuth: () => Promise<string | null> }): Promise<Resource | null> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const authorization = await authProvider.getAuth();
    
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/hal+json",
                ...(authorization ? { Authorization: authorization } : {}),
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });
        
        if (!res.ok) {
            await handleApiError(new Error(`HTTP ${res.status}`), res);
            throw new Error("Unreachable");
        }
        
        return await parseResponseBody(res);
    } catch (error) {
        // If it's already a custom error, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }
        // Otherwise, handle it as a network error
        await handleApiError(error);
        // TypeScript doesn't know handleApiError always throws, so we need this line
        throw new Error("Unreachable");
    }
}
