import zmq
import json
from hashring import HashRing
import base64
import time

class HashRingBroker:
    def __init__(self, frontend_port=5555, backend_port=5556):
        self.context = zmq.Context()
        
        # Frontend socket to receive client requests
        self.frontend = self.context.socket(zmq.ROUTER)
        self.frontend.bind(f"tcp://*:{frontend_port}")
        
        # Backend socket to communicate with workers
        self.backend = self.context.socket(zmq.ROUTER)
        self.backend.bind(f"tcp://*:{backend_port}")
        
        # Hash ring to manage workers
        self.hash_ring = HashRing()
        #self.hash_ring.load_ring("dbs/hash_ring.json")
        
        # Track worker and client identities
        self.workers = {}

        self.workers_heartbeats = {}

        self.stop = False
        
        
    def handle_client_request(self, client_id: str, request: dict):

        list = request.get('list', None)
        key = request.get('url', None)
        if not key: #assume the list is new
            self.frontend.send_multipart([
                client_id,
                b'',
                json.dumps({
                    'status':'error',
                    'error': 'List action must have a valid url'
                }).encode()
            ])

        preference_workers = self.hash_ring.get_preference_list(key, 6)
        print("preference list:",preference_workers)

        if len(preference_workers) == 0:
            # No workers available
            self.frontend.send_multipart([
                client_id,
                b'',
                json.dumps({
                    'status':'error',
                    'error': 'No workers available'
                }).encode()
            ])
            return

        first_alive_worker = None
        for worker in preference_workers:
            if self.is_worker_alive(worker[0]):
                first_alive_worker = worker
                break

        print(f"First alive worker: {first_alive_worker}")
        
        if first_alive_worker:
            # Forward request to appropriate worker
            print(f"Forwarding list action request to worker {first_alive_worker[0]}")
            self.backend.send_multipart([
                first_alive_worker[0].encode(),
                b'',
                json.dumps({
                    'client_id': base64.b64encode(client_id).decode('utf-8'),
                    'request': request,
                    'key': key,
                    'origin': 'client',
                    'preference_list': preference_workers
                }).encode()
            ])
        else:
            # No workers available
            self.frontend.send_multipart([
                client_id,
                b'',
                json.dumps({
                    'status':'error',
                    'error': 'Worker not available'
                }).encode()
            ])

    def handle_worker_registration(self, worker_id: str, msg: dict):
        # Add worker to hash ring
        slots = self.hash_ring.add_worker(worker_id, msg['worker_port'])
        print(f"Worker {worker_id} registered at slots {slots}")
        
        #self.hash_ring.debug_ring()

        # Confirm registration
        ring_data = self.hash_ring.to_string()
        self.backend.send_multipart([
            worker_id.encode(),
            b'',
            json.dumps({
                'status': 'registered',
                'ring': ring_data,
                'preference_list': self.hash_ring.get_preference_list(worker_id, 6)
            }).encode()
        ])

        #broadcast the new hash ring to all workers
        for worker in self.workers:
            self.backend.send_multipart([
                worker.encode(),
                b'',
                json.dumps({
                    'action': 'update_ring',
                    'ring': ring_data,
                    'origin': 'broker'
                }).encode()
            ])

        self.hash_ring.store_ring("dbs/hash_ring.json")

    def handle_worker_response(self, worker_id: str, msg: dict):
        # Forward worker response to client
        client_id = msg.get('client_id')

        if client_id:
            # Remove the client_id from the message before sending
            response = msg.get('response', {})

            # Send the response back to the original client
            self.frontend.send_multipart([
                base64.b64decode(client_id),
                b'',
                json.dumps(response).encode()
            ])
        else:
            print("Received worker response without client ID")

        self.workers[worker_id] = True

    def is_worker_alive(self, worker_id: str):# alive if it has had activity in the last 5 seconds (including a heartbeat which is sent every 2 seconds)
        res = worker_id in self.workers_heartbeats and time.time() - self.workers_heartbeats[worker_id] < 5
        print(f"Worker {worker_id} is alive: {res}")
        return res

    def shut_down(self):
        self.stop=True

    def run(self):
        try:
            # Use zmq.Poller for multiplexing
            poller = zmq.Poller()
            poller.register(self.frontend, zmq.POLLIN)
            poller.register(self.backend, zmq.POLLIN)

            print("Broker started. Waiting for messages...")

            while True:

                if self.stop:
                    self.close()
                    break
                try:
                    # add timeout to poller to prevent high CPU usage
                    socks = dict(poller.poll(timeout=1000))  # 1-second timeout

                    # Handle client requests
                    if socks.get(self.frontend) == zmq.POLLIN:
                        client_id, _, message = self.frontend.recv_multipart()
                        self.handle_client_request(client_id, json.loads(message))

                    # Handle worker responses or registrations
                    if socks.get(self.backend) == zmq.POLLIN:
                        envelop = self.backend.recv_multipart()
                        worker_id, message = envelop
                        worker_id = worker_id.decode()
                        msg = json.loads(message)

                        # Check if it's a worker registration
                        if 'action' in msg and msg['action'] == 'register':
                            self.handle_worker_registration(worker_id, msg)
                            self.workers_heartbeats[worker_id] = time.time()
                        elif 'action' in msg and msg['action'] == 'ready':
                            # Worker is ready to receive tasks
                            self.workers_heartbeats[worker_id] = time.time()
                        elif 'action' in msg and msg['action'] == 'heartbeat':
                            # answer the heartbeat
                            self.backend.send_multipart([
                                worker_id.encode(),
                                b'',
                                json.dumps({
                                    'action': 'heartbeat',
                                    'worker_id': worker_id,
                                    'origin': 'broker'
                                }).encode()
                            ])
                            self.workers_heartbeats[worker_id] = time.time()
                        else:
                            self.handle_worker_response(worker_id, msg)
                            self.workers_heartbeats[worker_id] = time.time()

                except Exception as e:
                    print(f"Error: {e}")
        except KeyboardInterrupt:
            print("Broker shutting down...")
        finally:
            self.close()

    def close(self):
        self.frontend.close()
        self.backend.close()
        self.context.term()

def main():
    broker = HashRingBroker()
    broker.run()

if __name__ == "__main__":
    main()