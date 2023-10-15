import fetch from "node-fetch";
import { WebSocket, createWebSocketStream } from "ws";
import chai from "chai";
import chaiString from "chai-string";


// Wrap WebSocket to provide a async iterator to yield messages
// This is a workaround for the lack of support for async iterators in ws
// It avoids the need to spawn a new event handler + promise for each message
class WebSocketStream extends WebSocket {
  constructor(url) {
    super(url);
    this.stream = createWebSocketStream(this, { objectMode: true, readableObjectMode: true });
    // ignore errors
    this.stream.on("error", () => { });
  }

  // implement async iterator
  async* iterator() {
    for await (const message of this.stream.iterator()) {
      yield message;
    }
  }
}

chai.use(chaiString);

globalThis.fetch = fetch;
globalThis.WebSocket = WebSocketStream;
globalThis.chai = chai;