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
        this.setupEventListeners();
        this.loadAccounts();
        this.updateAccountStats();
        this.renderAccountList();
        
        // 显示欢迎消息
        this.showMessage('Potato批量管理工具已就绪', 'success');
    }

    setupEventListeners() {
        // 侧边栏导航
        document.querySelectorAll('.sidebar a[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link.getAttribute('data-tab'));
            });
        });

        // 批量注册相关
        document.getElementById('startRegisterBtn').addEventListener('click', () => this.startBatchRegistration());
        document.getElementById('stopRegisterBtn').addEventListener('click', () => this.stopBatchRegistration());
        document.getElementById('regCount').addEventListener('change', (e) => {
            document.getElementById('targetCount').textContent = e.target.value;
        });
        
        // 批量加群相关
        document.getElementById('startJoinBtn').addEventListener('click', () => this.startBatchJoin());
        document.getElementById('stopJoinBtn').addEventListener('click', () => this.stopBatchJoin());
        
        // 账号管理相关
        document.getElementById('refreshAccountsBtn').addEventListener('click', () => this.refreshAccounts());
        document.getElementById('deleteSelectedBtn').addEventListener('click', () => this.deleteSelectedAccounts());
        document.getElementById('selectAll').addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        document.getElementById('exportAccountsBtn').addEventListener('click', () => this.exportAccounts());
    }

    switchTab(tabName) {
        // 隐藏所有标签页
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // 显示选中的标签页
        document.getElementById(tabName).classList.add('active');

        // 更新导航激活状态
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`.sidebar a[data-tab="${tabName}"]`).classList.add('active');
    }

    async startBatchRegistration() {
        if (this.isRegistering) {
            this.showMessage('注册任务正在进行中', 'warning');
            return;
        }

        const count = parseInt(document.getElementById('regCount').value);

        if (!count || count < 1) {
            this.showMessage('请输入有效的注册数量', 'error');
            return;
        }

        this.isRegistering = true;
        this.registerProgress = 0;
        document.getElementById('registerProgress').style.width = '0%';
        document.getElementById('registerStatus').textContent = '注册中...';
        document.getElementById('startRegisterBtn').disabled = true;
        
        // 清空注册日志
        document.getElementById('registerLog').innerHTML = '';

        try {
            this.showMessage(`开始批量注册 ${count} 个账号...`, 'info');
            
            for (let i = 0; i < count; i++) {
                if (!this.isRegistering) break;
                
                // 更新进度
                this.registerProgress = ((i + 1) / count) * 100;
                document.getElementById('registerProgress').style.width = `${this.registerProgress}%`;
                document.getElementById('completedCount').textContent = i + 1;
                
                // 模拟注册过程
                const account = await this.simulateRegistration();
                this.accounts.push(account);
                
                // 添加注册日志
                this.addRegisterLog(account.email, '注册成功', `账号 ${account.email} 注册成功，密码: qwer1234`);
                
                // 模拟延迟
                await this.delay(2000);
            }
            
            if (this.isRegistering) {
                this.showMessage(`批量注册完成，成功注册 ${count} 个账号`, 'success');
                document.getElementById('registerStatus').textContent = '注册完成';
                document.getElementById('successRate').textContent = '100%';
            } else {
                this.showMessage('注册任务已停止', 'warning');
                document.getElementById('registerStatus').textContent = '已停止';
            }
            
        } catch (error) {
            this.showMessage('批量注册失败: ' + error.message, 'error');
            document.getElementById('registerStatus').textContent = '注册失败';
        } finally {
            this.isRegistering = false;
            document.getElementById('startRegisterBtn').disabled = false;
            this.saveAccounts();
            this.updateAccountStats();
            this.renderAccountList();
        }
    }

    async simulateRegistration() {
        // 模拟10分钟邮箱获取
        const email = await this.getTemporaryEmail();
        
        // 模拟注册过程
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    email: email,
                    password: 'qwer1234',
                    status: 'active',
                    createdAt: new Date(),
                    lastUsed: null
                });
            }, 1500);
        });
    }

    async getTemporaryEmail() {
        // 模拟10分钟邮箱服务
        const randomStr = Math.random().toString(36).substr(2, 8);
        return `potato_${randomStr}@10minutemail.com`;
    }

    stopBatchRegistration() {
        this.isRegistering = false;
        this.showMessage('正在停止注册任务...', 'info');
    }

    async startBatchJoin() {
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
            
            let joinedCount = 0;
            
            for (let i = 0; i < groups.length; i++) {
                if (!this.isJoining) break;
                
                const group = groups[i];
                
                // 选择账号 (轮询分配)
                const accountIndex = i % this.accounts.length;
                const account = this.accounts[accountIndex];
                
                // 更新进度
                this.joinProgress = ((i + 1) / groups.length) * 100;
                document.getElementById('joinProgress').style.width = `${this.joinProgress}%`;
                
                // 模拟加入群组
                const success = await this.simulateJoinGroup(account, group);
                
                if (success) {
                    joinedCount++;
                    document.getElementById('joinedGroups').textContent = joinedCount;
                    this.addJoinLog(account.email, group, '加入成功', `账号 ${account.email} 成功加入群组 ${group}`);
                    
                    // 更新账号最后使用时间
                    account.lastUsed = new Date();
                } else {
                    this.addJoinLog(account.email, group, '加入失败', `账号 ${account.email} 加入群组 ${group} 失败`);
                }
                
                // 更新成功率
                const successRate = Math.round((joinedCount / (i + 1)) * 100);
                document.getElementById('joinSuccessRate').textContent = `${successRate}%`;
                
                // 模拟延迟
                await this.delay(delay * 1000);
            }
            
            if (this.isJoining) {
                this.showMessage(`批量加群完成，成功加入 ${joinedCount} 个群组`, 'success');
                document.getElementById('joinStatus').textContent = '加群完成';
            } else {
                this.showMessage('加群任务已停止', 'warning');
                document.getElementById('joinStatus').textContent = '已停止';
            }
            
        } catch (error) {
            this.showMessage('批量加群失败: ' + error.message, 'error');
            document.getElementById('joinStatus').textContent = '加群失败';
        } finally {
            this.isJoining = false;
            document.getElementById('startJoinBtn').disabled = false;
            this.saveAccounts();
            this.renderAccountList();
        }
    }

    async simulateJoinGroup(account, group) {
        // 模拟加群过程，80%成功率
        return new Promise((resolve) => {
            setTimeout(() => {
                const success = Math.random() > 0.2;
                resolve(success);
            }, 1000);
        });
    }

    stopBatchJoin() {
        this.isJoining = false;
        this.showMessage('正在停止加群任务...', 'info');
    }

    exportAccounts() {
        if (this.accounts.length === 0) {
            this.showMessage('没有可导出的账号', 'warning');
            return;
        }

        const content = this.convertToText(this.accounts);
        this.downloadFile(content, `potato_accounts_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
        this.showMessage('账号数据导出成功', 'success');
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
    }

    loadAccounts() {
        const saved = localStorage.getItem('potato_accounts');
        if (saved) {
            this.accounts = JSON.parse(saved);
        }
    }

    saveAccounts() {
        localStorage.setItem('potato_accounts', JSON.stringify(this.accounts));
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
    }

    renderAccountList() {
        const accountList = document.getElementById('accountList');
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
            // 实际应用中应该打开编辑模态框
        }
    }

    deleteAccount(accountId) {
        if (confirm('确定要删除这个账号吗？')) {
            this.accounts = this.accounts.filter(acc => acc.id !== accountId);
            this.saveAccounts();
            this.updateAccountStats();
            this.renderAccountList();
            this.showMessage('账号已删除', 'success');
        }
    }

    addRegisterLog(email, status, details) {
        const logTable = document.getElementById('registerLog');
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${new Date().toLocaleTimeString()}</td>
            <td>${email}</td>
            <td>${status}</td>
            <td>${details}</td>
        `;
        
        logTable.appendChild(row);
        logTable.scrollTop = logTable.scrollHeight;
    }

    addJoinLog(account, group, status, details) {
        const logTable = document.getElementById('joinLog');
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
        // 创建消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        // 添加到页面
        document.body.appendChild(messageDiv);
        
        // 自动移除
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化应用
const app = new PotatoBatchManager();