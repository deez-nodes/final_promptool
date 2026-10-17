# Build Plan 

**Local Gemma:** 
```zsh
	powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
	pip install -U transformers torch accelerate
```

## NEMOTRON NVIDIA
- [LM Studio](https://lmstudio.ai/models/nemotron-3) —Built-in interface and OpenAI-compatible API
- [Ollama](https://ollama.com/library/nemotron3) — CLI and developer-friendly local API
-  [llama.cpp] — Lightweight, high-performance inference engine (GGUF models available via Hugging Face)
- [Unsloth](https://unsloth.ai/docs/models/nemotron-3)—Efficient local fine-tuning inference with optimized memory usage and performance
- [Hugging Face](https://huggingface.co/collections/nvidia/nvidia-nemotron-v3)
-  [OpenRouter](https://openrouter.ai/nvidia/nemotron-3-nano-30b-a3b:free)  
-   http://build.nvidia.com/
---

## Running Python
- `uv run`: Run a script.
- `uv add --script`: Add a dependency to a script.
- `uv remove --script`: Remove a dependency from a script.
- `pyproject.toml`.
- `uv init`: Create a new Python project.
- `uv add`: Add a dependency to the project.
- `uv remove`: Remove a dependency from the project.
- `uv sync`: Sync the project's dependencies with the environment.
- `uv lock`: Create a lockfile for the project's dependencies.
- `uv run`: Run a command in the project environment.
- `uv tree`: View the dependency tree for the project.
- `uv build`: Build the project into distribution archives.
- `uv publish`: Publish the project to a package index.


## [Tools](https://docs.astral.sh/uv/getting-started/features/#tools)
- `uvx` / `uv tool run`: Run a tool in a temporary environment.
- `uv tool install`: Install a tool user-wide.
- `uv tool uninstall`: Uninstall a tool.
- `uv tool list`: List installed tools.
- `uv tool update-shell`: Update the shell to include tool executables.

## Increments
1. TECHNIQUES data object (techniques → XML sections → starter text)
2. Technique select + skeleton prefill into textarea
3. Starter seeding per section ("Act as a ...", "Let's think step by step.", "The answer is ...")
4. Document-word autocomplete at cursor
5. History reselect: roles / context blocks / links from saved items
6. Wire into existing preview + save
- Data cleaning, exploration, and visualization
- Statistical foundations (distributions, hypothesis testing)
- gression, classification, tree-based models
-  Feature engineering with business context
