from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket

class Broadcaster(WebSocket):
    def handleMessage(self):
        conns = self.server.connections.values()
        lel = self.data.replace('{"data"','{"sender":%s,"data"' % conns.index(self))
        # print lel
        for client in conns:
            client.sendMessage(lel)

PORT = 8080
try:
    server = SimpleWebSocketServer('', PORT, Broadcaster)
    print "Running WebSocket server on %s" % PORT
    server.serveforever()
except KeyboardInterrupt:
    print "Stopping server"
finally:
    server.close()
