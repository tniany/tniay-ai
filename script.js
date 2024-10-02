let isProcessing = false; // 用于标记AI对话是否正在进行

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('verifyBtn').addEventListener('click', function() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (apiUrl === "" || apiKey === "") {
        alert("请填写API链接和API密钥。");
        return;
    }

    // 显示加载提示
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.innerText = '正在校验...';
    document.querySelector('.api-configuration').appendChild(loadingMessage);

    // 发送测试请求
    testApiConnection(apiUrl, apiKey, loadingMessage);
});

function testApiConnection(apiUrl, apiKey, loadingMessage) {
    const testUrl = `${apiUrl}?key=${apiKey}&msg=test`; // 记录请求的URL
    console.log("测试请求的URL:", testUrl); // 日志请求的URL

    fetch(testUrl) // 发送测试请求
        .then(response => {
            if (!response.ok) {
                throw new Error('API未能正常响应');
            }
            return response.json();
        })
        .then(data => {
            console.log("API响应数据:", data); // 日志API的响应数据

            // 移除加载提示
            loadingMessage.remove();

            // 检查返回的状态码
            if (data.code === 200) {
                console.log("API连接成功");
                document.getElementById('chatbox').style.display = 'block'; // 显示聊天框
            } else {
                alert('API返回错误: ' + data.message); // 使用弹窗显示错误信息
                document.getElementById('chatbox').style.display = 'none'; // 隐藏聊天框
            }
        })
        .catch(error => {
            loadingMessage.remove();
            alert('请求失败: ' + error.message); // 使用弹窗显示错误信息
            document.getElementById('chatbox').style.display = 'none'; // 隐藏聊天框
        });
}

function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    const messagesDiv = document.getElementById('messages');
    const apiUrl = document.getElementById('apiUrl').value; // 获取用户输入的API链接
    const apiKey = document.getElementById('apiKey').value.trim(); // 获取用户输入的API密钥

    if (userInput === "" || apiKey === "") {
        return; // 如果输入为空或密钥为空，不发送
    }

    // 获取当前时间
    const currentTime = new Date().toLocaleString();

    // 显示用户消息
    messagesDiv.innerHTML += `<div class="user-message">${currentTime} - 您: ${userInput}</div>`;

    // 显示加载提示
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.innerText = '正在加载...';
    messagesDiv.appendChild(loadingMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // 滚动到最新消息

    // 禁用发送按钮
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;

    // 调用AI API获取回复
    getAIResponse(userInput, apiUrl, apiKey).then(aiResponse => {
        // 移除加载提示
        messagesDiv.removeChild(loadingMessage);

        const responseDiv = document.createElement('div');
        responseDiv.className = 'ai-message';
        
        // 提取output内容并显示
        const outputContent = aiResponse.data.output || '抱歉，无法获取有效的回复。';
        responseDiv.innerHTML = `${currentTime} - AI: <div class="code-block">${outputContent}</div>`;
        
        messagesDiv.appendChild(responseDiv);
        
        // 清空输入框
        document.getElementById('userInput').value = '';
        // 滚动到最新消息
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // 启用发送按钮
        sendBtn.disabled = false;
    }).catch(error => {
        // 移除加载提示
        messagesDiv.removeChild(loadingMessage);
        alert('请求失败: ' + error.message); // 使用弹窗显示错误信息
        sendBtn.disabled = false; // 启用发送按钮
    });
}

// 格式化AI回复，识别代码段
function formatResponse(response) {
    if (typeof response !== 'object' || !response.data || !response.data.output) {
        return '抱歉，无法获取有效的回复。';
    }
    return response.data.output.replace(/\n/g, '<br>'); // 替换换行符
}

// 调用AI API的函数
async function getAIResponse(input, apiUrl, apiKey) {
    const requestUrl = `${apiUrl}?key=${apiKey}&msg=${encodeURIComponent(input)}`; // 记录请求的URL
    console.log("请求的URL:", requestUrl); // 日志请求的URL

    try {
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('网络响应不正常');
        }

        const data = await response.json();
        console.log("API响应数据:", data); // 日志API的响应数据
        
        // 检查返回的状态码
        if (data.code === 200) {
            return data; // 返回整个数据对象
        } else {
            return { data: { output: '抱歉，无法获取有效的回复。' } }; // 返回默认消息
        }
    } catch (error) {
        console.error('请求失败:', error);
        return { data: { output: '抱歉，无法获取AI回复。' } }; // 返回默认消息
    }
}