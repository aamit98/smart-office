import os

root_dirs = [
    r"c:\Users\asher\OneDrive\Desktop\smart-office\backend\auth-service",
    r"c:\Users\asher\OneDrive\Desktop\smart-office\backend\resource-service",
    r"c:\Users\asher\OneDrive\Desktop\smart-office\frontend"
]

ignore_checksum_errors = True

def run():
    for root_dir in root_dirs:
        if not os.path.exists(root_dir):
            continue
            
        print(f"Processing {root_dir}")
        for subdir, dirs, files in os.walk(root_dir):
            # Ignore bad directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'bin', 'obj', '.vs', 'dist', '.vscode']]
            
            for file in files:
                filepath = os.path.join(subdir, file)
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    os.remove(filepath)
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                        
                    print(f"Fixed {file}")
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == '__main__':
    run()