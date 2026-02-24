#!/usr/bin/env python3
import os
import time
from pathlib import Path

def monitor_temp_uploads():
    """Monitor temp_uploads directory for file activity"""
    temp_dir = Path("temp_uploads")
    
    print("=== MONITORING TEMP_UPLOADS DIRECTORY ===")
    print(f"Watching: {temp_dir.absolute()}")
    print("Press Ctrl+C to stop monitoring")
    print("-" * 50)
    
    seen_files = set()
    
    try:
        while True:
            if temp_dir.exists():
                current_files = set(temp_dir.glob("*"))
                
                # Check for new files
                new_files = current_files - seen_files
                for new_file in new_files:
                    if new_file.is_file():
                        size = new_file.stat().st_size
                        print(f"[NEW FILE] {new_file.name} ({size} bytes)")
                
                # Check for removed files
                removed_files = seen_files - current_files
                for removed_file in removed_files:
                    print(f"[REMOVED] {removed_file.name}")
                
                seen_files = current_files
                
                # Show current status
                if current_files:
                    print(f"[STATUS] Currently {len(current_files)} files in temp_uploads")
                    for f in current_files:
                        if f.is_file():
                            size = f.stat().st_size
                            age = time.time() - f.stat().st_mtime
                            print(f"  - {f.name}: {size} bytes (age: {age:.1f}s)")
                else:
                    print("[STATUS] temp_uploads directory is empty")
            else:
                print("[STATUS] temp_uploads directory does not exist")
            
            time.sleep(2)  # Check every 2 seconds
            
    except KeyboardInterrupt:
        print("\n[STOP] Monitoring stopped by user")

if __name__ == "__main__":
    monitor_temp_uploads()