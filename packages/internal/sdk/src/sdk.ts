/* oxlint-disable */
// this file is auto-generated

import { client } from './client.ts';
import type { Client, ClientMeta, Options as Options2, RequestResult, TDataShape } from './client/index.ts';
import type { DeleteApiTootsV1ByIdLikesData, DeleteApiTootsV1ByIdLikesResponses, GetApiAuthV1IntrospectData, GetApiAuthV1IntrospectResponses, GetApiTootsV1ByIdCommentsData, GetApiTootsV1ByIdCommentsResponses, GetApiTootsV1ByIdData, GetApiTootsV1ByIdResponses, GetApiTootsV1Data, GetApiTootsV1Responses, GetHealthData, GetHealthResponses, PostApiAuthV1SigninData, PostApiAuthV1SigninResponses, PostApiAuthV1SignupData, PostApiAuthV1SignupResponses, PostApiTootsV1ByIdCommentsData, PostApiTootsV1ByIdCommentsResponses, PostApiTootsV1Data, PostApiTootsV1Responses, PutApiTootsV1ByIdLikesData, PutApiTootsV1ByIdLikesResponses } from './types.ts';

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean, TResponse = unknown> = Options2<TData, ThrowOnError, TResponse> & {
    /**
     * You can provide a client instance returned by `createClient()` instead of
     * individual options. This might be also useful if you want to implement a
     * custom client.
     */
    client?: Client;
    /**
     * You can pass arbitrary values through the `meta` object. This can be
     * used to access values that aren't defined as part of the SDK function.
     */
    meta?: keyof ClientMeta extends never ? Record<string, unknown> : ClientMeta;
};

class HeyApiClient {
    protected client: Client;
    
    constructor(args?: {
        client?: Client;
    }) {
        this.client = args?.client ?? client;
    }
}

class HeyApiRegistry<T> {
    private readonly defaultKey = 'default';
    
    private readonly instances: Map<string, T> = new Map();
    
    get(key?: string): T {
        const instance = this.instances.get(key ?? this.defaultKey);
        if (!instance) {
            throw new Error(`No SDK client found. Create one with "new Sdk()" to fix this error.`);
        }
        return instance;
    }
    
    set(value: T, key?: string): void {
        this.instances.set(key ?? this.defaultKey, value);
    }
}

export class Health extends HeyApiClient {
    public getHealth<ThrowOnError extends boolean = false>(options?: Options<GetHealthData, ThrowOnError>): RequestResult<GetHealthResponses, unknown, ThrowOnError> {
        return (options?.client ?? this.client).get<GetHealthResponses, unknown, ThrowOnError>({ url: '/_health', ...options });
    }
}

export class Auth extends HeyApiClient {
    public signup<ThrowOnError extends boolean = false>(options: Options<PostApiAuthV1SignupData, ThrowOnError>): RequestResult<PostApiAuthV1SignupResponses, unknown, ThrowOnError> {
        return (options.client ?? this.client).post<PostApiAuthV1SignupResponses, unknown, ThrowOnError>({
            url: '/api/auth/v1/signup',
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
    }
    
    public signin<ThrowOnError extends boolean = false>(options?: Options<PostApiAuthV1SigninData, ThrowOnError>): RequestResult<PostApiAuthV1SigninResponses, unknown, ThrowOnError> {
        return (options?.client ?? this.client).post<PostApiAuthV1SigninResponses, unknown, ThrowOnError>({
            security: [{ scheme: 'basic', type: 'http' }],
            url: '/api/auth/v1/signin',
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            }
        });
    }
    
    public introspect<ThrowOnError extends boolean = false>(options?: Options<GetApiAuthV1IntrospectData, ThrowOnError>): RequestResult<GetApiAuthV1IntrospectResponses, unknown, ThrowOnError> {
        return (options?.client ?? this.client).get<GetApiAuthV1IntrospectResponses, unknown, ThrowOnError>({
            security: [{ scheme: 'bearer', type: 'http' }],
            url: '/api/auth/v1/introspect',
            ...options
        });
    }
}

export class Toots extends HeyApiClient {
    public listToots<ThrowOnError extends boolean = false>(options?: Options<GetApiTootsV1Data, ThrowOnError>): RequestResult<GetApiTootsV1Responses, unknown, ThrowOnError> {
        return (options?.client ?? this.client).get<GetApiTootsV1Responses, unknown, ThrowOnError>({ url: '/api/toots/v1', ...options });
    }
    
