import * as axios from "axios";

import type {
    Asset,
    AssetQueryRequest,
    CreateAssetRequest,
    HtmlContentBlock,
    PatchAssetRequest,
    Query,
    SfmcResponse,
} from "sfmc";

export const settings = {
    accessTokenCookieName: "sfmc_access_token",
    tenantSubDomainCookieName: "sfmc_tssd",
    tokenRefreshInterval: 15 * 60 * 1000,
    maxTokenLifetime: 20 * 60 * 1000,
};

/**
 * The Content Builder category where we expect users to create
 * custom HTML blocks as templates to insert a suggested article
 * into the email template.
 *
 * IMPORTANT! Changing this has implications for existing users.
 * Existing users would have to move any HTML blocks they had in
 * the previous category into the new one if this was changed.
 */
const defaultCategoryName = "Collection Templates";

const client = axios.default.create({
    timeout: 20 * 1000,
});

client.interceptors.response.use(undefined, (err) => {
    if (err.response.status === 401) {
        window.location.href = "/oauth2/sfmc/authorize";
        return;
    }

    return Promise.reject(err);
});

export async function refreshSfmcToken() {
    try {
        await client.post("/oauth2/sfmc/refresh_token");
        setTimeout(refreshSfmcToken, settings.tokenRefreshInterval);
    } catch (err) {
        console.error(
            "Error occurred while trying to refresh the token. Won't schedule the auto refresh."
        );
        console.error(err);
    }
}

export async function getAssetByCustomerKey(
    name: string
): Promise<Asset | undefined> {
    try {
        const response = await client.get<SfmcResponse<Asset>>(
            "/api/sfmc/asset/v1/content/assets",
            {
                params: {
                    $filter: `customerKey eq '${name}'`,
                },
            }
        );
        if (!response.data.count) {
            return;
        }

        return response.data.items[0];
    } catch (err) {
        console.error("Failed to fetch asset by name", name);
        throw err;
    }
}

export async function listExistingHtmlBlocks(): Promise<HtmlContentBlock[]> {
    const assetTypeQuery: Query = {
        property: "assetType.name",
        simpleOperator: "equal",
        value: "htmlblock",
    };

    const categoryNameQuery: Query = {
        property: "category.name",
        simpleOperator: "equal",
        value: defaultCategoryName,
    };

    const body: AssetQueryRequest = {
        page: {
            page: 1,
            pageSize: 50,
        },
        query: {
            leftOperand: assetTypeQuery,
            logicalOperator: "AND",
            rightOperand: categoryNameQuery,
        },
    };
    try {
        const response = await client.post<SfmcResponse<HtmlContentBlock>>(
            "/api/sfmc/asset/v1/content/assets/query",
            body
        );
        return response.data.items;
    } catch (err) {
        console.error("Failed to list HTML blocks", err);
        throw err;
    }
}

async function createAsset(
    key: string,
    name: string,
    html: string
): Promise<void> {
    const body: CreateAssetRequest = {
        customerKey: key,
        name,
        // https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/base-asset-types.html
        assetType: {
            id: 225,
            name: "customblock",
        },
        channels: {
            email: true,
            web: false,
        },
        views: {
            html: {
                content: html,
            },
        },
        sharingProperties: {
            sharedWith: [0],
            sharingType: "edit",
        },
    };

    try {
        await client.post<Asset>("/api/sfmc/asset/v1/content/assets", body, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        const msg = "Failed to create the asset in Content Builder";
        console.error(msg, err);
        throw new Error(msg);
    }
}

async function updateAsset(assetId: number, html: string): Promise<void> {
    const body: PatchAssetRequest = {
        views: {
            html: {
                content: html,
            },
        },
    };

    try {
        await client.patch<Asset>(
            `/api/sfmc/asset/v1/content/assets/${assetId}`,
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (err) {
        const msg = "Failed to update the asset";
        console.error(msg, err);
        throw new Error(msg);
    }
}

export async function upsertAsset(
    key: string,
    name: string,
    html: string
): Promise<void> {
    const existingAsset = await getAssetByCustomerKey(key);
    if (!existingAsset) {
        await createAsset(key, name, html);
        return;
    }

    await updateAsset(existingAsset.id, html);
}

export async function getThumbnailBase64(
    thumbnailUrl: string
): Promise<string> {
    try {
        const response = await client.get<string>(
            `/api/sfmc/asset${thumbnailUrl}`
        );
        return `data:image/png;base64,${response.data}`;
    } catch (err) {
        console.error("Failed to fetch the thumbnail base64 string");
    }

    return "";
}
