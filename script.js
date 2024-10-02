let isProcessing = false; // 用于标记AI对话是否正在进行

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('clearBtn').addEventListener('click', function() {
    isProcessing = false; // 暂停AI对话
    document.getElementById('messages').innerHTML = ''; // 清空聊天记录
    document.getElementById('messages').innerHTML += `<div class="system-message">温馨提示：请勿发送违反法律法规的内容。</div>`; // 重新添加提示
});

function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    const messagesDiv = document.getElementById('messages');
    const selectedModel = document.getElementById('modelSelect').value;

    if (userInput === "") {
        return; // 如果输入为空，不发送
    }

    // 获取当前时间
    const currentTime = new Date().toLocaleString();

    // 显示用户消息
    messagesDiv.innerHTML += `<div class="user-message">${currentTime} - 您: ${userInput}</div>`;

    // 禁用发送按钮并显示加载图标
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;

    // 调用AI API获取回复
    getAIResponse(userInput, selectedModel).then(aiResponse => {
        const responseDiv = document.createElement('div');
        responseDiv.className = 'ai-message';
        
        // 直接显示源代码
        responseDiv.innerHTML = `${currentTime} - ${selectedModel === 'sister' ? '傲娇姐姐' : 'GPT'}: <div class="code-block">${formatResponse(aiResponse)}</div>`;
        
        messagesDiv.appendChild(responseDiv);
        
        // 清空输入框
        document.getElementById('userInput').value = '';
        // 滚动到最新消息
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // 启用发送按钮
        sendBtn.disabled = false;
    });
}

// 格式化AI回复，识别代码段
function formatResponse(response) {
    return response.replace(/\n/g, '<br>'); // 替换换行符
}

// 调用AI API的函数
async function getAIResponse(input, model) {
    const apiUrl = model === 'sister' 
        ? 'https://apii.lolimi.cn/api/jjai/jj' 
        : 'https://apii.lolimi.cn/api/4o/gpt4o';

    try {
        const response = await fetch(`${apiUrl}?key=8tFpRfW0jCEpOrUs0iRM6XnTmB&msg=${encodeURIComponent(input)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('网络响应不正常');
        }

        const data = await response.json();
        
        // 检查返回的状态码
        if (data.code === 200) {
            return model === 'sister' ? data.data.output : data.data.content; // 返回相应内容
        } else {
            return '抱歉，无法获取有效的回复。';
        }
    } catch (error) {
        console.error('请求失败:', error);
        return '抱歉，无法获取AI回复。';
    }
}