l = []

while(True):
    z = (int(input())-212)/112
    x = (162-int(input()))/112

    l.append((x,0,z))
    con = input("continue?")
    if con == "no":
        break

for (x,y,z) in l:
    print("{:.3f}, {:.3f}, {:.3f},".format(x, y, z))