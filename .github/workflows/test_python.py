#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple test script for GitHub Actions
"""

print("🐍 Python script is running!")
print("✅ GitHub Actions + Python integration successful!")

# Create a simple text file as test
from pathlib import Path

output_dir = Path("docs")
output_dir.mkdir(parents=True, exist_ok=True)

test_file = output_dir / "test_output.txt"
test_file.write_text("Python test successful! 🎉")

print(f"✅ Test file created: {test_file}")
