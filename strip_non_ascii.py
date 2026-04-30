import os
import re

def strip_non_ascii(text):
    return re.sub(r'[^\x00-\x7F]+', '', text)

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        if 'venv' in dirs:
            dirs.remove('venv')
        if '.git' in dirs:
            dirs.remove('.git')
        if '__pycache__' in dirs:
            dirs.remove('__pycache__')
            
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                print(f"Processing: {path}")
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = strip_non_ascii(content)
                    
                    if content != new_content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"  Fixed: {path}")
                except Exception as e:
                    print(f"  Error processing {path}: {e}")

if __name__ == "__main__":
    process_directory('backend')
