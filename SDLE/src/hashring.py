import hashlib
from typing import List, Tuple, Optional
import json
from json import JSONDecodeError

class VirtualTreeNode:
    def __init__(self, position, worker, worker_port, virtual_node):
        """
        Node for the Binary Search Tree representation of the hash ring
        """
        self.position = position
        self.worker = worker
        self.worker_port = worker_port
        self.virtual_node = virtual_node
        self.left = None
        self.right = None

class HashRing:
    def __init__(self, ring=None, replicas=3, total_slots=1024):
        """
        Initialize hash ring with a Binary Search Tree
        """
        self.root = None
        self.replicas = replicas  # Number of replicas for each worker
        self.total_slots = total_slots  # Large number of possible slots
        self.worker_positions = {}
        self.worker_nodes = {}

        # If an initial ring is provided, populate the tree
        if ring:
            for position, worker, worker_port, virtual_node in ring:
                self._insert_node(position, worker, worker_port, virtual_node)
                if worker not in self.worker_positions:
                    self.worker_positions[worker] = []
                self.worker_positions[worker].append(position)

    def _insert_node(self, position, worker, worker_port, virtual_node):
        """
        Insert a new node into the Binary Search Tree
        """
        new_node = VirtualTreeNode(position, worker, worker_port, virtual_node)
        
        if not self.root: #if its the first node make it the root
            self.root = new_node
            return new_node

        # add the node to the tree based on comparison of position
        current = self.root
        while current:
            if position < current.position:
                if current.left is None:
                    current.left = new_node
                    break
                current = current.left
            else:
                if current.right is None:
                    current.right = new_node
                    break
                current = current.right
        
        return new_node

    def _hash_key(self, key: str) -> int:
        """
        Generate a deterministic hash for a key (consistent across processes)
        """
        return int(hashlib.md5(str(key).encode()).hexdigest(), 16) % self.total_slots

    def higher_key(self, position):
        """
        Find the node with the smallest key greater than the given position
        """
        current = self.root
        successor = None

        while current:
            if current.position > position:
                # Potential successor
                successor = current
                current = current.left
            else:
                current = current.right

        # If no successor found in the tree, find the minimum node (wrap around)
        if successor is None:
            return self._find_minimum()
        
        return successor

    def lower_key(self, position):
        """
        Find the node with the largest key less than the given position
        """
        current = self.root
        predecessor = None

        while current:
            if current.position < position:
                # Potential predecessor
                predecessor = current
                current = current.right
            else:
                current = current.left

        # If no predecessor found in the tree, find the maximum node (wrap around)
        if predecessor is None:
            return self._find_maximum()
        
        return predecessor


    def _find_minimum(self):
        """
        Find the node with the minimum position
        """
        if not self.root:
            return None
        
        current = self.root
        while current.left:
            current = current.left
        return current
    
    def _find_maximum(self):
        """
        Find the node with the maximum position
        """
        if not self.root:
            return None
        
        current = self.root
        while current.right:
            current = current.right
        return current

    def add_worker(self, worker_id: str, worker_port: int) -> List[int]:
        """
        Add a worker to the hash ring
        """
        # Check if worker already exists
        if worker_id in self.worker_positions:
            return self.worker_positions[worker_id]

        positions = []
        nodes = []

        # Add virtual nodes to the ring
        for i in range(self.replicas):
            # Create a unique virtual node identifier
            virtual_node = f"{worker_id}:vnode:{i}"
            
            # Hash the virtual node
            hash_value = self._hash_key(virtual_node)

            # Insert the new worker
            node = self._insert_node(hash_value, worker_id, worker_port, virtual_node)

            # Save the position
            positions.append(hash_value)

            # Save the node
            nodes.append(node)
        
        self.worker_positions[worker_id] = positions
        self.worker_nodes[worker_id] = nodes

        return positions

    def get_worker_for_key(self, key: str) -> Tuple:
        """
        Find the appropriate worker for a given key
        """
        if not self.root:
            return (None, None, None, None)
        
        # Hash the input key
        hash_value = self._hash_key(key)
        
        # Find the node with the closest position
        node = self.higher_key(hash_value)
        
        return (node.position, node.worker, node.worker_port, node.virtual_node)

    def remove_worker(self, worker_id: str):
        """
        Remove a worker from the hash ring
        Currently a placeholder - full BST removal is complex
        """
        # Reset the root and rebuild the tree
        self.root = None
        self.worker_positions = {}

        # Rebuild the tree excluding the specified worker
        # This is a simple implementation and not the most efficient
        if hasattr(self, '_original_ring'):
            for position, worker, worker_port, virtual_node in self._original_ring:
                if worker != worker_id:
                    self._insert_node(position, worker, worker_port, virtual_node)

    def get_preference_list(self, key: str, n: int) -> List[Tuple[str, int]]:
        """
        Get n unique workers that are responsible for the key by order of preference
        """
        if n <= 0 or not self.root:
            return []
        
        # Hash the input key
        hash_value = self._hash_key(key)
        
        # List to store unique workers
        preference_list = []
        seen_workers = set()
        
        # Start from the found node
        current = self.higher_key(hash_value)
        iterations = 0
        
        while len(preference_list) < n and iterations < self.total_slots:
            if current.worker not in seen_workers:
                preference_list.append((current.worker, current.worker_port))
                seen_workers.add(current.worker)
            
            # Move to next node, wrapping around if necessary
            current = self.higher_key(current.position + 1)
            
            # Prevent infinite loop
            iterations += 1
        
        return preference_list

    def debug_ring(self):
        """
        Print detailed information about the hash ring
        """
        def _inorder_traversal(node):
            if not node:
                return
            
            _inorder_traversal(node.left)
            print(f"Position {node.position}: Worker {node.worker} (port {node.worker_port}) - {node.virtual_node}")
            _inorder_traversal(node.right)
        
        print("Hash Ring Debug:")
        _inorder_traversal(self.root)

    def get_worker_distribution(self):
        """
        Get a distribution of workers across the ring
        """
        distribution = {}
        
        def _count_workers(node):
            if not node:
                return
            
            distribution[node.worker] = distribution.get(node.worker, 0) + 1
            _count_workers(node.left)
            _count_workers(node.right)
        
        _count_workers(self.root)
        return distribution

    def store_ring(self, path):
        """
        Store the hash ring to a file
        """
        def _serialize_tree(node):
            if not node:
                return []
            
            return (_serialize_tree(node.left) + 
                    [(node.position, node.worker, node.worker_port, node.virtual_node)] + 
                    _serialize_tree(node.right))
        
        ring_data = _serialize_tree(self.root)
        
        with open(path, 'w') as f:
            f.write(json.dumps(ring_data))

    def load_ring(self, path):
        """
        Load the hash ring from a file
        """
        try:
            with open(path, 'r') as f:
                rows = json.loads(f.read())
                
                # Reset the tree
                self.root = None
                self.worker_positions = {}
                
                # Rebuild the tree
                for position, worker, worker_port, virtual_node in rows:
                    self._insert_node(position, worker, worker_port, virtual_node)
                    
                    if worker not in self.worker_positions:
                        self.worker_positions[worker] = []
                    self.worker_positions[worker].append(position)
        
        except (FileNotFoundError, JSONDecodeError):
            self.root = None
            self.worker_positions = {}


    def to_string(self) -> str:
        """
        Serialize the hash ring to a JSON string representation
        
        Returns:
            str: A JSON string containing the ring's configuration
        """
        def _serialize_tree(node):
            if not node:
                return []
            
            return (_serialize_tree(node.left) + 
                    [(node.position, node.worker, node.worker_port, node.virtual_node)] + 
                    _serialize_tree(node.right))
        
        # Serialize the entire ring configuration
        ring_data = {
            'total_slots': self.total_slots,
            'replicas': self.replicas,
            'ring': _serialize_tree(self.root)
        }
        
        return json.dumps(ring_data)

    @classmethod
    def from_string(cls, serialized_string: str) -> 'HashRing':
        """
        Deserialize a JSON string to recreate a HashRing instance
        
        Args:
            serialized_string (str): JSON string containing the ring's configuration
        
        Returns:
            HashRing: A new HashRing instance with the deserialized configuration
        """
        try:
            # Parse the JSON string
            ring_data = json.loads(serialized_string)
            
            # Extract configuration parameters
            total_slots = ring_data.get('total_slots', 1024)
            replicas = ring_data.get('replicas', 3)
            
            # Create a new HashRing instance with the extracted parameters
            hash_ring = cls(ring=ring_data.get('ring', []), 
                            replicas=replicas, 
                            total_slots=total_slots)
            
            return hash_ring
        
        except (json.JSONDecodeError, TypeError) as e:
            raise ValueError(f"Invalid serialized string: {e}")
