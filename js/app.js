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
        this.loadConfig(); // 加载保存的配置
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
                this.saveConfig(); // 保存配置
            });
        }
        
        // 注册地址和密码输入框事件
        const registerUrlInput = document.getElementById('registerUrl');
        if (registerUrlInput) {
            registerUrlInput.addEventListener('change', (e) => {
                this.saveConfig(); // 保存配置
            });
        }

        const defaultPasswordInput = document.getElementById('defaultPassword');
        if (defaultPasswordInput) {
            defaultPasswordInput.addEventListener('change', (e) => {
                this.saveConfig(); // 保存配置
            });
        }

        // 其他配置项事件
        const configInputs = ['smsService', 'countryCode', 'registerDelay', 'retryCount', 'captchaTimeout', 'userAgent'];
        configInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('change', () => {
                    this.saveConfig();
                });
            }
        });
        
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

    // 保存配置到本地存储
    saveConfig() {
        const config = {
            registerUrl: document.getElementById('registerUrl').value,
            defaultPassword: document.getElementById('defaultPassword').value,
            regCount: document.getElementById('regCount').value,
            smsService: document.getElementById('smsService').value,
            countryCode: document.getElementById('countryCode').value,
            registerDelay: document.getElementById('registerDelay').value,
            retryCount: document.getElementById('retryCount').value,
            captchaTimeout: document.getElementById('captchaTimeout').value,
            userAgent: document.getElementById('userAgent').value
        };
        
        localStorage.setItem('potato_config', JSON.stringify(config));
        console.log('配置已保存到本地存储');
    }

    // 从本地存储加载配置
    loadConfig() {
        const saved = localStorage.getItem('potato_config');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                
                // 设置输入框的值，如果为空则使用占位符
                document.getElementById('registerUrl').value = config.registerUrl || '';
                document.getElementById('defaultPassword').value = config.defaultPassword || '';
                document.getElementById('regCount').value = config.regCount || 5;
                document.getElementById('smsService').value = config.smsService || '10minutemail';
                document.getElementById('countryCode').value = config.countryCode || '+86';
                document.getElementById('registerDelay').value = config.registerDelay || 3;
                document.getElementById('retryCount').value = config.retryCount || 2;
                document.getElementById('captchaTimeout').value = config.captchaTimeout || 60;
                document.getElementById('userAgent').value = config.userAgent || 'random';
                
                // 更新目标数量显示
                document.getElementById('targetCount').textContent = config.regCount || 5;
                
                console.log('配置已从本地存储加载');
            } catch (error) {
                console.error('加载配置失败:', error);
                // 设置默认值
                document.getElementById('targetCount').textContent = 5;
            }
        } else {
            console.log('本地存储中没有配置数据，使用默认值');
            document.getElementById('targetCount').textContent = 5;
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

        // 验证必填字段
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

    // 其余方法保持不变...
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
            }, 1000);
        });
    }

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

    // 其他方法保持不变...
}

// 初始化应用
console.log('开始初始化 PotatoBatchManager');
const app = new PotatoBatchManager();
console.log('PotatoBatchManager 初始化完成');
