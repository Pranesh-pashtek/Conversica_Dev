declare module "sfmc" {
    export interface SfmcResponse<T> {
        count: number;
        page: number;
        pageSize: number;
        items: T[];
    }

    export interface AssetChannels {
        email: boolean;
        web: boolean;
    }

    export interface AssetType {
        name: string;
        id: number;
    }

    export interface Page {
        page: number;
        pageSize: number;
    }

    export type SimpleOperator =
        | "equal"
        | "notEqual"
        | "lessThan"
        | "lessThanOrEqual"
        | "greaterThan"
        | "greaterThanOrEqual"
        | "like"
        | "isNull"
        | "isNotNull"
        | "contains"
        | "mustcontain"
        | "startsWith"
        | "in"
        | "where";

    export interface Query {
        property: string;
        simpleOperator: SimpleOperator;
        value: string;
    }

    export type LogicalOperator = "AND" | "OR";

    export interface MultiQuery {
        leftOperand: MultiQuery | Query;
        logicalOperator?: LogicalOperator;
        rightOperand?: MultiQuery | Query;
    }

    export interface Sort {
        property: string;
        direction: "ASC" | "DESC";
    }

    export interface AssetQueryRequest {
        page: Page;
        query: MultiQuery | Query;
        sort?: Sort[];
        fields?: string[];
    }

    export interface HtmlEmailContent {
        content: string;
    }

    export interface AssetViews {
        html: HtmlEmailContent;
    }

    export interface User {
        id: number;
        email: string;
        name: string;
    }

    export type SharingType = "edit" | "local" | "view";

    export interface SharingProperties {
        sharedWith: number[];
        sharingType: SharingType;
    }

    export interface CreateAssetRequest {
        assetType: AssetType;
        channels: AssetChannels;
        customerKey: string;
        description?: string;
        name: string;
        views?: AssetViews;
        sharingProperties: SharingProperties;
    }

    export interface PatchAssetRequest {
        views: AssetViews;
    }

    export interface Thumbnail {
        thumbnailUrl?: string;
    }

    export interface Asset extends CreateAssetRequest {
        id: number;
        contentType: string;
        createdDate: string;
        createdBy: User;
        modifiedDate: string;
        modified: User;
        objectID: string;
        thumbnail?: Thumbnail;
    }

    export interface HtmlContentBlock extends Asset {
        content?: string;
    }
}
