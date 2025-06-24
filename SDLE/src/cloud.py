


from broker import HashRingBroker
from worker import HashRingWorker
import threading
import time

#start the broker
broker = HashRingBroker()
broker_thread = threading.Thread(target=broker.run)

workers = []
# start 10 workers
print("!Instanciating workers")
for i in range(0,6):
    worker_port = str(5055 + i)
    worker_id = "worker"+ worker_port
    worker = HashRingWorker(worker_port=worker_port, worker_id=worker_id)
    worker_thread = threading.Thread(target=worker.run)
    workers.append((worker, worker_thread))

#start the broker
print("!Starting broker")
broker_thread.start()

#wait for a bit
time.sleep(0.1)

#start the workers
print("!Starting workers")
for worker, worker_thread in workers:
    worker_thread.start()

time.sleep(0.1)
try:
    input("Press Enter to stop...\n")
except KeyboardInterrupt as e:
    pass

broker.shut_down()
for worker, worker_thread in workers:
    worker.close()
for worker, worker_thread in workers:
    worker_thread.join()
broker_thread.join()

print("All done!")



