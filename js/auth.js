// 认证检查
document.addEventListener('DOMContentLoaded', function() {
    console.log('主页面认证检查开始...');
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginTime = localStorage.getItem('loginTime');
    
    if (!isLoggedIn || !loginTime) {
        console.log('未找到登录信息，跳转到登录页');
        window.location.href = 'login.html';
        return;
    }
    
    const currentTime = new Date().getTime();
    const loginTimestamp = parseInt(loginTime);
    
    // 检查是否在24小时内登录
    if (currentTime - loginTimestamp > 24 * 60 * 60 * 1000) {
        console.log('登录已过期，清除状态并跳转');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('认证通过，用户已登录');
    
    // 设置退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('用户点击退出登录');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loginTime');
            window.location.href = 'login.html';
        });
    } else {
        console.error('未找到退出登录按钮');
    }
});
