

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
  }
});


function encodeForAjax(data) {
  if (data == null) return null;
  return Object.keys(data).map(function(k){
    return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
  }).join('&');
}
  
function sendAjaxRequest(method, url, data, handler) {
  let request = new XMLHttpRequest();

  request.open(method, url, true);
  request.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]').content);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  //added this line to make ajax requests work with laravel
  request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  request.addEventListener('load', handler);
  request.send(encodeForAjax(data));
}


function createComment(content){
  let comment = document.createElement('div');
  comment.innerHTML = content;
  let newComment = comment.querySelector('.comment');
  if (newComment == null) {
    console.log("Error creating comment");
    return;
  }
  //search for div with class post-comments
  let comments = document.querySelector('.post-comments');
  var existingComments = comments.getElementsByClassName('comment');
    
  // Adiciona o novo comentário no topo, se houver outros comentários
  if (existingComments.length > 0) {
      comments.insertBefore(newComment, existingComments[0]);
  } else {
      comments.appendChild(newComment);
  }

  let commentsCount = document.querySelector('.number-of-comments');
  commentsCount.innerHTML = parseInt(commentsCount.innerHTML) + 1;

  addEventListenerToLikeAndDislikeButtonsInComment(newComment);
  addEventListenerToDeleteCommentButton(newComment);
}

function addEventListenerToCreateCommentButton(){
  const createCommentButton = document.querySelector('.submitComment-button');
  if (createCommentButton == null) return;
  createCommentButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    var content = document.getElementById('comment-content').value;
    var postId = document.querySelector('input[name="post_id"]').value;

    var data = {
      content: content
    };

    sendAjaxRequest('POST', '/api/post/' + postId + '/comment', data, function() {
        // Handle the response if needed
        // decode from json
        var response = JSON.parse(this.responseText);
        // For simplicity, let's assume the comment was successfully added and pass the HTML to the function
        // pass comment_html to the function
        createComment(response.comment_html);
        // Clear the textarea after submission
        document.getElementById('comment-content').value = '';
    });
  });
}

function reportAPost(button , text){
  let data = {
    content: text
  };
  let postId = button.getAttribute('data-post-id');
  sendAjaxRequest('POST', '/post/' + postId + '/report', data, function() {
    // receive the page 
    var responseCode = this.status;
    if(responseCode == 200){
      Swal.fire({
        title: "Post reported!",
        text: "Thank you for your feedback!",
        icon: "success",
        confirmButtonText: "Ok"
      });
      button.remove();
    }
    else if (responseCode == 401){
      Swal.fire({
        title: "You must be logged in to report a post!",
        text: "Do you want to login?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      }).then((result) => {
        if (result.value) {
          window.location.href = "/login";
        }
      });
    }
    else if (responseCode == 403){
      Swal.fire({
        title: "You can't report your own post!",
        text: "Please try again later!",
        icon: "error",
        confirmButtonText: "Ok"
      });
    }
    else{
      Swal.fire({
        title: "Something went wrong!",
        text: this.responseText,
        icon: "error",
        confirmButtonText: "Ok"
      });
    }
  });
}

function addReportPopUpEventListenerToButton(button){
  //get the post id from the button attribute data-post-id
  button.addEventListener('click', async function() {
    const { value: text } = await Swal.fire({
      input: "textarea",
      inputLabel: "What is wrong with this post?",
      inputPlaceholder: "Type your message here...",
      inputAttributes: {
        "aria-label": "Type your message here",
        style: "resize: none;"
      },
      showCancelButton: true,
      confirmButtonText: "Report",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2c3e50",
      cancelButtonColor: "#d33",
    });
    if (text) {
      reportAPost(button, text);
    }
  });
}

function addReportButtonEventListener(){
  let buttons = document.querySelectorAll('.reportButton');
  for(let button of buttons){
    addReportPopUpEventListenerToButton(button);
  }
}

