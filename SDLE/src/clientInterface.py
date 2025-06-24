import time

class ClientInterface:
    def __init__(self, client):
        self.client = client
        self.list_id = None

    def display_menu(self):
        print("\nEnter a command:")
        print("1. Create a new shopping list")
        print("2. Open a list")
        print("3. Add list with it's url")
        print("4. Quit")

    def create_new_list(self):
        # input list name
        list_name = input("Enter the new list name: ").strip()
        if len(list_name) < 3 :
            print("List name is too short")
            return
        # call create_list from client
        list_id = self.client.create_list(list_name)
        # enter the list
        self.list_id = list_id
        self.manipulate_list()

    def add_item_to_list(self):
        # input item name
        item_name = input("Enter the item name: ").strip()
        # input target quantity
        quantity = input("Enter the target quantity: ").strip()
        # call add_item from client
        res = self.client.add_item_to_list(self.list_id, item_name, quantity)
        if res != "Item added successfully":
            print(res)

    def view_list(self):
        # input list name
        list_name = input("Enter the list name: ").strip()
        # call view_list from client
        res = self.client.get_list(list_name)
        # print the result
        print(res)

    def update_item_quantity(self):
        # input item name
        item_name = input("Enter the item name: ").strip()
        # input change
        change = input("Enter new quantity: ").strip()
        
        change = int(change)
        # call update_item_quantity from client
        res = self.client.update_item_quantity(self.list_id, item_name, change)
        if res != "Item updated successfully":
            print(res)

    def remove_item_from_list(self):
        # input item name
        item_name = input("Enter the item name: ").strip()
        # call remove_item from client
        res = self.client.remove_item(self.list_id, item_name)
        if res != "Item removed successfully":
            print(res)

    def sync_list(self):
        # call sync_list from client
        res = self.client.sync_list(self.list_id)
        print(res)
        time.sleep(0.5)

    def print_list(self, list):
        print("\n--------------------------------")
        print(f"List {list['name']} ({list['url']}) items:" if list['url'] is not None else f"List {list['name']} items:")
        if (list['items'] == {}):
            print("    No items in the list")
        for key,value in list['items'].items():
            print(f"    - {key} : {value}")
        print("----------------------------------")

    def print_list_operations_menu(self):
        print("Enter a command:")
        print("1. Add item to list")
        print("2. Update item quantity")
        print("3. Remove item from list")
        print("4. Sync list")
        print("5. Remove list")
        print("6. Back")

    def delete_list(self):
        # comfirm choice
        comf = input("Do you comfirm you want to delete this list (Yes/No): ")
        if (comf == "Yes" or comf == "yes"):
            self.client.delete_list(self.list_id)
            self.list_id = None

    def remove_list(self):
        # comfirm choice
        comf = input("Do you comfirm you want to remove this list (Yes/No): ")
        if (comf == "Yes" or comf == "yes"):
            self.client.remove_list(self.list_id)
            self.list_id = None

    def manipulate_list(self):

        while True:
            list = self.client.get_list(self.list_id)
            if list is None:
                # deleted list
                print("This list has been deleted.")
                input("Press any key to go back... ")
                break
            self.print_list(list)
            self.print_list_operations_menu()
            choice = input("Choose an option (1-5): ").strip()
            if choice == "1":
                self.add_item_to_list()
            elif choice == "2":
                self.update_item_quantity()
            elif choice == "3":
                self.remove_item_from_list()
            elif choice == "4":
                self.sync_list()
            elif choice == "5":
                self.remove_list()
            elif choice == "6":
                break
            else:
                print("Invalid option. Please try again.")
                time.sleep(0.5)

            if self.list_id is None:
                break
    def open_list(self):
        while True:
            print("\nLists:")
            lists = self.client.get_lists()
            count = 1
            row = ""
            column_width =20  # Adjust the width as needed

            for l in lists:
                if (lists[l] is None):
                    continue
                row += f"{count}. {lists[l]['name']:<{column_width}}"
                if count % 3 == 0:
                    print(row)
                    row = ""
                count += 1

            # Print any remaining items in the last row
            if row:
                print(row)
            
            list_name = input("List index or name (or 'back'): ").strip()
            if list_name == "back":
                break
            try:
                list_index = int(list_name) - 1
                if list_index < 0 or list_index >= len(lists):
                    print("Invalid list index. Please try again.")
                    time.sleep(0.5)
                    continue
                list_id = list(lists.keys())[list_index]
            except ValueError:
                # Check if the input is a valid list name
                list_id = None
                for key, value in lists.items():
                    if value['name'] == list_name:
                        list_id = key
                        break
                if list_id is None:
                    print("Invalid list name. Please try again.")
                    time.sleep(0.5)
                    continue
            self.list_id = list_id
            self.manipulate_list()
            break # exit once the list has been manipulated
    def add_url_list(self):
        # input list url
        list_url = input("Enter the list url: ").strip()
        # call add_list from client
        res = self.client.add_list_from_server(list_url)
        if type(res) == str:
            print(res)
            time.sleep(0.5)
            return
        # enter the list
        self.list_id = res
        self.manipulate_list()
        

    def start(self):
        while True:
            self.display_menu()
            choice = input("Choose an option (1-4): ").strip()
            if choice == "1":
                self.create_new_list()
            elif choice == "2":
                self.open_list()
            elif choice == "3":
                self.add_url_list()
            elif choice == "4":
                self.client.store_lists()
                print("Exiting the client. Goodbye!")
                break
            else:
                print("Invalid option. Please try again.")
                time.sleep(0.5) # to give the user time to read the message