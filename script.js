// البيانات الأولية
let posts = JSON.parse(localStorage.getItem('posts')) || [
    {
        id: 1,
        title: "مرحباً بكم في موقعنا",
        content: "هذا هو أول منشور في موقعنا. يمكنك كتابة تعليقات وسيتم عرضها بعد موافقة المشرف.",
        date: "2024-01-15",
        author: "المشرف"
    },
    {
        id: 2,
        title: "كيفية استخدام الموقع",
        content: "يمكن للزوار قراءة المنشورات وإضافة تعليقات جديدة. التعليقات تخضع للمراجعة من قبل المشرف قبل النشر.",
        date: "2024-01-16",
        author: "المشرف"
    }
];

let comments = JSON.parse(localStorage.getItem('comments')) || [
    {
        id: 1,
        postId: 1,
        author: "محمد",
        content: "شكراً على هذه البداية الرائعة!",
        date: "2024-01-15",
        approved: true
    },
    {
        id: 2,
        postId: 1,
        author: "أحمد",
        content: "أتمنى لكم التوفيق",
        date: "2024-01-15",
        approved: false
    }
];

// حفظ البيانات في localStorage
function saveData() {
    localStorage.setItem('posts', JSON.stringify(posts));
    localStorage.setItem('comments', JSON.stringify(comments));
}

// DOMContentLoaded لصفحة الرئيسية
if (document.querySelector('#postsContainer')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadPosts();
        updateStats();
        setupModal();
    });
}

// DOMContentLoaded لصفحة الإدارة
if (document.querySelector('#postsAdminContainer')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadAdminData();
    });
}