function LikeHtml(button,likes){
  if (!button.classList.contains('liked')){
    button.classList.add('liked');
    button.classList.remove('fa-regular');
    button.classList.add('fa-solid');
    likes.innerHTML = parseInt(likes.innerHTML) + 1;
  }
}

function DislikeHtml(button,dislikes){
  if (!button.classList.contains('disliked')){
    button.classList.add('disliked');
    button.classList.remove('fa-regular');
    button.classList.add('fa-solid');
    dislikes.innerHTML = parseInt(dislikes.innerHTML) + 1;
  }
}

function UndoLikeHtml(button,likes){
  if (button.classList.contains('liked')){
    button.classList.remove('liked');
    button.classList.remove('fa-solid');
    button.classList.add('fa-regular');
    likes.innerHTML = parseInt(likes.innerHTML) - 1;
  }
}

function UndoDislikeHtml(button,dislikes){
  if (button.classList.contains('disliked')){
    button.classList.remove('disliked');
    button.classList.remove('fa-solid');
    button.classList.add('fa-regular');
    dislikes.innerHTML = parseInt(dislikes.innerHTML) - 1;
  }
}

function eventHandlerForLikeButton(likeButton,likes,unlikeButton,dislikes,route, action){
  let method = 'GET';
  let actualAction = action;
  if (action == "like"){
    if (likeButton.classList.contains('liked')){
      actualAction = "unlike";
      method = 'DELETE';
    }else{
      actualAction = "like";
    }
  }
  else if (action == "dislike"){
    if (unlikeButton.classList.contains('disliked')){
      actualAction = "undislike";
      method = 'DELETE';
    }else{
      actualAction =  "dislike";
    }
  }
  sendAjaxRequest(method, route + actualAction, null, function() {
    // receive the page 
    var responseCode = this.status;
    if(responseCode == 200){
      if (actualAction == 'like'){
        LikeHtml(likeButton,likes);
        UndoDislikeHtml(unlikeButton,dislikes);
      }else if (actualAction == 'dislike'){
        DislikeHtml(unlikeButton,dislikes);
        UndoLikeHtml(likeButton,likes);
      }else if (actualAction == 'unlike'){
        UndoLikeHtml(likeButton,likes);
      }else{
        UndoDislikeHtml(unlikeButton,dislikes);
      }
    }
    else if (responseCode == 401){
      Swal.fire({
        title: "You must be logged in to react to a post!",
        text: "Do you want to login?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      }).then((result) => {
        if (result.value) {
          window.location.href = "/login";
        }
      });
    }
    else{
      Swal.fire({
        title: "Something went wrong!",
        text: "Please try again later!",
        icon: "error",
        confirmButtonText: "Ok"
      });
    }
  });

}

function addEventListenerToLikeAndDislikeButtonsInComment(comment){
  let likeButton = comment.querySelector('.likeButton');
  let likes = comment.querySelector('.number-of-likes');
  let unlikeButton = comment.querySelector('.dislikeButton');
  let dislikes = comment.querySelector('.number-of-dislikes');
  if (likeButton == null && unlikeButton == null) return;
  //post id has format post-id
  let commentid = comment.id.split('-')[1];
  if (likeButton != null){
    likeButton.addEventListener('click', function() {
      eventHandlerForLikeButton(likeButton,likes,unlikeButton,dislikes,'/api/comment/'+commentid+'/', "like");
    });
  }
  if (unlikeButton != null){
    unlikeButton.addEventListener('click', function() {
      eventHandlerForLikeButton(likeButton,likes,unlikeButton,dislikes,'/api/comment/'+commentid+'/' , "dislike");
    });
  }
}

