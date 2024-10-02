import gradio as gr
import requests

def get_ai_response(user_input, model):
    api_url = 'https://apii.lolimi.cn/api/jjai/jj' if model == 'sister' else 'https://apii.lolimi.cn/api/4o/gpt4o'
    api_key = '8tFpRfW0jCEpOrUs0iRM6XnTmB'
    
    try:
        response = requests.get(f"{api_url}?key={api_key}&msg={user_input}")
        response.raise_for_status()  # 检查请求是否成功
        data = response.json()
        
        if data['code'] == 200:
            return data['data']['output'] if model == 'sister' else data['data']['content']
        else:
            return "抱歉，无法获取有效的回复。"
    except Exception as e:
        return f"请求失败: {str(e)}"

def respond_to_message(user_input, model):
    return get_ai_response(user_input, model)

# 创建 Gradio 接口
iface = gr.Interface(
    fn=respond_to_message,
    inputs=[
        gr.inputs.Textbox(label="输入您的消息", placeholder="输入您的消息"),
        gr.inputs.Dropdown(choices=["gpt", "sister"], label="选择模型")
    ],
    outputs="text",
    title="AI 对话系统",
    description="选择模型并输入消息以获取回复"
)

# 启动应用
iface.launch()