from SimpleHTTPServer import SimpleHTTPRequestHandler
from SocketServer import TCPServer

PORT = 8000
try:
    httpd = TCPServer(('', PORT), SimpleHTTPRequestHandler)
    print "Serving at port", PORT
    httpd.serve_forever()
except KeyboardInterrupt:
    print "Stopping server"
finally:
    server.close()
