from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket

class SimpleEcho(WebSocket):
    def handleMessage(self):
        conn = self.server.connections.values().index(self)
        lel = self.data.replace('{"data"','{"sender":%s,"data"'%conn)
        for client in self.server.connections.itervalues():
            client.sendMessage(lel)

try:
    server = SimpleWebSocketServer('', 8080, SimpleEcho)
    server.serveforever()
except KeyboardInterrupt:
    server.socket.close()