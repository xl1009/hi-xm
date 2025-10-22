// 在 PotatoBatchManager 类的 setupEventListeners 方法中添加
setupEventListeners() {
    // ... 其他事件监听器 ...

    // 注册方式切换
    document.querySelectorAll('input[name="registrationMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            this.switchRegistrationMethod(e.target.value);
        });
    });

    // 开始注册按钮
    document.getElementById('startRegisterBtn').addEventListener('click', () => {
        const method = document.querySelector('input[name="registrationMethod"]:checked').value;
        if (method === 'free') {
            this.startFreeEmailRegistration();
        } else {
            this.startPaidSmsRegistration();
        }
    });

    // 注册数量变化时更新显示
    document.getElementById('regCount').addEventListener('change', (e) => {
        document.getElementById('targetCount').textContent = e.target.value;
    });
}

// 切换注册方式
switchRegistrationMethod(method) {
    const freeConfig = document.getElementById('freeEmailConfig');
    const paidConfig = document.getElementById('paidSmsConfig');
    const freeTips = document.getElementById('freeServiceTips');
    const currentMethod = document.getElementById('currentMethod');

    if (method === 'free') {
        freeConfig.style.display = 'block';
        paidConfig.style.display = 'none';
        freeTips.style.display = 'block';
        currentMethod.textContent = '免费邮箱接码';
        
        // 免费服务建议数量较少
        document.getElementById('regCount').max = 10;
        document.getElementById('regCount').value = 3;
        document.getElementById('targetCount').textContent = '3';
        
    } else {
        freeConfig.style.display = 'none';
        paidConfig.style.display = 'block';
        freeTips.style.display = 'none';
        currentMethod.textContent = '付费手机接码';
        
        // 付费服务可以注册更多
        document.getElementById('regCount').max = 50;
        document.getElementById('regCount').value = 5;
        document.getElementById('targetCount').textContent = '5';
    }
}

// 免费邮箱注册
async startFreeEmailRegistration() {
    if (this.isRegistering) {
        this.showMessage('注册任务正在进行中', 'warning');
        return;
    }

    const count = parseInt(document.getElementById('regCount').value);
    const freeEmailService = document.getElementById('freeEmailService').value;
    const registerUrl = document.getElementById('registerUrl').value;
    const defaultPassword = document.getElementById('defaultPassword').value;
    const registerDelay = parseInt(document.getElementById('registerDelay').value);

    if (!count || count < 1) {
        this.showMessage('请输入有效的注册数量', 'error');
        return;
    }

    if (!registerUrl.trim()) {
        this.showMessage('请输入注册地址', 'error');
        return;
    }

    if (!defaultPassword.trim()) {
        this.showMessage('请输入默认密码', 'error');
        return;
    }

    this.isRegistering = true;
    this.registerProgress = 0;
    document.getElementById('registerProgress').style.width = '0%';
    document.getElementById('registerStatus').textContent = '免费邮箱注册中...';
    document.getElementById('startRegisterBtn').disabled = true;
    
    // 清空注册日志
    document.getElementById('registerLog').innerHTML = '';

    try {
        this.showMessage(`开始免费邮箱注册 ${count} 个账号...`, 'info');
        
        for (let i = 0; i < count; i++) {
            if (!this.isRegistering) break;
            
            // 更新进度
            this.registerProgress = ((i + 1) / count) * 100;
            document.getElementById('registerProgress').style.width = `${this.registerProgress}%`;
            document.getElementById('completedCount').textContent = i + 1;
            
            // 模拟免费邮箱注册过程
            const account = await this.simulateFreeEmailRegistration(registerUrl, defaultPassword, freeEmailService);
            this.accounts.push(account);
            
            // 添加注册日志
            this.addRegisterLog(account.email, account.password, '注册成功', 
                `免费邮箱注册成功，使用服务: ${this.getFreeEmailServiceName(freeEmailService)}`);
            
            // 模拟延迟
            await this.delay(registerDelay * 1000);
        }
        
        if (this.isRegistering) {
            this.showMessage(`免费邮箱注册完成，成功注册 ${count} 个账号`, 'success');
            document.getElementById('registerStatus').textContent = '注册完成';
            document.getElementById('successRate').textContent = '100%';
        } else {
            this.showMessage('注册任务已停止', 'warning');
            document.getElementById('registerStatus').textContent = '已停止';
        }
        
    } catch (error) {
        this.showMessage('免费邮箱注册失败: ' + error.message, 'error');
        document.getElementById('registerStatus').textContent = '注册失败';
    } finally {
        this.isRegistering = false;
        document.getElementById('startRegisterBtn').disabled = false;
        this.saveAccounts();
        this.updateAccountStats();
        this.renderAccountList();
    }
}

// 付费手机接码注册（原有的注册方法）
async startPaidSmsRegistration() {
    if (this.isRegistering) {
        this.showMessage('注册任务正在进行中', 'warning');
        return;
    }

    const count = parseInt(document.getElementById('regCount').value);
    const smsService = document.getElementById('smsService').value;
    const apiKey = document.getElementById('apiKey').value;
    const countryCode = document.getElementById('countryCode').value;
    const registerUrl = document.getElementById('paidRegisterUrl').value;
    const defaultPassword = document.getElementById('paidDefaultPassword').value;
    const registerDelay = parseInt(document.getElementById('registerDelay').value);

    // 验证逻辑
    if (!count || count < 1) {
        this.showMessage('请输入有效的注册数量', 'error');
        return;
    }

    if (!apiKey) {
        this.showMessage('请输入API密钥', 'error');
        return;
    }

    if (!registerUrl.trim()) {
        this.showMessage('请输入注册地址', 'error');
        return;
    }

    if (!defaultPassword.trim()) {
        this.showMessage('请输入默认密码', 'error');
        return;
    }

    this.isRegistering = true;
    this.registerProgress = 0;
    document.getElementById('registerProgress').style.width = '0%';
    document.getElementById('registerStatus').textContent = '手机接码注册中...';
    document.getElementById('startRegisterBtn').disabled = true;
    
    // 清空注册日志
    document.getElementById('registerLog').innerHTML = '';

    try {
        this.showMessage(`开始手机接码注册 ${count} 个账号...`, 'info');
        
        for (let i = 0; i < count; i++) {
            if (!this.isRegistering) break;
            
            // 更新进度
            this.registerProgress = ((i + 1) / count) * 100;
            document.getElementById('registerProgress').style.width = `${this.registerProgress}%`;
            document.getElementById('completedCount').textContent = i + 1;
            
            // 模拟注册过程
            const account = await this.simulatePaidSmsRegistration(registerUrl, defaultPassword, smsService, countryCode);
            this.accounts.push(account);
            
            // 添加注册日志
            this.addRegisterLog(account.phone, account.password, '注册成功', 
                `手机接码注册成功，使用平台: ${this.getSmsServiceName(smsService)}`);
            
            // 模拟延迟
            await this.delay(registerDelay * 1000);
        }
        
        if (this.isRegistering) {
            this.showMessage(`手机接码注册完成，成功注册 ${count} 个账号`, 'success');
            document.getElementById('registerStatus').textContent =
