export type GatewayOpDispatch = 0;
export type GatewayOpHeartbeat = 1;
export type GatewayOpIdentify = 2;
// export type GatewayOpPresenceUpdate = 3;
// export type GatewayOpVoiceStateUpdate = 4;
export type GatewayOpResume = 6;
export type GatewayOpReconnect = 7;
// export type GatewayOpRequestGuildMembers = 8;
export type GatewayOpInvalidSesion = 9;
export type GatewayOpHello = 10;
export type GatewayOpHeartbeatACK = 11;

export type GatewayDispatchReady = {
  t: 'READY';
  s: number;
  op: GatewayOpDispatch;
  d: {
    /**
     * api version echoed back
     */
    v: number;
    /**
     * Remember this id! used to handle reconnects
     */
    session_id: string;
  };
};

export type GatewayDispatchResummed = {
  t: 'RESUMED';
  s: number;
  op: GatewayOpDispatch;
};

export type GatewayDispatchMessageUserCreated = {
  t: 'MESSAGE_CREATE';
  s: number;
  op: GatewayOpDispatch;
  d: {
    /**
     * Snowflake form
     */
    id: string;
    /**
     * Snowflake form
     */
    channel_id: string;
    /**
     * Snowflake form
     */
    guild_id?: string;
    author: User;
    timestamp: string;
    edited_timestamp: string | null;
    content: string;
  };
};

export type GatewayDispatchMessageWebhookCreated = {
  t: 'MESSAGE_CREATE';
  s: number;
  op: GatewayOpDispatch;
  d: {
    /**
     * Snowflake form
     */
    id: string;
    /**
     * Snowflake form
     */
    channel_id: string;
    /**
     * Snowflake form
     */
    guild_id?: string;
    author: WebhookUser;
    webhook_id: string;
    timestamp: string;
    edited_timestamp: string | null;
    content: string;
  };
};

export type GatewayDispatchMessageCreated =
  | GatewayDispatchMessageUserCreated
  | GatewayDispatchMessageWebhookCreated;

export type GatewayEventDispatch =
  | GatewayDispatchReady
  | GatewayDispatchResummed
  | GatewayDispatchMessageCreated;

export type GatewayEventReconnect = {
  op: GatewayOpReconnect;
};
export type GatewayEventInvalidSession = {
  op: GatewayOpInvalidSesion;
  /**
   * indicates whether the session may be resumable.
   */
  d: boolean;
};
export type GatewayEventHello = {
  op: GatewayOpHello;
  d: {
    /**
     *  milliseconds the client should heartbeat with
     */
    heartbeat_interval: number;
  };
};
export type GatewayEventHeartbeatACK = {
  op: GatewayOpHeartbeatACK;
};

export type GatewayEvent =
  | GatewayCommandHeartbeat
  | GatewayEventReconnect
  | GatewayEventInvalidSession
  | GatewayEventHello
  | GatewayEventHeartbeatACK
  | GatewayEventDispatch;

export type GatewayCommandHeartbeat = {
  op: GatewayOpHeartbeat;
  /**
   * sequence number of last message or null if not recieved one
   */
  d: number | null;
};

export type GatewayCommandIdentify = {
  op: GatewayOpIdentify;
  d: {
    token: string;
    properties: {
      $os: string;
      $browser: string;
      $device: string;
    };
    compress?: boolean;

    /**
     * value between 50 and 250, total number of members where the gateway will stop sending offline members in the guild member list
     */
    large_threshold?: number;
    shard?: [number, number];
    intents: number;
  };
};

export type GatewayCommandResume = {
  op: GatewayOpResume;
  d: {
    /**
     * Bot token
     */
    token: string;
    /**
     * from the last Ready event recieved
     */
    session_id: string;
    /**
     * last sequence number recieved from messages
     */
    seq: number;
  };
};

export type User = {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bot?: boolean;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
};

export type WebhookUser = {
  id: string;
  username: string;
  avatar?: string;
};
