/* oxlint-disable */
// this file is auto-generated

export type ClientOptions = {
    baseUrl: 'http://localhost:3000' | (string & {});
};

export type GetHealthData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/_health';
};

export type GetHealthResponses = {
    200: {
        up: boolean;
        db: boolean;
    };
};

export type GetHealthResponse = GetHealthResponses[keyof GetHealthResponses];

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
