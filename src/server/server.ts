import WebSocket from 'ws';
import fetch from 'isomorphic-unfetch';
import { Channel } from './csp';
import { Parser } from '../parser';
import {
  GatewayEvent,
  GatewayCommandHeartbeat,
  GatewayCommandIdentify,
} from './types';

const API_VERSION = 6;

export type DiscordOutboundMessage = {};

export type DiscordMessage = {};

// T needs to be the outbound message construct
export type CommandServerOptions = {
  /**
   * Discord bot auth token
   */
  token: string;
  /**
   * Putting messages in this channel will output them to Discord
   */
  outbound: Channel<DiscordOutboundMessage>;
};

export type CommandServer = {
  readonly socket: null | WebSocket;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  command: (commandString: string, channel: Channel<DiscordMessage>) => void;
};

export function createServer(options: CommandServerOptions): CommandServer {
  const { token } = options;
  const parser = new Parser();
  let heartbeatInterval: NodeJS.Timeout | null = null;
  let heartbeatAck = false;
  let lastSequenceId: number | null = null;
  // let sessionId: string = '';

  /**
   * Open a websocket to the discord gateway
   * @param baseSocketUrl tthe url from the initial hello
   */
  function openSocketConnection(baseSocketUrl: string): Promise<WebSocket> {
    return new Promise(resolve => {
      const url = `${baseSocketUrl}?v=${API_VERSION}&encoding=json`;
      const connection = new WebSocket(url);
      connection.on('close', (code, reason) => {
        console.log('websocket close event:', code, reason);
      });
      connection.on('error', error => {
        console.error('websocket error event:', error);
      });
      connection.on('message', data => {
        console.log('websocket message event:', data);

        const dat = JSON.parse(data.toString('utf8')) as GatewayEvent;
        if (dat.op === 1) {
          // sometimes the gateway will ask for a heartbeat,
          // so give them one!
          // https://discordapp.com/developers/docs/topics/gateway#heartbeating
          sendHeartbeat(connection);
        } else if (dat.op === 10) {
          // TODO: turn these into messages for a channel to handle
          const interval = dat.d.heartbeat_interval;
          sendHeartbeat(connection);
          startHeartbeat(connection, interval);
          sendIdentify(connection);
        } else if (dat.op === 11) {
          heartbeatAck = true;
        } else if (dat.op === 0 && dat.t === 'READY') {
          // sessionId = dat.d.session_id;
          lastSequenceId = dat.s;
          resolve(connection);
        } else if (dat.op === 0 && dat.t === 'MESSAGE_CREATE') {
          lastSequenceId = dat.s;
        }
      });

      connection.on('open', () => {
        console.log('websocket open event');
      });
      connection.on('ping', data => {
        console.log('websocket ping event:', data.toString('utf8'));
      });
      connection.on('pong', data => {
        console.log('websocket pong event:', data.toString('utf8'));
      });
      connection.on('unexpected-response', (_, response) => {
        console.error(
          `websocket unexpected-response event: status (${response.statusCode}), statusMessage (${response.statusMessage})`
        );
      });
      connection.on('upgrade', response => {
        console.log(
          `websocket upgrade event: status (${response.statusMessage}), statusMessage (${response.statusMessage})`
        );
      });
    });
  }

  function startHeartbeat(socket: WebSocket, interval: number) {
    heartbeatInterval = global.setInterval(() => {
      // only send heartbeats if we got an ack for the last one.
      if (heartbeatAck) {
        sendHeartbeat(socket);
      } else {
        // close connection
        // reconnect by starting from scratch
        // try to resume via GatewayCommandResume
        throw new Error('Implement resuming. Zombied connection detected');
      }
    }, interval);
  }

  function sendHeartbeat(socket: WebSocket) {
    heartbeatAck = false;
    const beat: GatewayCommandHeartbeat = {
      op: 1,
      d: lastSequenceId,
    };
    socket.send(JSON.stringify(beat));
  }

  function sendIdentify(socket: WebSocket) {
    const ident: GatewayCommandIdentify = {
      op: 2,
      d: {
        token,
        properties: {
          $browser: 'NodeJs',
          $device: 'RaspberryPi Model 4b',
          $os: 'Raspbian buster',
        },
        // https://discordapp.com/developers/docs/topics/gateway#gateway-intents
        intents: 512, // 1 << 9 only
      },
    };

    socket.send(JSON.stringify(ident));
  }

  async function handleCommand() {
    return 'TODO: patch parser to return channel | null';
  }

  let socket: WebSocket | null = null;
  return {
    socket: socket,
    async start() {
      const gateway = await getGatewayConnection(token);
      socket = await openSocketConnection(gateway.url);
    },
    async stop() {
      if (socket) {
        socket.close();
      }

      if (heartbeatInterval) {
        global.clearInterval(heartbeatInterval);
      }

      return new Promise(r => {
        process.nextTick(r);
      });
    },
    command(commandString, _channel) {
      parser.setCommand(commandString, '', handleCommand);
    },
  };
}

/**
 * Initiat connection to gateway
 */

type GatewayBotResponse = {
  url: string;
  shards: number;
  session_start_limit: {
    total: number;
    remaining: number;
    reset_after: number; // in milliseconds
  };
};

async function getGatewayConnection(
  token: string
): Promise<GatewayBotResponse> {
  const response = await fetch(
    `https://discordapp.com/api/v${API_VERSION}/gateway/bot`,
    {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }
  );

  if (!response.ok)
    throw new Error(
      `Failed to initiate gateway connection. ${response.status} (${response.statusText})`
    );

  return await response.json();
}
