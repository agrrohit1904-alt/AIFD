import gradio as gr
from app.main import app as fastapi_app

# Create a simple blank Gradio interface
def dummy():
    return "API is running!"

demo = gr.Interface(fn=dummy, inputs=None, outputs="text", title="Identity API")

# Mount the FastAPI app onto the Gradio app
# Gradio spaces automatically look for a variable named 'app'
app = gr.mount_gradio_app(fastapi_app, demo, path="/ui")

# The actual FastAPI routes are still accessible at the root!
