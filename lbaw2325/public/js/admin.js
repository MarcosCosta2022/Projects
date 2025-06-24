const searchInput = document.getElementById('searchUserAdminInput');
const userContainer = document.querySelector('#userSection .vertical-scrollable');

searchInput.addEventListener('input', function(event) {
    const userInput = event.target.value.trim();

    console.log(userInput);

    // Your server URL to handle the request
    const serverURL = '/admin/search/users';
    const method = 'GET';

    // Send AJAX request

    sendAjaxRequest(method,serverURL + '?search=' + userInput, null ,function() {
        if (this.status != 200) {
            console.log(this.status);
            return;
        }
        const response = JSON.parse(this.responseText);
        userContainer.innerHTML = response.html;
    });
});

document.addEventListener('DOMContentLoaded', function () {
    var tooltips = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'));
    tooltips.forEach(function (tooltip) {
        new bootstrap.Tooltip(tooltip, {
            placement: tooltip.getAttribute('data-placement') || 'top',
            title: tooltip.getAttribute('title') || ''
        });
    });
  });
  
  function confirmBlockAdminDash(userId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to block this user.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2c3e50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, block it!'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('blockForm_' + userId).submit();
        }
    });
  }
  
  function confirmDeleteAdminDash(userId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You are about to delete this user's account.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2c3e50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('deleteForm_' + userId).submit(); 
        }
    });
  }
  
  function confirmAdminAdminDash(userId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You are about make this user an admin.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2c3e50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm!'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('makeAdminForm_' + userId).submit(); 
        }
    });
  }
  
  function confirmUnblockAdminDash(userId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to unblock this user.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2c3e50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, unblock it!'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('unblockForm_' + userId).submit();
        }
    });
  } 