    public createToot<ThrowOnError extends boolean = false>(options: Options<PostApiTootsV1Data, ThrowOnError>): RequestResult<PostApiTootsV1Responses, unknown, ThrowOnError> {
        return (options.client ?? this.client).post<PostApiTootsV1Responses, unknown, ThrowOnError>({
            security: [{ scheme: 'bearer', type: 'http' }],
            url: '/api/toots/v1',
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
    }
    
    public detailToot<ThrowOnError extends boolean = false>(options: Options<GetApiTootsV1ByIdData, ThrowOnError>): RequestResult<GetApiTootsV1ByIdResponses, unknown, ThrowOnError> {
        return (options.client ?? this.client).get<GetApiTootsV1ByIdResponses, unknown, ThrowOnError>({ url: '/api/toots/v1/{id}', ...options });
    }
    
    public listComments<ThrowOnError extends boolean = false>(options: Options<GetApiTootsV1ByIdCommentsData, ThrowOnError>): RequestResult<GetApiTootsV1ByIdCommentsResponses, unknown, ThrowOnError> {
        return (options.client ?? this.client).get<GetApiTootsV1ByIdCommentsResponses, unknown, ThrowOnError>({ url: '/api/toots/v1/{id}/comments', ...options });
    }
    
    public comment<ThrowOnError extends boolean = false>(options: Options<PostApiTootsV1ByIdCommentsData, ThrowOnError>): RequestResult<PostApiTootsV1ByIdCommentsResponses, unknown, ThrowOnError> {
        return (options.client ?? this.client).post<PostApiTootsV1ByIdCommentsResponses, unknown, ThrowOnError>({
            security: [{ scheme: 'bearer', type: 'http' }],
            url: '/api/toots/v1/{id}/comments',
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
    }
    
    public unlike<ThrowOnError extends boolean = false>(options: Options<DeleteApiTootsV1ByIdLikesData, ThrowOnError>): RequestResult<DeleteApiTootsV1ByIdLikesResponses, unknown, ThrowOnError> {
        return (options.client ?? this.client).delete<DeleteApiTootsV1ByIdLikesResponses, unknown, ThrowOnError>({
            security: [{ scheme: 'bearer', type: 'http' }],
            url: '/api/toots/v1/{id}/likes',
            ...options
        });
    }
    
    public like<ThrowOnError extends boolean = false>(options: Options<PutApiTootsV1ByIdLikesData, ThrowOnError>): RequestResult<PutApiTootsV1ByIdLikesResponses, unknown, ThrowOnError> {
        return (options.client ?? this.client).put<PutApiTootsV1ByIdLikesResponses, unknown, ThrowOnError>({
            security: [{ scheme: 'bearer', type: 'http' }],
            url: '/api/toots/v1/{id}/likes',
            ...options
        });
    }
}

export class Sdk extends HeyApiClient {
    public static readonly __registry: HeyApiRegistry<Sdk> = new HeyApiRegistry<Sdk>();
    
    constructor(args?: {
        client?: Client;
        key?: string;
    }) {
        super(args);
        Sdk.__registry.set(this, args?.key);
    }
    
    private _health?: Health;
    get health(): Health {
        return this._health ??= new Health({ client: this.client });
    }
    
    private _auth?: Auth;
    get auth(): Auth {
        return this._auth ??= new Auth({ client: this.client });
    }
    
    private _toots?: Toots;
    get toots(): Toots {
        return this._toots ??= new Toots({ client: this.client });
    }
}
