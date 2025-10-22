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
        
        // 保存配置到本地存储
        document.getElementById('registerUrl').addEventListener('change', (e) => {
            this.saveConfig();
        });
        
        document.getElementById('defaultPassword').addEventListener('change', (e) => {
            this.saveConfig();
        });
        
        document.getElementById('smsService').addEventListener('change', (e) => {
            this.saveConfig();
        });
        
        document.getElementById('countryCode').addEventListener('change', (e) => {
            this.saveConfig();
        });
        
        document.getElementById('registerDelay').addEventListener('change', (e) => {
            this.saveConfig();
        });
        
        document.getElementById('retryCount').addEventListener('change', (e) => {
            this.saveConfig();
        });
        
        document.getElementById('captchaTimeout').addEventListener('change', (e) => {
            this.saveConfig();
        });
        
        document.getElementById('userAgent').addEventListener('change', (e) => {
            this.saveConfig();
        });
        
        // 加载保存的配置
        this.loadConfig();
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
        const registerUrl = document.getElementById('registerUrl').value;
        const defaultPassword = document.getElementById('defaultPassword').value;
        const smsService = document.getElementById('smsService').value;
        const countryCode = document.getElementById('countryCode').value;
        const registerDelay = parseInt(document.getElementById('registerDelay').value);

        if (!count || count < 1) {
            this.showMessage('请输入有效的注册数量', 'error');
            return;
        }

        if (!registerUrl) {
            this.showMessage('请输入注册地址', 'error');
            return;
        }

        if (!defaultPassword) {
            this.showMessage('请输入默认密码', 'error');
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
                const account = await this.simulateRegistration(registerUrl, defaultPassword, smsService, countryCode);
                this.accounts.push(account);
                
                // 添加注册日志
                this.addRegisterLog(account.email, account.password, '注册成功', 
                    `账号 ${account.email} 注册成功，使用平台: ${this.getSmsServiceName(smsService)}`);
                
                // 模拟延迟
                await this.delay(registerDelay * 1000);
            }
            
            if (this.isRegistering) {
                this.showMessage(`批量注册完成，成功注册 ${count} 个账号`, 'success');
                document.getElementById('registerStatus').textContent = '注册完成';
                document.getElementById('successRate').textContent = '100%';
            } else {
                this.showMessage('注册任务已停止', 'warning');
                document.getElementById('registerStatus').textContent = '已停止';
            }
            
        } catch
