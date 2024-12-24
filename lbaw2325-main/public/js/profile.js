const btnDeletePost = document.querySelector('#btn-del-post');
if (btnDeletePost){
btnDeletePost.addEventListener('click', function() {
    Swal.fire({
            title: "Are you sure you want to delete this account?",
            text: "You won't be able to revert this! All posts and interactions will remain visible.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2c3e50",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                fetch("{{ url('/user/' . $user->id . '/delete') }}", {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}', // Add the CSRF token
                    },
                })
                let timerInterval;
                Swal.fire({
                    title: "Account Deleted!",
                    html: "You will be redirected to the login page in <b></b> seconds.", // Update the text to show seconds
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector("b");
                        timerInterval = setInterval(() => {
                            const remainingTimeInSeconds = Math.ceil(Swal.getTimerLeft() / 1000); // Convert milliseconds to seconds
                            timer.textContent = `${remainingTimeInSeconds}`;
                        }, 100);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    }
                }).then((result) => {
                    /* Read more about handling dismissals below */
                    if (result.dismiss === Swal.DismissReason.timer) {
                        console.log("I was closed by the timer");
                        // Redirect to the home page
                        window.location.href = "{{ url('/login') }}";
                    }
                });
                
            }
        });
    });
}

function confirmBlockProfile() {
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
            document.getElementById('blockForm').submit();
        }
    });
}

function confirmUnblockProfile() {
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
            document.getElementById('unblockForm').submit();
        }
    });
}  