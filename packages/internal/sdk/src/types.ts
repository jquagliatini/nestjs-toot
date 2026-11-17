/* oxlint-disable */
// this file is auto-generated

export type ClientOptions = {
    baseUrl: 'http://localhost:3000' | (string & {});
};

export type PostApiAuthV1SignupData = {
    body: {
        email: string;
        password: string;
        username: string;
    };
    path?: never;
    query?: never;
    url: '/api/auth/v1/signup';
};

export type PostApiAuthV1SignupResponses = {
    200: {
        token: string;
        expiresAt: string;
        id: string;
    };
};

export type PostApiAuthV1SignupResponse = PostApiAuthV1SignupResponses[keyof PostApiAuthV1SignupResponses];

export type PostApiAuthV1SigninData = {
    body?: {
        email: string;
        password: string;
    };
    headers?: {
        Authorization?: string;
    };
    path?: never;
    query?: never;
    url: '/api/auth/v1/signin';
};

export type PostApiAuthV1SigninResponses = {
    201: {
        token: string;
        expiresAt: string;
    };
};

export type PostApiAuthV1SigninResponse = PostApiAuthV1SigninResponses[keyof PostApiAuthV1SigninResponses];

export type GetApiAuthV1IntrospectData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/auth/v1/introspect';
};

export type GetApiAuthV1IntrospectResponses = {
    200: {
        id: string;
        username: string;
    };
};

export type GetApiAuthV1IntrospectResponse = GetApiAuthV1IntrospectResponses[keyof GetApiAuthV1IntrospectResponses];

export type GetApiTootsV1Data = {
    body?: never;
    path?: never;
    query?: {
        pageIndex?: number | null;
        pageSize?: number;
    };
    url: '/api/toots/v1';
};

export type GetApiTootsV1Responses = {
    200: {
        items: Array<{
            id: string;
            content: string;
            createdAt: string;
            author: {
                id: string;
                username: string;
            };
            likesCount: number;
            commentsCount: number;
            connectedUser: {
                liked: boolean;
                author: boolean;
                permissions: Array<'comment' | 'like' | 'unlike'>;
            } | null;
        }>;
        totalCount: number;
        next?: string;
        previous?: string;
    };
};

export type GetApiTootsV1Response = GetApiTootsV1Responses[keyof GetApiTootsV1Responses];

export type PostApiTootsV1Data = {
    body: {
        content: string;
    };
    path?: never;
    query?: never;
    url: '/api/toots/v1';
};

export type PostApiTootsV1Responses = {
    201: {
        id: string;
    };
};

export type PostApiTootsV1Response = PostApiTootsV1Responses[keyof PostApiTootsV1Responses];

export type GetApiTootsV1ByIdData = {
    body?: never;
    path: {
        id: string;
    };
    query?: never;
    url: '/api/toots/v1/{id}';
};

export type GetApiTootsV1ByIdResponses = {
    200: {
        id: string;
        content: string;
        createdAt: string;
        author: {
            id: string;
            username: string;
        };
        connectedUser: {
            liked: boolean;
            author: boolean;
            permissions: Array<'comment' | 'like' | 'unlike'>;
        } | null;
        likesCount: number;
        comments: {
            items: Array<{
                id: string;
                content: string;
                createdAt: string;
                author: {
                    id: string;
                    username: string;
                } | null;
                connectedUser: {
                    author: boolean;
                } | null;
            }>;
            totalCount: number;
            next?: string;
            previous?: string;
        };
    };
};

export type GetApiTootsV1ByIdResponse = GetApiTootsV1ByIdResponses[keyof GetApiTootsV1ByIdResponses];

export type GetApiTootsV1ByIdCommentsData = {
    body?: never;
    path: {
        id: string;
    };
    query?: {
        pageIndex?: number | null;
        pageSize?: number;
    };
    url: '/api/toots/v1/{id}/comments';
};

export type GetApiTootsV1ByIdCommentsResponses = {
    200: {
        items: Array<{
            id: string;
            content: string;
            createdAt: string;
            author: {
                id: string;
                username: string;
            } | null;
        }>;
        totalCount: number;
        next?: string;
        previous?: string;
    };
};

export type GetApiTootsV1ByIdCommentsResponse = GetApiTootsV1ByIdCommentsResponses[keyof GetApiTootsV1ByIdCommentsResponses];

export type PostApiTootsV1ByIdCommentsData = {
    body: {
        content: string;
    };
    path: {
        id: string;
    };
    query?: never;
    url: '/api/toots/v1/{id}/comments';
};

export type PostApiTootsV1ByIdCommentsResponses = {
    201: {
        id: string;
    };
};

export type PostApiTootsV1ByIdCommentsResponse = PostApiTootsV1ByIdCommentsResponses[keyof PostApiTootsV1ByIdCommentsResponses];

export type DeleteApiTootsV1ByIdLikesData = {
    body?: never;
    path: {
        id: string;
    };
    query?: never;
    url: '/api/toots/v1/{id}/likes';
};

export type DeleteApiTootsV1ByIdLikesResponses = {
    204: void;
};

export type DeleteApiTootsV1ByIdLikesResponse = DeleteApiTootsV1ByIdLikesResponses[keyof DeleteApiTootsV1ByIdLikesResponses];

export type PutApiTootsV1ByIdLikesData = {
    body?: never;
    path: {
        id: string;
    };
    query?: never;
    url: '/api/toots/v1/{id}/likes';
};

export type PutApiTootsV1ByIdLikesResponses = {
    204: void;
};

export type PutApiTootsV1ByIdLikesResponse = PutApiTootsV1ByIdLikesResponses[keyof PutApiTootsV1ByIdLikesResponses];
