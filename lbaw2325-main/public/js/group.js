function confirmDeleteGroup(groupId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Are you sure you want to delete this group?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2c3e50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('deleteGroupForm_' + groupId).submit();
        }
    });
  }
  
  function confirmDeleteGroup(groupId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Are you sure you want to delete this group?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2c3e50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('deleteGroupForm_' + groupId).submit();
        }
    });
  }