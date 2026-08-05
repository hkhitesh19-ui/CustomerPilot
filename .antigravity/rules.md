# AntiGravity Agentic IDE — Absolute Execution & Tool-Use Governance (v1.0)

## 1. MANDATORY TOOL SELECTION PRIORITY (Zero-Popup Policy)
*   **NEVER use terminal/shell commands (npm, npx, tsx) for inspecting or testing code. STRICTLY use built-in filesystem tools (read_file, write_to_file, replace_file_content) ONLY.**
*   **Enforce Built-in FS Tools First:** To inspect codebase, verify requirements, or apply fixes, you MUST strictly use native IDE filesystem tools:
    *   `list_dir` (for directory traversal)
    *   `view_file` (for reading scripts/logs)
    *   `grep_search` (for locating references/hardcoded values)
    *   `replace_file_content` / `write_to_file` (for surgical code modifications)
*   **Why:** Executing raw terminal scripts triggers IDE sandbox confirmation popups and interrupts automated workflows. Avoid terminal tools for static analysis entirely.

## 2. STRICT CODE INTEGRITY & SURGICAL PATCHING
*   **Preserve UI/UX & Layouts:** Never modify, delete, or overwrite existing HTML, CSS, NiceGUI, or dashboard layouts unless explicitly instructed.
*   **Surgically Replace Only:** When fixing functional bugs (e.g., webhook routing, database sync, file locking), surgically modify ONLY the targeted function or logic block. Entire file overwrites are strictly prohibited.
*   **No Minimalist Overwrites:** Never replace an existing complex functional script or dashboard with a "Simple Test Script" or stripped-down version.
*   **Version Control Mindset:** If proposing experimental logic, suggest a NEW versioned filename (e.g., `v2_experimental.ts` or `v48_experimental.py`) rather than mutating stable, working production code.
*   **Adhere to Peer Guidance:** If a simple, direct fix (like a basic read/write adjustment) is suggested by the user or documentation, prioritize it immediately. Do not over-complicate fixes.

## 3. MANDATORY EXECUTION PROTOCOL (When Terminal Run is Required)
*   **PowerShell Priority:** Whenever script execution, file creation via script, or command-line testing is explicitly requested or unavoidably required, use **PowerShell** exclusively.
*   **Step Zero — Absolute Path Setting:** Every single PowerShell command block or script execution MUST start with `Step Zero: Path Setting` to explicitly navigate to and verify the project root directory before executing anything.
    ```powershell
    # Step Zero: Path Setting
    Set-Location -Path "f:\CustomerPilot_ByGLM_July2026"
    ```
*   **Error Logging & Validation:** If any execution error occurs during script runs:
    1.  Perform all necessary analytical trials systematically.
    2.  Maintain an ongoing, detailed log of errors and their root-cause fixes in a dedicated `error_log.txt` file within the project folder using PowerShell append commands.
    3.  Once resolved, explain the final successful resolution clearly and concisely.

## 4. VERIFICATION & ACCURACY (Pro-Level Validation)
*   **Zero Guesswork:** Perform static code verification internally after applying any `replace_file_content` patch. Verify that syntax, imports, and variable scopes remain intact.
*   **Double-Check Calculations & Data Flows:** For any numeric data, database schemas, or logic chains, perform at least two independent verification passes before finalizing the response. Correctness comes before speed.
