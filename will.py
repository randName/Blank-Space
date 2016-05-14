import serial
from time import time

ser = serial.Serial('COM3',115200)

lasttime = time()

def getData( s ):
    if s[0] == "Hover":
        return None
    elif s[0] == "E":
        n = int(s[2])
        return ('Right','Left','Up','Down')[n-1] if s[1] == '1' else n
    return tuple( int(i) for i in s )

while True:
    rd = getData( ser.readline().strip().split() )
    if time() - lasttime > 0.1:
        print rd
        lasttime = time()