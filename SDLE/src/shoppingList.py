import uuid
from typing import Dict, Set, Tuple

class PNCounter:
    def __init__(self):
        self.positive = {}  # {replica_id: value}
        self.negative = {}  # {replica_id: value}

    def increment(self, replica_id: str, value: int = 1):
        if replica_id not in self.positive:
            self.positive[replica_id] = 0
        self.positive[replica_id] += value

    def decrement(self, replica_id: str, value: int = 1):
        if replica_id not in self.negative:
            self.negative[replica_id] = 0
        self.negative[replica_id] += value

    def value(self):
        return sum(self.positive.values()) - sum(self.negative.values())

    def merge(self, other):
        # Merge positive counters
        for replica_id, count in other.positive.items():
            if replica_id not in self.positive or self.positive[replica_id] < count:
                self.positive[replica_id] = count
        
        # Merge negative counters
        for replica_id, count in other.negative.items():
            if replica_id not in self.negative or self.negative[replica_id] < count:
                self.negative[replica_id] = count

class AWORSet:
    def __init__(self, replica_id: str):
        self.replica_id = replica_id
        self.elements: Dict[str, Set[str]] = {}  # {element: {add_ids}}
        self.tombstones: Dict[str, Set[str]] = {}  # {element: {remove_ids}}

    def add(self, element: str):
        add_id = str(uuid.uuid4())
        if element not in self.elements:
            self.elements[element] = set()
        self.elements[element].add(add_id)

    def remove(self, element: str):
        if element in self.elements:
            remove_id = str(uuid.uuid4())
            if element not in self.tombstones:
                self.tombstones[element] = set()
            # Capture all previous add ids for this element
            self.tombstones[element].update(self.elements.get(element, set()))
            # Remove the element
            del self.elements[element]

    def contains(self, element: str) -> bool:
        return (element in self.elements and 
                not any(add_id in self.tombstones.get(element, set()) 
                        for add_id in self.elements[element]))

    def merge(self, other):
        # Merge elements
        for element, add_ids in other.elements.items():
            if element not in self.elements:
                self.elements[element] = set()
            self.elements[element].update(add_ids)
        
        # Merge tombstones
        for element, remove_ids in other.tombstones.items():
            if element not in self.tombstones:
                self.tombstones[element] = set()
            self.tombstones[element].update(remove_ids)
            
            # If all add_ids are in tombstones, remove the element
            if element in self.elements:
                if all(add_id in self.tombstones.get(element, set()) 
                       for add_id in self.elements[element]):
                    del self.elements[element]

