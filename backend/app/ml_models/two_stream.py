import torch
import torch.nn as nn
import torchvision.models as models

class TwoStreamTamperingNet(nn.Module):
    """
    Two-Stream Network for Tampering Detection.
    Stream 1: Raw RGB Image (captures visual artifacts)
    Stream 2: ELA / Noise Residual Map (captures compression anomalies)
    
    This architecture is commonly used in document forgery and deepfake detection.
    """
    def __init__(self, num_classes=2, pretrained=True):
        super(TwoStreamTamperingNet, self).__init__()
        
        # We use ResNet18 as a lightweight backbone for both streams
        
        # Stream 1: RGB
        self.rgb_stream = models.resnet18(pretrained=pretrained)
        # Remove the final classification layer to get the feature vector
        num_ftrs_rgb = self.rgb_stream.fc.in_features
        self.rgb_stream.fc = nn.Identity()
        
        # Stream 2: ELA / Noise Map
        # Even though ELA can be 1-channel, we usually duplicate to 3-channels to use pretrained weights
        self.ela_stream = models.resnet18(pretrained=pretrained)
        num_ftrs_ela = self.ela_stream.fc.in_features
        self.ela_stream.fc = nn.Identity()
        
        # Fusion Layer
        # Concatenate the feature vectors from both streams
        self.fusion = nn.Sequential(
            nn.Linear(num_ftrs_rgb + num_ftrs_ela, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )

    def forward(self, rgb_input, ela_input):
        # Extract features from RGB image
        rgb_features = self.rgb_stream(rgb_input)
        
        # Extract features from ELA map
        ela_features = self.ela_stream(ela_input)
        
        # Concatenate along the feature dimension
        fused_features = torch.cat((rgb_features, ela_features), dim=1)
        
        # Pass through final classification layers
        output = self.fusion(fused_features)
        
        return output

# --- Helper functions for inference ---

def get_model(weights_path=None):
    """
    Initializes the model and loads weights if available.
    """
    model = TwoStreamTamperingNet(pretrained=False)
    if weights_path:
        try:
            model.load_state_dict(torch.load(weights_path, map_location='cpu'))
            model.eval()
        except Exception as e:
            print(f"Failed to load weights: {e}")
    return model

def mock_inference():
    """
    Provides a mock forward pass since we don't have trained weights.
    Returns a dummy probability tensor.
    """
    # Simulate batch size 1, 3 channels, 224x224 image
    dummy_rgb = torch.randn(1, 3, 224, 224)
    dummy_ela = torch.randn(1, 3, 224, 224)
    
    model = TwoStreamTamperingNet(pretrained=False)
    model.eval()
    
    with torch.no_grad():
        output = model(dummy_rgb, dummy_ela)
        # Apply softmax to get probabilities
        probs = torch.nn.functional.softmax(output, dim=1)
        
    return probs.numpy()
