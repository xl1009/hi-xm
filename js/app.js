/* 注册配置切换样式 */
.registration-config {
    transition: all 0.3s ease;
}

.service-tips {
    animation: fadeIn 0.5s ease;
}

.service-status {
    background: var(--light);
    padding: 15px;
    border-radius: 8px;
    margin-top: 15px;
    border: 1px solid var(--gray-light);
}

/* 注册方式选择器样式 */
.registration-method-selector {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    background: var(--light);
    padding: 15px;
    border-radius: 8px;
}

.method-option {
    flex: 1;
    text-align: center;
    padding: 15px;
    border: 2px solid var(--gray-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.method-option:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
}

.method-option.active {
    border-color: var(--primary);
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
}

.method-option.active .method-icon {
    color: white;
}

.method-icon {
    font-size: 24px;
    margin-bottom: 8px;
    color: var(--primary);
}

.method-title {
    font-weight: 600;
    margin-bottom: 5px;
}

.method-desc {
    font-size: 12px;
    opacity: 0.8;
}

/* 免费服务标签 */
.free-badge {
    background: var(--success);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    margin-left: 5px;
}

.paid-badge {
    background: var(--warning);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    margin-left: 5px;
}

/* 动画效果 */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn 0.3s ease;
}