class CRDTShoppingList:
    def __init__(self, list_id:int, list_name: str, list_url: str , replica_id: str):
        self.list_id = list_id
        self.list_name = list_name
        self.list_url = list_url

        self.replica_id = replica_id
        
        self.items = AWORSet(replica_id)
        self.quantities = {}  # {item: PNCounter}
        self.items_types = {}
        self.item_names = {}  # {tag: item_name}

        # New attributes for list deletion
        self.deleted = False
        self.delete_ids: Set[str] = set()

    def eliminate(self):
        """
        Mark the list as deleted with a unique delete identifier.
        """
        if not self.deleted:
            self.delete_ids.add(self.replica_id)
            self.deleted = True

    def is_active(self) -> bool:
        """
        Check if the list is currently active (not deleted).
        """
        return not self.deleted

    def replicate(self, replica_id: str):
        self.items.replica_id = replica_id
        self.replica_id = replica_id
        return self

    def add_item(self, item_name: str, item_type: str, quantity: int = 1):
        # Create a unique tag for the item
        tag = str(uuid.uuid4())

        # Add the tag to items
        self.items.add(tag)

        # Store item details
        self.quantities[tag] = PNCounter()
        self.quantities[tag].increment(self.items.replica_id, quantity)
        self.items_types[tag] = item_type
        self.item_names[tag] = item_name

        return tag

    def remove_item(self, item_name: str):
        # Find the first active tag for the item that hasn't been removed yet
        for tag, name in self.item_names.items():
            if name == item_name and self.items.contains(tag):
                self.items.remove(tag)
                break
        
    def remove_item_from_tag(self, tag: str):
        self.items.remove(tag)

    def update_quantity(self, item_name: str, delta: int):
        for tag, name in self.item_names.items():
            if name == item_name and self.items.contains(tag):
                if delta > 0:
                    self.quantities[tag].increment(self.items.replica_id, delta)
                else:
                    self.quantities[tag].decrement(self.items.replica_id, abs(delta))

    def get_items(self):
        return {
            item: self.quantities[item].value() 
            for item in self.items.elements.keys() 
            if self.items.contains(item)
        }
    
    def contains_item(self, item_name: str):
        return any(name == item_name for name in self.item_names.values())
    
    def get_item_value(self, item_name: str):
        for tag, name in self.item_names.items():
            if name == item_name and self.items.contains(tag):
                return self.quantities[tag].value()
        return 0

    def merge(self, other):
        # only merge if the urls are the same
        if self.list_url != other.list_url:
            return False
        
        # Merge list deletion state
        if other.deleted:
            self.delete_ids.update(other.delete_ids)
            # If any delete operation is present, mark the list as deleted
            if other.delete_ids:
                self.deleted = True

        # Merge items set
        self.items.merge(other.items)
        
        # Merge quantities
        for item in set(list(self.quantities.keys()) + list(other.quantities.keys())):
            if item in other.quantities:
                if item not in self.quantities:
                    self.quantities[item] = PNCounter()
                self.quantities[item].merge(other.quantities[item])

        # merge item types and names
        self.items_types.update(other.items_types)
        self.item_names.update(other.item_names)

        return True

        
    
    def read(self):
        """
            Return list basic information in a python object
        """
        if not self.is_active():
            return {
                'id': self.list_id,
                'name': self.list_name
            }
        
        return {
            'id': self.list_id,
            'name': self.list_name,
            'url': self.list_url,
            'items': {
                self.item_names[tag]: quantity 
                for tag, quantity in self.get_items().items()
            }
        }
    
    def to_dict(self):
        shopping_list = self
        return {
            'list_id': shopping_list.list_id,
            'list_name': shopping_list.list_name,
            'list_url': shopping_list.list_url,
            'deleted': shopping_list.deleted,
            'delete_ids': list(shopping_list.delete_ids),
            'items': {
                'elements': {
                    k: list(v) for k, v in shopping_list.items.elements.items()
                },
                'tombstones': {
                    k: list(v) for k, v in shopping_list.items.tombstones.items()
                },
                'replica_id': shopping_list.items.replica_id
            },
            'quantities': {
                tag: {
                    'positive': dict(counter.positive),
                    'negative': dict(counter.negative)
                } for tag, counter in shopping_list.quantities.items()
            },
            'items_types': shopping_list.items_types,
            'item_names': shopping_list.item_names
        }
    
    @staticmethod
    def from_data(data):
        # Recreate the shopping list from the serialized dictionary
        shopping_list = CRDTShoppingList(
            data['list_id'], 
            data['list_name'], 
            data['list_url'], 
            data['items']['replica_id']
        )

        # Restore deletion state
        shopping_list.deleted = data.get('deleted', False)
        shopping_list.delete_ids = set(data.get('delete_ids', []))
        
        # Restore items
        shopping_list.items.elements = {
            k: set(v) for k, v in data['items']['elements'].items()
        }
        shopping_list.items.tombstones = {
            k: set(v) for k, v in data['items']['tombstones'].items()
        }
        
        # Restore quantities
        for tag, quantity_data in data['quantities'].items():
            counter = PNCounter()
            counter.positive = quantity_data['positive']
            counter.negative = quantity_data['negative']
            shopping_list.quantities[tag] = counter
        
        # Restore item types and names
        shopping_list.items_types = data['items_types']
        shopping_list.item_names = data['item_names']
        
        return shopping_list