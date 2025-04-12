import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import platform
import os

CORRECT_FLAG = "1753c{xxxxxxx_xx_xx_xxxxx}"
FLAG_LENGTH = len(CORRECT_FLAG)

# Process flags and calculate similarity scores
def process_flags(file_path):
    with open(file_path, 'r') as file:
        flags = file.read().splitlines()
    
    # Remove duplicates
    unique_flags = list(dict.fromkeys(flags))
    print(f"Loaded {len(flags)} flags, {len(unique_flags)} after removing duplicates")
    
    processed_data = []
    for flag in unique_flags:
        # Ensure flag is 26 characters (pad with 'x' if needed)
        padded_flag = flag[:FLAG_LENGTH].ljust(FLAG_LENGTH, 'x')
        
        # Calculate similarity score
        correct_positions = sum(1 for a, b in zip(padded_flag, CORRECT_FLAG) if a == b)
        similarity = correct_positions / FLAG_LENGTH
        
        print(f"Flag: {padded_flag} | Score: {similarity:.6f} | Correct positions: {correct_positions}/{FLAG_LENGTH}")
        processed_data.append((padded_flag, similarity))
    
    return processed_data

# Dataset class
class FlagDataset(Dataset):
    def __init__(self, data):
        self.data = data
    
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        flag, similarity = self.data[idx]
        
        # Convert characters to one-hot encoding
        X = torch.zeros(FLAG_LENGTH, 128)  # ASCII has 128 characters
        for i, char in enumerate(flag):
            X[i, ord(char)] = 1
        
        return X.flatten(), torch.tensor(similarity, dtype=torch.float32)

# Neural network model
class FlagSimilarityModel(nn.Module):
    def __init__(self):
        super(FlagSimilarityModel, self).__init__()
        self.model = nn.Sequential(
            nn.Linear(FLAG_LENGTH * 128, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        return self.model(x)

# Set device (CPU, CUDA, or MPS)
def get_device():
    if torch.cuda.is_available():
        return torch.device("cuda")
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available() and platform.system() == 'Darwin':
        return torch.device("mps")
    else:
        return torch.device("cpu")

# Main function
def main():
    # Get device
    device = get_device()
    print(f"Using device: {device}")
    
    # Process flags
    data = process_flags('all.txt')
    
    # Create dataset and dataloader
    dataset = FlagDataset(data)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
    
    # Initialize model
    model = FlagSimilarityModel().to(device)
    
    # Define loss function and optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Train the model
    num_epochs = 20
    print("\nStarting training...")
    print(f"Dataset size: {len(dataset)} samples")
    
    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        
        for inputs, targets in dataloader:
            # Move data to device
            inputs, targets = inputs.to(device), targets.to(device)
            
            # Forward pass
            outputs = model(inputs).squeeze()
            loss = criterion(outputs, targets)
            
            # Backward pass and optimize
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        # Print epoch results
        print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {total_loss/len(dataloader):.6f}')
    
    print("\nTraining complete!")
    
    # Save the model to disk
    model_path = 'model.pt'
    torch.save({
        'model_state_dict': model.state_dict(),
    }, model_path)
    print(f"Model saved to {model_path}")
    
    # Quick validation on the correct flag
    model.eval()
    with torch.no_grad():
        X = torch.zeros(FLAG_LENGTH, 128)
        for i, char in enumerate(CORRECT_FLAG):
            X[i, ord(char)] = 1
        
        X = X.flatten().to(device)
        similarity = model(X).item()
        print(f"Correct flag predicted similarity: {similarity:.6f} (expected: 1.0)")

if __name__ == "__main__":
    main()