// تحميل المنشورات في الصفحة الرئيسية
function loadPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postComments = comments.filter(c => c.postId === post.id && c.approved);
        
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            <div class="post-image">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="post-content">
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 150)}...</p>
                <div class="post-meta">
                    <span><i class="far fa-calendar"></i> ${post.date}</span>
                    <span><i class="far fa-comments"></i> ${postComments.length} تعليق</span>
                </div>
                <button onclick="openPostModal(${post.id})" class="read-more">
                    <i class="fas fa-book-reader"></i> اقرأ المزيد
                </button>
            </div>
        `;
        
        container.appendChild(postElement);
    });
}

// تحديث الإحصائيات
function updateStats() {
    const postsCount = document.getElementById('postsCount');
    const commentsCount = document.getElementById('commentsCount');
    const pendingCount = document.getElementById('pendingCount');
    
    if (postsCount) {
        postsCount.textContent = posts.length;
    }
    
    if (commentsCount) {
        const approvedComments = comments.filter(c => c.approved);
        commentsCount.textContent = approvedComments.length;
    }
    
    if (pendingCount) {
        const pendingComments = comments.filter(c => !c.approved);
        pendingCount.textContent = pendingComments.length;
    }
}

// إعداد المودال
function setupModal() {
    const modal = document.getElementById('postModal');
    const closeBtn = document.querySelector('.close');
    
    if (!modal || !closeBtn) return;
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    
    // إعداد نموذج التعليق
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.onsubmit = function(e) {
            e.preventDefault();
            submitComment();
        }
    }
}

// فتح مودال المنشور
function openPostModal(postId) {
    const modal = document.getElementById('postModal');
    const postContent = document.getElementById('modalPostContent');
    const commentsContainer = document.getElementById('commentsContainer');
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    postContent.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-meta">
            <span><i class="fas fa-user"></i> ${post.author}</span>
            <span><i class="far fa-calendar"></i> ${post.date}</span>
        </div>
        <div class="post-full-content">
            <p>${post.content}</p>
        </div>
    `;
    
    // عرض التعليقات المعتمدة
    const postComments = comments.filter(c => c.postId === postId && c.approved);
    commentsContainer.innerHTML = '';
    
    if (postComments.length === 0) {
        commentsContainer.innerHTML = '<p class="notice">لا توجد تعليقات بعد. كن أول من يعلق!</p>';
    } else {
        postComments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <p>${comment.content}</p>
            `;
            commentsContainer.appendChild(commentElement);
        });
    }
    
    // إعداد نموذج التعليق
    const commentForm = document.getElementById('commentForm');
    commentForm.dataset.postId = postId;
    
    modal.style.display = 'block';
}

// إرسال تعليق جديد
function submitComment() {
    const form = document.getElementById('commentForm');
    const postId = parseInt(form.dataset.postId);
    const author = document.getElementById('commentAuthor').value;
    const content = document.getElementById('commentText').value;
    
    if (!author || !content) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }
    
    const newComment = {
        id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
        postId: postId,
        author: author,
        content: content,
        date: new Date().toISOString().split('T')[0],
        approved: false
    };
    
    comments.push(newComment);
    saveData();
    updateStats();
    
    // إعادة تعيين النموذج
    form.reset();
    
    // إظهار رسالة نجاح
    alert('شكراً على تعليقك! سيتم عرضه بعد موافقة المشرف.');
}

// تحميل البيانات في لوحة التحكم
function loadAdminData() {
    loadAdminPosts();
    loadAdminComments();
    updateStats();
    
    // إعداد نموذج المنشور
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.onsubmit = function(e) {
            e.preventDefault();
            savePost();
        }
    }
}

// تحميل المنشورات في لوحة التحكم
function loadAdminPosts() {
    const container = document.getElementById('postsAdminContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            <div class="post-image">
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="post-content">
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 100)}...</p>
                <div class="post-meta">
                    <span><i class="fas fa-user"></i> ${post.author}</span>
                    <span><i class="far fa-calendar"></i> ${post.date}</span>
                </div>
                <div class="comment-actions">
                    <button onclick="openPostForm(${JSON.stringify(post).replace(/"/g, '&quot;')})" class="btn btn-primary">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button onclick="deletePost(${post.id})" class="btn btn-danger">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(postElement);
    });
}

// تحميل التعليقات في لوحة التحكم
function loadAdminComments(filterStatus = 'all') {
    const container = document.getElementById('commentsAdminContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    let filteredComments = comments;
    
    if (filterStatus === 'pending') {
        filteredComments = comments.filter(c => !c.approved);
    } else if (filterStatus === 'approved') {
        filteredComments = comments.filter(c => c.approved);
    }
    
    if (filteredComments.length === 0) {
        container.innerHTML = '<p class="notice">لا توجد تعليقات</p>';
        return;
    }
    
    filteredComments.forEach(comment => {
        const post = posts.find(p => p.id === comment.postId);
        const postTitle = post ? post.title : 'منشور محذوف';
        
        const commentElement = document.createElement('div');
        commentElement.className = `comment-admin ${comment.approved ? 'approved' : 'pending'}`;
        commentElement.innerHTML = `
            <div class="comment-header">
                <div>
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${comment.date}</span>
                    <span class="comment-status ${comment.approved ? 'approved' : ''}">
                        ${comment.approved ? 'تمت الموافقة' : 'بانتظار الموافقة'}
                    </span>
                </div>
                <small>على: ${postTitle}</small>
            </div>
            <p>${comment.content}</p>
            <div class="comment-actions">
                ${!comment.approved ? `
                    <button onclick="approveComment(${comment.id})" class="btn btn-success">
                        <i class="fas fa-check"></i> الموافقة
                    </button>
                ` : ''}
                <button onclick="deleteComment(${comment.id})" class="btn btn-danger">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        `;
        
        container.appendChild(commentElement);
    });
}

// فلترة التعليقات
function filterCommentsByStatus(status) {
    loadAdminComments(status);
    
    // تحديد الزر النشط
    document.querySelectorAll('.filter button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// حفظ المنشور
function savePost() {
    const postId = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    
    if (!title || !content) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }
    
    if (postId) {
        // تحديث منشور موجود
        const index = posts.findIndex(p => p.id === parseInt(postId));
        if (index !== -1) {
            posts[index].title = title;
            posts[index].content = content;
        }
    } else {
        // إضافة منشور جديد
        const newPost = {
            id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
            title: title,
            content: content,
            date: new Date().toISOString().split('T')[0],
            author: "المشرف"
        };
        posts.push(newPost);
    }
    
    saveData();
    loadAdminPosts();
    if (document.querySelector('#postsContainer')) {
        loadPosts();
    }
    updateStats();
    closePostForm();
}

// حذف المنشور
function deletePost(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنشور؟')) {
        posts = posts.filter(p => p.id !== id);
        // حذف التعليقات المرتبطة بالمنشور
        comments = comments.filter(c => c.postId !== id);
        saveData();
        loadAdminPosts();
        if (document.querySelector('#postsContainer')) {
            loadPosts();
        }
        updateStats();
    }
}

// الموافقة على تعليق
function approveComment(id) {
    const index = comments.findIndex(c => c.id === id);
    if (index !== -1) {
        comments[index].approved = true;
        saveData();
        loadAdminComments();
        updateStats();
    }
}

// حذف تعليق
function deleteComment(id) {
    if (confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
        comments = comments.filter(c => c.id !== id);
        saveData();
        loadAdminComments();
        updateStats();
    }
}

// تصدير الدوال للاستخدام في ملفات HTML
window.openPostModal = openPostModal;
window.submitComment = submitComment;
window.openPostForm = openPostForm;
window.closePostForm = closePostForm;
window.savePost = savePost;
window.deletePost = deletePost;
window.approveComment = approveComment;
window.deleteComment = deleteComment;
window.filterCommentsByStatus = filterCommentsByStatus;