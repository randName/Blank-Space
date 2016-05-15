from websocket import create_connection
from serial import Serial
from time import time, sleep
from json import dumps

def getData( s ):
    if s[0] == "Hover":
        return None
    elif s[0] == "E":
        n = int(s[2])
        return ('Right','Left','Up','Down')[n-1] if s[1] == '1' else n
    return tuple( int(i) for i in s )

try:
    ws = create_connection("ws://localhost:8080/")
    ser = Serial('COM3',115200)
    lasttime = time()

    oph = (58,10,56,18,54,10,32,0,0,166,67,0,0,105,67)
#        0,192, 24,68, 0,0, 198,67, # 17 18 21 22 x/y-end
#        0,192, 24,68, 0,0, 198,67, # 25 26 29 30 x/y-start
    opt = (0,192, 0,60, 0,0, 0,60)+(18,16)+(119,24,56,65)*4
    
    def opm(x,y):
        return (0,192)+(x%256,x>>8)+(0,0)+(y%256,y>>8)
    
    def gethack(x,y):
        # 550 470
        pz = oph + opm(17000+(x/2),17000+(512-y/2))*2 + opt
        return '{"type":"ink","data":{"data":{%s}}}' % ','.join( '"%s":%s'%(i,v) for i,v in enumerate(pz) )

    while True:
        rd = getData( ser.readline().strip().split() )
        if time() - lasttime > 0.02:
            if isinstance(rd, tuple):
                ws.send( gethack( rd[0], rd[1] ) )
            elif isinstance(rd, int):
                pass
            else:
                ws.send('{"type":"clear"}')
            lasttime = time()
except KeyboardInterrupt:
    pass
finally:
    ws.close()
    ser.close()
