// 认证检查
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginTime = parseInt(localStorage.getItem('loginTime'));
    const currentTime = new Date().getTime();
    
    // 检查登录状态和登录时间（24小时有效期）
    if (!isLoggedIn || currentTime - loginTime > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        window.location.href = 'login.html';
        return;
    }
    
    // 设置退出登录按钮
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        window.location.href = 'login.html';
    });
});