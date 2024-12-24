let loading = false;

let nextPageUrls = {
    'all': null,
    'new': null,
    'comments': null,
    'likes': null,
    'follows': null
};

function loadMoreNotifications() {
    if (loading) return;
    const tab = checkCurrentTab();
    const nextPage = nextPageUrls[tab];

    if (nextPage === null) return;

    const scrollTop = document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 100) {
        loading = true;
        getNotifications(tab, nextPage);
    }
}

window.addEventListener('scroll', loadMoreNotifications);


function checkCurrentTab(){
    const tab = document.querySelector('.custom-tabs .nav-link.active');
    const tabname = tab.getAttribute('id');
    if (tabname === 'alltab') return 'all';
    else if (tabname === 'newtab') return 'new';
    else if (tabname === 'commentstab') return 'comments';
    else if (tabname === 'likestab') return 'likes';
    else if (tabname === 'followtab') return 'follows';
}
    

function updateNotifications(type , content) {
    const tab = document.getElementById(type);
    
    // add the new notifications to the list
    tab.innerHTML += content;

    const paginationCon = tab.querySelector('#pagination-container');
    paginationCon.remove();
}

function getNotifications(tab, url) {
    sendAjaxRequest('get', url, null,function () {
        const notifications = JSON.parse(this.responseText);
        nextPageUrls[tab] = notifications.next_page_url;
        updateNotifications(tab, notifications.html);
        loading = false;
    });
}

function addAjaxToPaginationButtons(paginationObject , tab) {
    let links = paginationObject.querySelectorAll('a');
    if (links.length === 0) paginationObject.style.display = 'none';
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            let page = link.getAttribute('href').split('page=')[1];
            getNotifications(tab, page);
        });
    });
}

function getNextPageUrlFromPagination(pagination) {
    const nextPage = pagination.lastElementChild;
    const nextPageLink = nextPage.querySelector('a');
    if (nextPageLink === null) return null;
    return nextPageLink.getAttribute('href');
}

function addEventListenerToNotifications(notifications){
    foreach(notifications, notification => {
        const url = notification.querySelector('.notification-read-link').getAttribute('href');
        notification.addEventListener('click', function () {
            // go to the page in the url not ajax
            window.location.href = url;
        });
    });
}

const tab_panes= document.querySelectorAll('.tab-pane');
tab_panes.forEach( tab=>{
    const paginationCon = tab.querySelector('#pagination-container');
    if (paginationCon === null) return;
    const pagination = paginationCon.querySelector('.pagination');
    if (pagination === null) return;
    let nextPage = getNextPageUrlFromPagination(pagination);
    nextPageUrls[tab.getAttribute('id')] = nextPage + '&type=' + tab.getAttribute('id');
    paginationCon.remove();
});


notifications = document.querySelector('.notification');
addEventListenerToNotifications(notifications);









