
import sys
import os

# Avoid importing local json.py
cwd = os.getcwd()
if cwd in sys.path:
    sys.path.remove(cwd)
if '' in sys.path:
    sys.path.remove('')
if '.' in sys.path:
    sys.path.remove('.')

import json

# Use current directory since we are running from there
base_path = "."
files_to_read = [
    "server.js",
    "data/fakeData.js",
    "views/login.ejs",
    "views/menu.ejs",
    "views/orders.ejs",
    "views/add_menu.ejs",
    "public/style.css",
    "README-VULNERABILITIES.md",
    "package.json",
    "setup.sql"
]

file_contents = {}
for file_rel_path in files_to_read:
    try:
        with open(os.path.join(base_path, file_rel_path), "r", encoding="utf-8") as f:
            file_contents[file_rel_path] = f.read()
    except Exception as e:
        file_contents[file_rel_path] = f"Error reading file: {str(e)}"

prompt_data = {
    "role": "Senior Full Stack Developer & Security Researcher",
    "task": "Create a React-based application (preferably Next.js for full-stack capabilities or a React SPA with a Node backend) that replicates the functionality and intentional vulnerabilities of the provided Express/EJS application.",
    "requirements": [
        "Replicate the UI/UX using the provided EJS templates and CSS as a reference.",
        "Implement the 'Fake Data' mode exactly as it is in the current app to allow for easy testing without a database.",
        "Preserve the intentional vulnerabilities (SQL Injection, XSS, Weak Auth, IDOR, etc.) documented in README-VULNERABILITIES.md.",
        "For SQL Injection: If using a real DB connection in the new app, ensure queries are concatenated strings. If using Fake Data mode, you may simulate the vulnerability or note that it's only active in DB mode.",
        "For XSS: Ensure that user input is rendered dangerously (e.g., using dangerouslySetInnerHTML in React) where appropriate to replicate the vulnerability.",
        "The application must be runnable and functional."
    ],
    "context": "The source application is a deliberately vulnerable restaurant website used for educational purposes. The goal is to port this to a modern stack (React) while keeping the security flaws for training.",
    "source_code": file_contents,
    "vulnerabilities_documentation": file_contents.get("README-VULNERABILITIES.md", "")
}

output_path = "claude_prompt.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(prompt_data, f, indent=2)

print(f"JSON prompt generated at {os.path.abspath(output_path)}")
