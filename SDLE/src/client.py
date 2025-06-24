import os
import zmq
import uuid
import json

from clientInterface import ClientInterface

from shoppingList import CRDTShoppingList

class Client:
    def __init__(self, port, server_port = 5555):
        self.port = port
        self.database_path = f"dbs/client/cl{port}.json"
        self.server_port = server_port

        self.config_server_socket()

        self.lists = {}
        self.idCounter = 0
        self.load_lists()
    
    def store_lists(self):
        # create a json file with all the lists
        with open(self.database_path, "w") as f:
            content = {
                item : self.lists[item].to_dict() for item in self.lists
            }
            f.write(json.dumps(content, indent=2))

    def load_lists(self):
        # load the lists from a json file
        try:
            with open(self.database_path, "r") as f:
                content = json.loads(f.read())
                for key, value in content.items():
                    list = CRDTShoppingList.from_data(value)
                    self.lists[key] = list
                    if list.list_id >= self.idCounter : self.idCounter = list.list_id +1
        except FileNotFoundError:
            pass
        except json.JSONDecodeError:
            pass
    
    def config_server_socket(self):
        # Configuração do ZMQ
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.REQ)  # REQ-REP para comunicação simples
        self.socket.connect(f"tcp://localhost:{self.server_port}")

        # makke a poller to check for updates with a timeout of 1000ms
        self.poller = zmq.Poller()
        self.poller.register(self.socket, zmq.POLLIN)
    
    def update_item_quantity(self, list_id, item_name, quantity):
        # check if quantity is a number
        try:
            quantity = int(quantity)
        except:
            return "Quantity must be a number"
        if(quantity < 0):
            return "Quantity must be a positive number"
        if list_id not in self.lists:
            return "List not found"
        if not self.lists[list_id].contains_item(item_name):
            return "List item not found"
        delta = quantity - self.lists[list_id].get_item_value(item_name)
        self.lists[list_id].update_quantity(item_name, delta)
        self.store_lists()
        return "Quantity updated successfully"

    
    def add_item_to_list(self, list_id, item_name, target):
        # check if target is a number
        try:
            target = int(target)
        except:
            return "Target must be a number"
        if target < 0:
            return "Target must be a positive number"
        # Add an item to a list in the database
        if list_id not in self.lists:
            return "List not found"
        self.lists[list_id].add_item(item_name,"count", target)
        self.store_lists()
        return "Item added successfully"
    
    def get_lists(self):
        # Get all lists
        return {l : self.lists[l].read() for l in self.lists}
    
    def get_list(self, list_id):
        # Get a list by its id
        if list_id not in self.lists:
            return "List not found"
        return self.lists[list_id].read()
    
    def remove_item(self, list_id, item_name):
        self.lists[list_id].remove_item(item_name)
        self.store_lists()
        return "Item removed successfully"

    def create_list(self,name):
        list_id = self.idCounter
        self.idCounter += 1
        list_url = str(uuid.uuid4())
        replica_id = str(uuid.uuid4())
        self.lists[list_id] = CRDTShoppingList(list_id, name, list_url, replica_id)
        self.store_lists()
        return list_id

    def update_quantity(self, list_id, item_name, quantity):
        if list_id not in self.lists:
            return "List not found"
        delta = quantity - self.lists[list_id].quantities[item_name].value
        self.lists[list_id].update_quantity(item_name, delta)
        self.store_lists()
        return "Quantity updated successfully"

    def server_get(self, url):
        # get the list from the server
        message = {
            "type": "get",
            "url": url
        }
        self.socket.send_json(message)
        socks = dict(self.poller.poll(1000))
        if socks.get(self.socket) == zmq.POLLIN:
            res = self.socket.recv_json()
        else:
            res = "Timeout"
        return res
    
    def server_put(self, url, list):
        message = {
            "type": "put",
            "url": url,
            "list": list.to_dict()
        }
        self.socket.send_json(message)
        poller = zmq.Poller()
        poller.register(self.socket, zmq.POLLIN)
        response = dict(poller.poll(timeout=4000)) # 4 second timeout
        if response.get(self.socket) == zmq.POLLIN:
            response = self.socket.recv_json()
        else:
            response = "Timeout"
            # restart the connection
            self.config_server_socket()
        return response
    
    def remove_list(self, list_id):
        if list_id not in self.lists:
            return
        del self.lists[list_id]
        self.store_lists()
    
    def add_list_from_server(self, url):
        # get the list from the server
        res = self.server_get(url)
        if (res == "Timeout"):
            return "Error getting list"
        elif (res["status"] == "NOT_FOUND"):
            return "List not found"
        elif (res["status"] == "error"):
            return res["error"]
        # add the list to the client
        list = CRDTShoppingList.from_data(res["list"])
        self.lists[self.idCounter] = list.replicate(str(uuid.uuid4()))
        list.list_id =self.idCounter
        self.idCounter += 1
        self.store_lists()
        return self.idCounter - 1
    
    def delete_list(self, list_id):
        if list_id not in self.lists:
            return False
        
        list = self.lists[list_id]
        list.eliminate()
        self.store_lists()


    
    def server_delete(self,url):
        # delete the list from the server
        message = {
            "type": "delete",
            "url": url
        }
        self.socket.send_json(message)
        socks = dict(self.poller.poll(1000))
        if socks.get(self.socket) == zmq.POLLIN:
            res = self.socket.recv_json()
        else:
            res = "Timeout"
        return res
    
    def sync_list(self,list_id):
        # Sync a list with the server
        list = self.lists.get(list_id, None)
        if list is None:
            return "Error: List not found"
        url = list.list_url
        # put the list on the server
        res = None
        succeded = False
        error = ""
        for i in range(0,3): # attempt to write 3 times
            res = self.server_put(url, list)
            if (res == "Timeout"):
                error= "Error syncing list"
                continue
            elif (res["status"] == "error"):
                error= res["error"]
                continue
            # update the list with the server response
            if "list" not in res:
                error="Error syncing list"
                continue
            succeded = True
            break
        if not succeded:
            return error
        self.update_list(list_id, CRDTShoppingList.from_data(res["list"]))
        self.store_lists()
        return "List synced successfully"

    def update_list(self, list_id, updated_list):
        #merge with our list
        self.lists[list_id].merge(updated_list)
    
if __name__ == "__main__":
    port = int(os.sys.argv[1]) if len(os.sys.argv) > 1 else 3000 # can be used to host a local website for client interaction
    server_port = 5555  # Porta do servidor
    updates_port = 5556  # Porta de updates das listas
    client = Client(port)

    # start client interface here
    interface = ClientInterface(client)
    interface.start()





    










