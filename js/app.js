// Potato批量管理工具 - 主应用逻辑
class PotatoBatchManager {
    constructor() {
        this.accounts = [];
        this.isRegistering = false;
        this.isJoining = false;
        this.registerProgress = 0;
        this.joinProgress = 0;
        this.init();
    }

    init() {
        console.log('PotatoBatchManager 初始化开始');
        this.setupEventListeners();
        this.loadAccounts();
        this.updateAccountStats();
        this.renderAccountList();
        
        // 显示欢迎消息
        this.showMessage('Potato批量管理工具已就绪', 'success');
        console.log('PotatoBatchManager 初始化完成');
    }

    setupEventListeners() {
        console.log('设置事件监听器');
        
        // 侧边栏导航
        document.querySelectorAll('.sidebar a[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('切换标签页:', link.getAttribute('data-tab'));
                this.switchTab(link.getAttribute('data-tab'));
            });
        });

        // 批量注册相关
        const startRegisterBtn = document.getElementById('startRegisterBtn');
        if (startRegisterBtn) {
            startRegisterBtn.addEventListener('click', () => {
                console.log('开始注册按钮被点击');
                this.startBatchRegistration();
            });
        } else {
            console.error('未找到开始注册按钮');
        }

        const stopRegisterBtn = document.getElementById('stopRegisterBtn');
        if (stopRegisterBtn) {
            stopRegisterBtn.addEventListener('click', () => {
                console.log('停止注册按钮被点击');
                this.stopBatchRegistration();
            });
        }

        const regCountInput = document.getElementById('regCount');
        if (regCountInput) {
            regCountInput.addEventListener('change', (e) => {
                document.getElementById('targetCount').textContent = e.target.value;
            });
        }
        
        // 批量加群相关
        const startJoinBtn = document.getElementById('startJoinBtn');
        if (startJoinBtn) {
            startJoinBtn.addEventListener('click', () => {
                console.log('开始加群按钮被点击');
                this.startBatchJoin();
            });
        }

        const stopJoinBtn = document.getElementById('stopJoinBtn');
        if (stopJoinBtn) {
            stopJoinBtn.addEventListener('click', () => {
                console.log('停止加群按钮被点击');
                this.stopBatchJoin();
            });
        }
        
        // 账号管理相关
        const refreshAccountsBtn = document.getElementById('refreshAccountsBtn');
        if (refreshAccountsBtn) {
            refreshAccountsBtn.addEventListener('click', () => {
                console.log('刷新账号按钮被点击');
                this.refreshAccounts();
            });
        }

        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => {
                console.log('删除选中按钮被点击');
                this.deleteSelectedAccounts();
            });
        }

        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                console.log('全选复选框状态改变:', e.target.checked);
                this.toggleSelectAll(e.target.checked);
            });
        }

        const exportAccountsBtn = document.getElementById('exportAccountsBtn');
        if (exportAccountsBtn) {
            exportAccountsBtn.addEventListener('click', () => {
                console.log('导出账号按钮被点击');
                this.exportAccounts();
            });
        }
        
        console.log('所有事件监听器设置完成');
    }

    switchTab(tabName) {
        console.log('切换到标签页:', tabName);
        
        // 隐藏所有标签页
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // 显示选中的标签页
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.error('未找到标签页:', tabName);
        }

        // 更新导航激活状态
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.sidebar a[data-tab="${tabName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async startBatchRegistration() {
        console.log('开始批量注册方法被调用');
        
        if (this.isRegistering) {
            this.showMessage('注册任务正在进行中', 'warning');
            return;
        }

        const count = parseInt(document.getElementById('regCount').value);
        const registerUrl = document.getElementById('registerUrl').value;
        const defaultPassword = document.getElementById('defaultPassword').value;
        const smsService = document.getElementById('smsService').value;
        const countryCode = document.getElementById('countryCode').value;
        const registerDelay = parseInt(document.getElementById('registerDelay').value);

        console.log('注册参数:', { count, registerUrl, defaultPassword, smsService, countryCode, registerDelay });

        if (!count || count < 1) {
            this.showMessage('请输入有效的注册数量', 'error');
            return;
        }

        this.isRegistering = true;
        this.registerProgress = 0;
        
        // 更新UI状态
        document.getElementById('registerProgress').style.width = '0%';
        document.getElementById('registerStatus').textContent = '注册中...';
        document.getElementById('startRegisterBtn').disabled = true;
        
        // 清空注册日志
        document.getElementById('registerLog').innerHTML = '';

        try {
            this.showMessage(`开始批量注册 ${count} 个账号...`, 'info');
            console.log(`开始批量注册 ${count} 个账号`);
            
            let successCount = 0;
            
            for (let i = 0; i < count; i++) {
                if (!this.isRegistering) {
                    console.log('注册任务被停止');
                    break;
                }
                
                // 更新进度
                this.registerProgress = ((i + 1) / count) * 100;
                document.getElementById('registerProgress').style.width = `${this.registerProgress}%`;
                document.getElementById('completedCount').textContent = i + 1;
                
                console.log(`注册进度: ${i + 1}/${count}`);
                
                try {
                    // 模拟注册过程
                    const account = await this.simulateRegistration(registerUrl, defaultPassword, smsService, countryCode);
                    this.accounts.push(account);
                    successCount++;
                    
                    // 添加注册日志
                    this.addRegisterLog(account.email, account.password, '注册成功', 
                        `账号 ${account.email} 注册成功，使用平台: ${this.getSmsServiceName(smsService)}`);
                    
                    console.log(`账号注册成功: ${account.email}`);
                    
                } catch (error) {
                    console.error(`第 ${i + 1} 个账号注册失败:`, error);
                    this.addRegisterLog('N/A', defaultPassword, '注册失败', `第 ${i + 1} 个账号注册失败: ${error.message}`);
                }
                
                // 更新成功率
                const successRate = Math.round((successCount / (i + 1)) * 100);
                document.getElementById('successRate').textContent = `${successRate}%`;
                
                // 模拟延迟
                if (i < count - 1) { // 最后一次不需要延迟
                    await this.delay(registerDelay * 1000);
                }
            }
            
            if (this.isRegistering) {
                const message = `批量注册完成，成功注册 ${successCount} 个账号`;
                this.showMessage(message, 'success');
                document.getElementById('registerStatus').textContent = '注册完成';
                console.log(message);
            } else {
                this.showMessage('注册任务已停止', 'warning');
                document.getElementById('registerStatus').textContent = '已停止';
            }
            
        } catch (error) {
            console.error('批量注册失败:', error);
            this.showMessage('批量注册失败: ' + error.message, 'error');
            document.getElementById('registerStatus').textContent = '注册失败';
        } finally {
            this.isRegistering = false;
            document.getElementById('startRegisterBtn').disabled = false;
            this.saveAccounts();
            this.updateAccountStats();
            this.renderAccountList();
            console.log('批量注册任务结束');
        }
    }

    async simulateRegistration(registerUrl, password, smsService, countryCode) {
        console.log('模拟注册过程开始');
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // 根据选择的接码平台获取临时邮箱
                    const email = this.getTemporaryEmail(smsService);
                    
                    const account = {
                        id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                        email: email,
                        password: password,
                        registerUrl: registerUrl,
                        smsService: smsService,
                        countryCode: countryCode,
                        status: 'active',
                        createdAt: new Date(),
                        lastUsed: null
                    };
                    
                    console.log('模拟注册成功:', account.email);
                    resolve(account);
                } catch (error) {
                    console.error('模拟注册失败:', error);
                    reject(error);
                }
            }, 1000); // 缩短模拟时间以便测试
        });
    }

    // 根据接码平台获取临时邮箱
    getTemporaryEmail(smsService) {
        const randomStr = Math.random().toString(36).substr(2, 8);
        let email;
        
        switch(smsService) {
            case '10minutemail':
                email = `potato_${randomStr}@10minutemail.com`;
                break;
            case 'tempmail':
                email = `potato_${randomStr}@tempmail.com`;
                break;
            case 'guerrillamail':
                email = `potato_${randomStr}@guerrillamail.com`;
                break;
            default:
                email = `potato_${randomStr}@tempemail.com`;
        }
        
        console.log('生成临时邮箱:', email);
        return email;
    }

    // 获取接码平台名称
    getSmsServiceName(service) {
        const serviceMap = {
            '10minutemail': '10MinuteMail',
            'tempmail': 'Temp-Mail',
            'guerrillamail': 'GuerrillaMail',
            'other': '其他平台'
        };
        return serviceMap[service] || service;
    }

    stopBatchRegistration() {
        console.log('停止注册任务');
        this.isRegistering = false;
        this.showMessage('正在停止注册任务...', 'info');
    }

    async startBatchJoin() {
        console.log('开始批量加群方法被调用');
        
        if (this.isJoining) {
            this.showMessage('加群任务正在进行中', 'warning');
            return;
        }

        const groupListText = document.getElementById('groupList').value;
        const delay = parseInt(document.getElementById('joinDelay').value);

        if (!groupListText.trim()) {
            this.showMessage('请输入群组列表', 'error');
            return;
        }

        const groups = groupListText.split('\n').filter(g => g.trim());
        
        if (groups.length === 0) {
            this.showMessage('没有有效的群组', 'error');
            return;
        }

        if (this.accounts.length === 0) {
            this.showMessage('没有可用的账号', 'error');
            return;
        }

        this.isJoining = true;
        this.joinProgress = 0;
        document.getElementById('joinProgress').style.width = '0%';
        document.getElementById('joinStatus').textContent = '加群中...';
        document.getElementById('targetGroups').textContent = groups.length;
        document.getElementById('startJoinBtn').disabled = true;
        
        // 清空加群日志
        document.getElementById('joinLog').innerHTML = '';

        try {
            this.showMessage(`开始批量加入 ${groups.length} 个群组...`, 'info');
            console.log(`开始批量加入 ${groups.length} 个群组`);
            
            let joinedCount = 0;
            
            for (let i = 0; i < groups.length; i++) {
                if (!this.isJoining) {
                    console.log('加群任务被停止');
                    break;
                }
                
                const group = groups[i];
                
                // 选择账号 (轮询分配)
                const accountIndex = i % this.accounts.length;
                const account = this.accounts[accountIndex];
                
                // 更新进度
                this.joinProgress = ((i + 1) / groups.length) * 100;
                document.getElementById('joinProgress').style.width = `${this.joinProgress}%`;
                
                console.log(`加群进度: ${i + 1}/${groups.length}, 账号: ${account.email}, 群组: ${group}`);
                
                // 模拟加入群组
                const success = await this.simulateJoinGroup(account, group);
                
                if (success) {
                    joinedCount++;
                    document.getElementById('joinedGroups').textContent = joinedCount;
                    this.addJoinLog(account.email, group, '加入成功', `账号 ${account.email} 成功加入群组 ${group}`);
                    
                    // 更新账号最后使用时间
                    account.lastUsed = new Date();
                    console.log(`加群成功: ${account.email} -> ${group}`);
                } else {
                    this.addJoinLog(account.email, group, '加入失败', `账号 ${account.email} 加入群组 ${group} 失败`);
                    console.log(`加群失败: ${account.email} -> ${group}`);
                }
                
                // 更新成功率
                const successRate = Math.round((joinedCount / (i + 1)) * 100);
                document.getElementById('joinSuccessRate').textContent = `${successRate}%`;
                
                // 模拟延迟
                if (i < groups.length - 1) { // 最后一次不需要延迟
                    await this.delay(delay * 1000);
                }
            }
            
            if (this.isJoining) {
                const message = `批量加群完成，成功加入 ${joinedCount} 个群组`;
                this.showMessage(message, 'success');
                document.getElementById('joinStatus').textContent = '加群完成';
                console.log(message);
            } else {
                this.showMessage('加群任务已停止', 'warning');
                document.getElementById('joinStatus').textContent = '已停止';
            }
            
        } catch (error) {
            console.error('批量加群失败:', error);
            this.showMessage('批量加群失败: ' + error.message, 'error');
            document.getElementById('joinStatus').textContent = '加群失败';
        } finally {
            this.isJoining = false;
            document.getElementById('startJoinBtn').disabled = false;
            this.saveAccounts();
            this.renderAccountList();
            console.log('批量加群任务结束');
        }
    }

    async simulateJoinGroup(account, group) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟80%的成功率
                const success = Math.random() > 0.2;
                resolve(success);
            }, 500); // 缩短模拟时间
        });
    }

    stopBatchJoin() {
        console.log('停止加群任务');
        this.isJoining = false;
        this.showMessage('正在停止加群任务...', 'info');
    }

    exportAccounts() {
        console.log('导出账号方法被调用');
        
        if (this.accounts.length === 0) {
            this.showMessage('没有可导出的账号', 'warning');
            return;
        }

        const content = this.convertToText(this.accounts);
        this.downloadFile(content, `potato_accounts_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
        this.showMessage('账号数据导出成功', 'success');
        console.log(`导出 ${this.accounts.length} 个账号`);
    }

    convertToText(accounts) {
        return accounts.map(account => 
            `邮箱: ${account.email} | 密码: ${account.password} | 状态: ${this.getStatusText(account.status)} | 注册时间: ${new Date(account.createdAt).toLocaleString()}`
        ).join('\n');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    refreshAccounts() {
        console.log('刷新账号列表');
        this.loadAccounts();
        this.updateAccountStats();
        this.renderAccountList();
        this.showMessage('账号列表已刷新', 'success');
    }

    deleteSelectedAccounts() {
        const selectedIds = this.getSelectedAccountIds();
        
        if (selectedIds.length === 0) {
            this.showMessage('请先选择要删除的账号', 'warning');
            return;
        }
        
        if (!confirm(`确定要删除选中的 ${selectedIds.length} 个账号吗？此操作不可恢复。`)) {
            return;
        }
        
        this.accounts = this.accounts.filter(account => !selectedIds.includes(account.id));
        this.saveAccounts();
        this.updateAccountStats();
        this.renderAccountList();
        this.showMessage(`已删除 ${selectedIds.length} 个账号`, 'success');
        console.log(`删除 ${selectedIds.length} 个账号`);
    }

    getSelectedAccountIds() {
        const checkboxes = document.querySelectorAll('#accountList input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('#accountList input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        console.log(`全选状态: ${checked}`);
    }

    loadAccounts() {
        const saved = localStorage.getItem('potato_accounts');
        if (saved) {
            try {
                this.accounts = JSON.parse(saved);
                console.log(`从本地存储加载 ${this.accounts.length} 个账号`);
            } catch (error) {
                console.error('解析账号数据失败:', error);
                this.accounts = [];
            }
        } else {
            console.log('本地存储中没有账号数据');
        }
    }

    saveAccounts() {
        localStorage.setItem('potato_accounts', JSON.stringify(this.accounts));
        console.log(`保存 ${this.accounts.length} 个账号到本地存储`);
    }

    updateAccountStats() {
        const total = this.accounts.length;
        const available = this.accounts.filter(acc => acc.status === 'active').length;
        const banned = this.accounts.filter(acc => acc.status === 'banned').length;
        
        const today = new Date().toDateString();
        const todayRegistered = this.accounts.filter(acc => 
            new Date(acc.createdAt).toDateString() === today
        ).length;
        
        document.getElementById('totalAccounts').textContent = total;
        document.getElementById('availableAccounts').textContent = available;
        document.getElementById('bannedAccounts').textContent = banned;
        document.getElementById('todayRegistered').textContent = todayRegistered;
        
        console.log(`账号统计 - 总数: ${total}, 可用: ${available}, 封禁: ${banned}, 今日注册: ${todayRegistered}`);
    }

    renderAccountList() {
        const accountList = document.getElementById('accountList');
        if (!accountList) {
            console.error('未找到账号列表容器');
            return;
        }
        
        accountList.innerHTML = '';
        
        this.accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" value="${account.id}"></td>
                <td>${account.id}</td>
                <td>${account.email}</td>
                <td>${account.password}</td>
                <td><span class="task-status ${account.status === 'active' ? 'task-running' : account.status === 'banned' ? 'task-error' : 'task-stopped'}"></span>${this.getStatusText(account.status)}</td>
                <td>${new Date(account.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-small" onclick="app.editAccount('${account.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteAccount('${account.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            accountList.appendChild(row);
        });
        
        console.log(`渲染 ${this.accounts.length} 个账号到列表`);
    }

    getStatusText(status) {
        const statusMap = {
            'active': '活跃',
            'inactive': '未激活',
            'banned': '封禁'
        };
        return statusMap[status] || status;
    }

    editAccount(accountId) {
        const account = this.accounts.find(acc => acc.id === accountId);
        if (account) {
            this.showMessage(`编辑账号: ${account.email}`, 'info');
            console.log(`编辑账号: ${account.email}`);
        }
    }

    deleteAccount(accountId) {
        if (confirm('确定要删除这个账号吗？')) {
            this.accounts = this.accounts.filter(acc => acc.id !== accountId);
            this.saveAccounts();
            this.updateAccountStats();
            this.renderAccountList();
            this.showMessage('账号已删除', 'success');
            console.log(`删除账号: ${accountId}`);
        }
    }

    addRegisterLog(email, password, status, details) {
        const logTable = document.getElementById('registerLog');
        if (!logTable) {
            console.error('未找到注册日志表格');
            return;
        }
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${new Date().toLocaleTimeString()}</td>
            <td>${email}</td>
            <td>${password}</td>
            <td>${status}</td>
            <td>${details}</td>
        `;
        
        logTable.appendChild(row);
        logTable.scrollTop = logTable.scrollHeight;
    }

    addJoinLog(account, group, status, details) {
        const logTable = document.getElementById('joinLog');
        if (!logTable) {
            console.error('未找到加群日志表格');
            return;
        }
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${new Date().toLocaleTimeString()}</td>
            <td>${account}</td>
            <td>${group}</td>
            <td>${status}</td>
            <td>${details}</td>
        `;
        
        logTable.appendChild(row);
        logTable.scrollTop = logTable.scrollHeight;
    }

    showMessage(message, type = 'info') {
        console.log(`显示消息: [${type}] ${message}`);
        
        // 创建消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageDiv);
        
        // 自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化应用
console.log('开始初始化 PotatoBatchManager');
const app = new PotatoBatchManager();
console.log('PotatoBatchManager 初始化完成');
