/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BattleComplete } from '../models/BattleComplete';
import type { BattleCompleteResponse } from '../models/BattleCompleteResponse';
import type { BattleCreate } from '../models/BattleCreate';
import type { BattleJoin } from '../models/BattleJoin';
import type { BattleLeaveResponse } from '../models/BattleLeaveResponse';
import type { BattleResponse } from '../models/BattleResponse';
import type { BattleStart } from '../models/BattleStart';
import type { BattleStartResponse } from '../models/BattleStartResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ShenbiBattlesService {
    /**
     * Create Battle
     * Create a new battle room.
     *
     * The authenticated user becomes the host and waits for a guest to join.
     * Returns a room_code that the guest can use to join.
     * @param xApiKey
     * @param requestBody
     * @returns BattleResponse Successful Response
     * @throws ApiError
     */
    public static createBattleApiV1ShenbiBattlesPost(
        xApiKey: string,
        requestBody: BattleCreate,
    ): CancelablePromise<BattleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/battles',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Join Battle
     * Join an existing battle room as guest.
     *
     * The room must be in 'waiting' status with no guest yet.
     * After joining, the room status changes to 'ready'.
     * @param xApiKey
     * @param requestBody
     * @returns BattleResponse Successful Response
     * @throws ApiError
     */
    public static joinBattleApiV1ShenbiBattlesJoinPost(
        xApiKey: string,
        requestBody: BattleJoin,
    ): CancelablePromise<BattleResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/battles/join',
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Battle
     * Get the current state of a battle room.
     *
     * Both players should poll this endpoint every 500-1000ms to get updates.
     * Level data is only available after the host calls /start.
     * @param roomCode
     * @param xApiKey
     * @returns BattleResponse Successful Response
     * @throws ApiError
     */
    public static getBattleApiV1ShenbiBattlesRoomCodeGet(
        roomCode: string,
        xApiKey: string,
    ): CancelablePromise<BattleResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/shenbi/battles/{room_code}',
            path: {
                'room_code': roomCode,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Start Battle
     * Start the battle (host only).
     *
     * The host sets the level and starts the game.
     * Both players receive the level data when they poll the room state.
     * @param roomCode
     * @param xApiKey
     * @param requestBody
     * @returns BattleStartResponse Successful Response
     * @throws ApiError
     */
    public static startBattleApiV1ShenbiBattlesRoomCodeStartPost(
        roomCode: string,
        xApiKey: string,
        requestBody: BattleStart,
    ): CancelablePromise<BattleStartResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/battles/{room_code}/start',
            path: {
                'room_code': roomCode,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Complete Battle
     * Mark the player as completed.
     *
     * The first player to complete wins.
     * The code parameter stores the player's solution.
     * @param roomCode
     * @param xApiKey
     * @param requestBody
     * @returns BattleCompleteResponse Successful Response
     * @throws ApiError
     */
    public static completeBattleApiV1ShenbiBattlesRoomCodeCompletePost(
        roomCode: string,
        xApiKey: string,
        requestBody: BattleComplete,
    ): CancelablePromise<BattleCompleteResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/battles/{room_code}/complete',
            path: {
                'room_code': roomCode,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Leave Battle
     * Leave the battle room.
     *
     * Side effects:
     * - If host leaves before game starts: room is deleted (expired)
     * - If guest leaves before game starts: room goes back to waiting
     * - If any player leaves during game: other player wins by forfeit
     * @param roomCode
     * @param xApiKey
     * @returns BattleLeaveResponse Successful Response
     * @throws ApiError
     */
    public static leaveBattleApiV1ShenbiBattlesRoomCodeLeavePost(
        roomCode: string,
        xApiKey: string,
    ): CancelablePromise<BattleLeaveResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/shenbi/battles/{room_code}/leave',
            path: {
                'room_code': roomCode,
            },
            headers: {
                'X-API-Key': xApiKey,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