function addEventListenerToLikeAndDislikeButtons(){
  // for every post in the page
  
  let posts= document.querySelectorAll('.post');
  for(let post of posts){
    let likeButton = post.querySelector('.post-actions .likeButton');
    let likes = post.querySelector('.post-actions .number-of-likes');
    let unlikeButton = post.querySelector('.post-actions .dislikeButton');
    let dislikes = post.querySelector('.post-actions .number-of-dislikes');
    //post id has format post-id
    let postid = post.id.split('-')[1];
    if (likeButton != null){
      likeButton.addEventListener('click', function() {
        eventHandlerForLikeButton(likeButton,likes,unlikeButton,dislikes,'/post/'+postid+'/', "like");
      });
    }
    if (unlikeButton != null){
      unlikeButton.addEventListener('click', function() {
        eventHandlerForLikeButton(likeButton,likes,unlikeButton,dislikes,'/post/'+postid+'/' , "dislike");
      });
    }
  }
  

  // for comment
  let comments = document.querySelectorAll('.comment');
  for(let comment of comments){
    addEventListenerToLikeAndDislikeButtonsInComment(comment);
  }
}

function addEventListenerToDeleteCommentButton(comment){
  let deleteButton = comment.querySelector('.deleteCommentButton');
  if (deleteButton == null) return;
  let commentid = comment.id.split('-')[1];
  
  deleteButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    sendAjaxRequest('DELETE', '/api/comment/' + commentid, null, function() {
      // Handle the response if needed
      var responseCode = this.status;
      console.log(this);
      if(responseCode == 200){
        Toast.fire({
          icon: "error",
          title: "Comment deleted!"
        });
        comment.remove();
      }
      else if (responseCode == 401){
        Toast.fire({
          icon: "warning",
          title: "You must be logged in to delete a comment!"
        });
      }
      else if (responseCode == 403){
        Toast.fire({
          icon: "error",
          title: "You can't delete other user's comments!"
        });
      }
      else{
        Toast.fire({
          icon: "error",
          title: "Something went wrong!"
        });
      }
    });
  });
}

function addEventListenerToDeleteCommentButtons(){
  let comments = document.querySelectorAll('.comment');
  for (let comment of comments){
    addEventListenerToDeleteCommentButton(comment);
  }
}

addEventListenerToCreateCommentButton();
addReportButtonEventListener();
addEventListenerToLikeAndDislikeButtons();
addEventListenerToDeleteCommentButtons();


function previewPostImage(event) {
  var input = event.target;
  var visualErrorMessage = document.getElementById('visual-error-message');
  var imagePreviewContainer = document.getElementById('imagePreviewContainer');

  // Clear previous error message
  visualErrorMessage.innerText = '';

  if (!input.files || !input.files[0]) {
      // If no file is selected, hide the image preview container
      imagePreviewContainer.style.display = 'none';
      return;
  }

  var allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
  var fileType = input.files[0].type;

  if (!allowedTypes.includes(fileType)) {
      // If the file type is not allowed, show an error message and clear the input
      visualErrorMessage.innerText = 'Invalid file type. Please select a valid image file.';
      clearPreviewImage();
      input.value = '';
      return;
  }

  // Show the image preview container
  var output = document.getElementById('picturePreview');
  output.src = URL.createObjectURL(input.files[0]);
  imagePreviewContainer.style.display = 'block';
}

function clearPreviewImage() {
  var output = document.getElementById('picturePreview');
  output.src = '';
}

function clearFileInput() {
  // Clear the file input by creating a new one and replacing the existing one
  var oldInput = document.getElementById('picture');
  var newInput = document.createElement('input');
  newInput.type = 'file';
  newInput.className = oldInput.className;
  newInput.id = oldInput.id;
  newInput.name = oldInput.name;
  newInput.addEventListener('change', previewImage);

  // Replace the old input with the new one
  oldInput.parentNode.replaceChild(newInput, oldInput);

  // Hide the image preview container when clearing the input
  document.getElementById('imagePreviewContainer').style.display = 'none';
}

function clearPreviewAndFileInput() {
  clearPreviewImage();
  clearFileInput();
  // Hide the image preview container after removing the image
  document.getElementById('imagePreviewContainer').style.display = 'none';
}

function previewProfileImage(event) {
  const input = event.target;
  if (input.files && input.files[0]) {
      const reader = new FileReader();

      reader.onload = function (e) {
          document.getElementById('profileImg').src = e.target.result;
      }

      reader.readAsDataURL(input.files[0]);
  }
}



