import zmq
import json
import time
import uuid
import argparse
from hashring import HashRing
import threading

from shoppingList import CRDTShoppingList

class HashRingWorker:
    def __init__(self,worker_port=5855, backend_port=5556,broker_host='localhost', worker_id=None):
        # Create a unique worker ID if not provided
        self.worker_id = worker_id or str(uuid.uuid4())
        self.worker_port = worker_port
        
        # ZeroMQ context and socket setup
        self.context = zmq.Context()
        
        # Backend socket to communicate with broker
        self.backend = self.context.socket(zmq.DEALER)
        self.backend.setsockopt_string(zmq.IDENTITY, self.worker_id)
        self.backend.connect(f"tcp://{broker_host}:{backend_port}")

        # A socket to receive requests from other workers
        self.worker_socket = self.context.socket(zmq.ROUTER)
        self.backend.setsockopt_string(zmq.IDENTITY, self.worker_id)
        self.worker_socket.bind(f"tcp://*:{worker_port}")
        
        # Poller for handling messages
        self.poller = zmq.Poller()
        self.poller.register(self.backend, zmq.POLLIN)
        self.poller.register(self.worker_socket, zmq.POLLIN)
        self.database_path = f'dbs/worker/shopping_list_{worker_id}.json'

        # Thread-safe list storage
        self.lists_lock = threading.Lock()
        self.lists = {}
        
        # Asynchronous storage thread management
        self.stop_storage_thread = threading.Event()
        self.lists_changed = threading.Event()
        
        # Load initial lists
        self.load_lists()

        # Start async storage thread
        self.storage_thread = threading.Thread(target=self._async_store_lists, daemon=True)
        self.storage_thread.start()

        self.stop = False

        self.last_heartbeat = time.time()

    def _async_store_lists(self):
        """
        Async thread for periodically storing lists.
        Uses events to minimize unnecessary writes and ensure thread safety.
        """
        while not self.stop_storage_thread.is_set():
            # Wait for changes or timeout (whichever comes first)
            self.lists_changed.wait(timeout=1.0)
            
            if self.stop_storage_thread.is_set():
                break
            
            # If changes occurred, store the lists
            if self.lists_changed.is_set():
                try:
                    # Acquire lock to safely copy and write lists
                    with self.lists_lock:
                        content = {
                            item: self.lists[item].to_dict() for item in self.lists
                        }
                    
                    # Write to file outside of the lock
                    with open(self.database_path, "w") as f:
                        f.write(json.dumps(content, indent=2))
                    
                    # Clear the changed flag
                    self.lists_changed.clear()
                except Exception as e:
                    print(f"Error in async list storage: {e}")


    def store_lists(self):
        """
        Mark lists as changed for async storage thread
        """
        self.lists_changed.set()

    def close(self):
        self.stop = True
        self.stop_storage_thread.set()
        if self.storage_thread:
            self.storage_thread.join()

    def load_lists(self):
        """
        Load lists from file, using lock for thread safety
        """
        try:
            with open(self.database_path, "r") as f:
                content = json.loads(f.read())
                # Use lock when modifying lists
                with self.lists_lock:
                    for key, value in content.items():
                        self.lists[key] = CRDTShoppingList.from_data(value)
        except FileNotFoundError:
            pass

    def propagate_update(self, list, worker_port):
        print("Propagating list")
        context = zmq.Context()
        socket = context.socket(zmq.REQ)
        try:
            socket.connect(f"tcp://localhost:{worker_port}")
            url = list.get('list_url', None)
            socket.send_json({
                'type': 'put',
                'list': list,
                'url': url
            })
            print("Second phase : awaiting response")

            # Wait for the response
            poller = zmq.Poller()
            poller.register(socket, zmq.POLLIN)
            socks = dict(poller.poll(1200))  # 1.2-second timeout
            print("Finished timeout or received response")

            if socks.get(socket) == zmq.POLLIN:
                response = socket.recv_json()
                print("here2")
                if response and response.get('status', None):
                    print("here3")
                    if response['status'] in ('UPDATED', 'CREATED'):
                        print("here4")
                        list_data = response.get('list', None)
                        print(list_data)
                        if list_data is not None:
                            # Merge the list
                            list = CRDTShoppingList.from_data(list_data)
                            with self.lists_lock:
                                self.lists[url].merge(list)  # merge lists
                                self.store_lists()
                                return True
            socket.setsockopt(zmq.LINGER, 0)
            socket.close()
            context.term()
            print("Something")
            return False
        except Exception as e:
            print(f"Error during propagation: {e}")
            return False
        finally:
            # Ensure the socket and context are properly closed
            socket.close()
            context.term()


    def receive_from_broker(self):
        """Receive a message from the broker"""
        message = self.backend.recv_multipart()
        return json.loads(message[1].decode())

    def register_with_broker(self):
        """Register the worker with the broker"""
        registration_msg = {
            'action': 'register',
            'worker_name': self.worker_id,
            'worker_port': self.worker_port
        }
        
        self.backend.send_json(registration_msg)
        
        # Wait for registration confirmation
        socks = dict(self.poller.poll(timeout=5000))  # 5-second timeout
        if socks.get(self.backend) == zmq.POLLIN:
            response = self.receive_from_broker()
            print(f"Registration response: {response}")

            # get the ring from the broker
            self.hash_ring = HashRing.from_string(response.get('ring'))
            preference_list = response.get('preference_list')
            self.obtain_lists(preference_list)
            return response.get('status') == 'registered'
        
        print("Registration timeout or failed")
        return False
    
    def request_list(self,worker_id,worker_port,url = None):
        print("Requesting list(s) from ", worker_id)
        if url: print ("Requesting list with url:", url)
        else: print("requesting all lists")
        #open a connection to the worker
        context = zmq.Context()
        socket = context.socket(zmq.REQ)
        socket.connect(f"tcp://localhost:{worker_port}")
        #send the list to the worker
        socket.send_json({
            'type': 'get',
            'url': url # None if all lists are being requested
        })
        #wait for the response
        poller = zmq.Poller()
        poller.register(socket, zmq.POLLIN)
        socks = dict(poller.poll(2000))
        if socks.get(socket) == zmq.POLLIN:
            response = socket.recv_json()
            print("Response from worker: ", response)
            return response
        return {
            'status':'error',
            'error':'Unable to get list(s) from worker'
        }
        
    
    def obtain_lists(self,preference_list):
        # send a request to get all the lists to each worker in order of preference until we get a response
        if preference_list == []:
            return
        succ = False
        res = {
            'status' : 'error',
            'error': 'Error obtaning lists from workers ahead'
        }
        for worker_id, worker_port in preference_list:
            if worker_port == self.worker_port:
                continue
            res = self.request_list(worker_id,worker_port)
            if res.get('status', 'error') == 'error':
                continue

            lists = res.get('lists',{})
            for url,list_data in lists.items():
                if url in self.lists: # merge list
                    self.merge_list_from_data(list_data, url)
                else: 
                    self.add_list_from_data(list_data,url)
            self.store_lists()
            succ = True
            break
        if not succ:
            print(res.get('error', 'Error obtaning lists from workers ahead'))

    def process_request(self, request, preference_list):
        """
        Process a client request.
        """
        if(request.get('type') == 'get'):
            # check if we have the list
            res = self.handle_client_get_request(request, preference_list)
            return res
            
        elif(request.get('type') == 'put'):
            return self.handle_client_put_request(request, preference_list)
        # Simple echo response with some added processing
        return {
            'status': 'Invalid request',
            'request': request
        }
    
    def handle_client_get_request(self,request,preference_list):
        """
        Hadnles a get request from a client
        Must attempt to read the list from at least one worker (part of the policy)
        """
        url = request.get('url')
        if url in self.lists:
            return {
                'status': 'OK',
                'url': url,
                'list': self.lists[url].to_dict()
            }
        else:
            # we need to get the list from a worker
            succ = False
            res = {
                'status' : 'error',
                'error': 'Error obtaning lists from workers ahead'
            }
            for worker_id, worker_port in preference_list:
                if worker_port == self.worker_port:
                    continue
                res = self.request_list(worker_id,worker_port,url)
                if res.get('status', 'error') == 'error':
                    continue
                list_data = res.get('list', None)
                if list_data:
                    self.add_list_from_data(list_data,url) # store the list for future reference
                    self.store_lists()
                    succ = True
                    break
            if not succ:
                return res
            return {
                'status': 'OK',
                'url': url,
                'list': self.lists[url].to_dict()
            }
    
    def handle_client_put_request(self, request, preference_list):
        # check if we have the list
        url = request.get('url')
        list_data = request.get('list', None)
        
        if list_data is None or url is None:
            return {
                'status': 'error',
                'error': 'Invalid request'
            }
        res = self.put_list(list_data, url)
        
        if preference_list == []:
            print("Empty preference list received")
        print("worker preference list: ",preference_list)
        # for each worker after the current worker attempt to retrieve the list
        index_of_self = -1
        for i in range(len(preference_list)):
            if preference_list[i][1] == self.worker_port:
                index_of_self = i
                break
        if index_of_self == -1:
            index_of_self = len(preference_list)
            
        n = min(2, len(preference_list)-1-index_of_self) # up to the number of workers in the front of it
        succ = 0
        # for each worker after the current worker attempt to retrieve the list
        index = index_of_self+1
        while succ < n and index < len(preference_list):
            worker, worker_port = preference_list[index]
            res = self.propagate_update(list_data, worker_port)
            if res == True:
                print("Propagated List")
                succ += 1
            else: print("Failed")
            index += 1

        if succ < n:
            # if we dont manage to get the n-1 lists, we return an error
            return {
                'status': 'error',
                'error': 'Could not get the n-1 lists'
            }
        
        return {
            'status': 'OK',
            'request': request,
            'url': url,
            'list': self.lists[url].to_dict()
        }
    
    def signal_ready(self):
        """Send a request to the broker so the worker is able to send a task to worker"""
        self.backend.send_json({
            'action': 'ready',
            'worker_id': self.worker_id
        })
        return
    
    def handle_client_request(self, message):
        # Extract client ID and original request
        client_id = message.get('client_id')
        request = message.get('request', {})
        preference_list = message.get('preference_list', [])
        
        # Process the request
        response = self.process_request(request, preference_list)
        
        # Send response back to broker
        full_response = {
            'action': 'response',
            'client_id': client_id,
            'response': response
        }
        self.backend.send_json(full_response)
        print(f"Processed request from client {client_id}")

    def add_list_from_data(self, list_data, list_url):
        """
        Thread-safe method to add a list from data
        Note: Assumes the lock is already held when called
        """
        if list_url is None:
            list_url = list_data.get('list_url',None)
        list = CRDTShoppingList.from_data(list_data)
        list.replicate(str(uuid.uuid4()))
        self.lists[list_url] = list
        return list
    
    def merge_list_from_data(self, list_data, list_url):
        """
        Thread-safe method to merge list data
        """
        with self.lists_lock:
            if list_url in self.lists:
                self.lists[list_url].merge(CRDTShoppingList.from_data(list_data))

    def put_list(self, list_data, list_url):
        """
        Thread-safe method to put/update a list
        """
        if list_url is None:
            return {
                'status': 'error',
                'error': 'Received list without an URL'
            }
        
        # Use lock for thread-safe list modification
        with self.lists_lock:
            if list_url not in self.lists:
                list = self.add_list_from_data(list_data, list_url)
                # Mark for async storage
                self.store_lists()
                return {
                    'status': 'CREATED',
                    'url': list_url,
                    'list': list.to_dict()
                }
            
            # Update existing list
            list = self.lists[list_url]
            list.merge(CRDTShoppingList.from_data(list_data))
            self.lists[list_url] = list
        
        # Mark for async storage
        self.store_lists()
        
        return {
            'status': 'UPDATED',
            'url': list_url,
            'list': list.to_dict()
        }
    
    def get_lists(self):
        with self.lists_lock:
            return {
                'status':'OK',
                'lists': {url: list.to_dict() for url,list in self.lists.items()}
            }
        
    def get_list(self, list_url):
        with self.lists_lock:
            if list_url not in self.lists:
                return {
                    'status': 'error',
                    'error': 'List not found'
                }
            list = self.lists[list_url]
            return {
                'status':'OK',
                'list': list.to_dict()
            }
    
    def handle_worker_message(self, message):
        """
        Handle worker messages with thread safety
        """
        response = {
            "status": "error",
            "error" : "Invalid request type"
        }
        if message.get("type", None) == "put":
            list_data = message.get("list")
            url = message.get("url")
            response = self.put_list(list_data, url)
            print("List ", list_data['list_name'], " propagated to worker ", self.worker_id)
        if message.get("type", None) == "get" and message.get("url", None) is None:
            response = self.get_lists()
        elif message.get("type", None) == "get":
            url = message.get("url")
            response = self.get_list(url)
        return response

    def send_heartbeat(self):
        """Send a heartbeat to the broker"""
        self.backend.send_json({
            'action': 'heartbeat',
            'worker_id': self.worker_id
        })

    def run(self):
        """Main worker loop"""
        # First, register with the broker
        if not self.register_with_broker():
            print("Failed to register with broker. Exiting.")
            return
        
        print(f"Worker {self.worker_id} ready and waiting for requests...")
        self.signal_ready()

        while True:
            if self.stop: 
                print("Stoping worker")
                break
            try:
                socks = dict(self.poller.poll(500)) # timesout at 2 seconds
                
                if socks.get(self.backend) == zmq.POLLIN:
                    # Receive multipart message
                    message = self.receive_from_broker()
                    
                    if(message.get('action') == 'update_ring' and message.get('origin') == 'broker'): # Update hash ring
                        print("Updating hash ring")
                        if (message.get('ring', None)):
                            self.hash_ring = HashRing.from_string(message.get('ring'))
                        print(f"Updated hash ring: {self.hash_ring}")
                        self.signal_ready()
                    if(message.get('action') == 'heartbeat' and message.get('origin') == 'broker'): # Handle heartbeat
                        print(f"Heartbeat from broker")
                    else: # Handle client request
                        print(f"Received message: {message}")
                        self.handle_client_request(message)

                if socks.get(self.worker_socket) == zmq.POLLIN:
                    # Receive multipart message
                    worker_id, _, message = self.worker_socket.recv_multipart()
                    message = json.loads(message.decode())
                    # Handle the message
                    response = self.handle_worker_message(message)
                    self.worker_socket.send_multipart(
                        [
                            worker_id,
                            _,
                            json.dumps(response).encode()
                        ]
                    )

                if time.time() - self.last_heartbeat > 1.5: # Send heartbeat around every 1.5 seconds (2 seconds accounting for processing time)
                    self.send_heartbeat()
                    self.last_heartbeat = time.time()

            except Exception as e:
                print(f"Error in worker {self.worker_id}: {e}")
                time.sleep(1)  # Prevent tight error loop

def main():
    # Create and run a worker
    argpar = argparse.ArgumentParser()
    argpar.add_argument('worker_port', type=int)
    argpar.add_argument('--worker_id', type=str, default=None)
    
    args = argpar.parse_args()
    if args.worker_id is None:
        args.worker_id = 'worker-' + str(args.worker_port)
    worker = HashRingWorker(worker_port=args.worker_port, worker_id=args.worker_id)
    worker.run()

if __name__ == '__main__':
    main()