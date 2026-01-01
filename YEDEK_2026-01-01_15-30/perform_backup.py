
import os
import shutil
import datetime

# Configuration
SOURCE_DIR = r'c:\Users\pc\Desktop\Lidareyn_brand'
BACKUP_ROOT = os.path.join(SOURCE_DIR, 'backups')
TIMESTAMP = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
CUSTOM_NAME = "Bildirim_Cubugu_ve_Hiz_Optimizasyonu"
BACKUP_FOLDER_NAME = f"{TIMESTAMP}_{CUSTOM_NAME}"
TARGET_DIR = os.path.join(BACKUP_ROOT, BACKUP_FOLDER_NAME)

# Create backup directory
if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)

# Copy files
print(f"Backing up to: {TARGET_DIR}")

# Ignore patterns to prevent recursion and skip unnecessary large folders
# 'backups' MUST be ignored because TARGET_DIR is inside it.
ignore_patterns = shutil.ignore_patterns(
    'backups', 
    'node_modules', 
    '.git', 
    '__pycache__', 
    'dist', 
    '.vscode',
    '*.pyc',
    '.agent' # Agent workflow files
)

try:
    # We want to copy contents of SOURCE_DIR into TARGET_DIR.
    # shutil.copytree requires the destination directory to NOT exist usually, 
    # or in newer versions dirs_exist_ok=True.
    # But here we created TARGET_DIR. 
    # Let's use a subfolder inside TARGET_DIR to be clean, or copy contents directly.
    # To copy contents directly with ignore patterns is tricky without copytree.
    # Better approach: Let copytree create the directory.
    
    # Remove the empty directory we just created to let copytree do it
    os.rmdir(TARGET_DIR)
    
    shutil.copytree(SOURCE_DIR, TARGET_DIR, ignore=ignore_patterns)
    print("Backup completed successfully.")
    print(f"Backup Location: {TARGET_DIR}")
    
except Exception as e:
    print(f"Backup failed: {e}")
