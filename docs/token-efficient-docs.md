# Token-Efficient YAML Documentation

## Why YAML Format for AI Assistants?

AI language models have context window limitations measured in tokens. When working with large documentation sets, token efficiency becomes critical. The YAML format provides a structured, compressed alternative to full markdown documentation while maintaining ~80% content coverage.

## Token Savings Analysis

### Plugin Documentation

| Plugin | MD (original) | YAML (80% coverage) | Character Savings | Token Estimate MD | Token Estimate YAML | Token Savings |
|--------|---------------|---------------------|-------------------|-------------------|---------------------|---------------|
| **Focus** | 23,350 chars | 13,108 chars | **44%** | ~6,700 | ~3,000 | ~3,700 (**55%**) |
| **Observer** | 11,952 chars | 7,479 chars | **37%** | ~3,400 | ~1,700 | ~1,700 (**50%**) |
| **Fields** | 13,273 chars | 9,251 chars | **30%** | ~3,800 | ~2,100 | ~1,700 (**45%**) |
| **FontStyle** | 9,573 chars | 6,736 chars | **30%** | ~2,700 | ~1,500 | ~1,200 (**44%**) |
| **SUBTOTAL** | **58,148 chars** | **36,574 chars** | **37%** | **~16,600 tokens** | **~8,300 tokens** | **~8,300 tokens (50%)** |

### Core Documentation

| Document | MD (original) | YAML (80% coverage) | Character Savings | Token Estimate MD | Token Estimate YAML | Token Savings |
|----------|---------------|---------------------|-------------------|-------------------|---------------------|---------------|
| **Cross-Thread MVI** | 9,123 chars | 7,595 chars | **17%** | ~2,600 | ~1,700 | ~900 (**35%**) |
| **i18n Support** | 15,413 chars | 10,819 chars | **30%** | ~4,400 | ~2,400 | ~2,000 (**45%**) |
| **README** | 4,430 chars | 5,074 chars | **-15%** | ~1,300 | ~1,100 | ~200 (**15%**) |
| **ViewBuilder Overview** | 5,127 chars | 5,396 chars | **-5%** | ~1,500 | ~1,200 | ~300 (**20%**) |
| **ViewModel Reference** | 6,358 chars | 7,663 chars | **-21%** | ~1,800 | ~1,700 | ~100 (**6%**) |
| **Widget Reference** | 16,325 chars | 15,383 chars | **6%** | ~4,700 | ~3,400 | ~1,300 (**28%**) |
| **SUBTOTAL** | **56,776 chars** | **51,930 chars** | **9%** | **~16,300 tokens** | **~11,500 tokens** | **~4,800 tokens (29%)** |

### Combined Totals

| Category | MD (original) | YAML (80% coverage) | Character Savings | Token Estimate MD | Token Estimate YAML | Token Savings |
|----------|---------------|---------------------|-------------------|-------------------|---------------------|---------------|
| **Plugins (4)** | 58,148 chars | 36,574 chars | **37%** | ~16,600 | ~8,300 | **~8,300 (50%)** |
| **Core Docs (6)** | 56,776 chars | 51,930 chars | **9%** | ~16,300 | ~11,500 | **~4,800 (29%)** |
| **GRAND TOTAL** | **114,924 chars** | **88,504 chars** | **23%** | **~32,900 tokens** | **~19,800 tokens** | **~13,100 tokens (40%)** |

*Token estimates based on: Markdown ~3.5 chars/token (code examples), YAML ~4.5 chars/token (dense structure)*
*Measured on Oct 28, 2025 (fw v2.3)*
*Note: Some YAML files exceed original MD character count due to 80% content coverage requirement, but still achieve token savings due to denser YAML structure.*


## What's Included in YAML Format (80% Coverage)

Each YAML file contains:

✅ **Core concepts** - Architecture and key strategies
✅ **All properties** - Complete property reference tables
✅ **Lifecycle hooks** - beforeMount, beforeUpdate, beforeDestroy
✅ **Processing pipeline** - Step-by-step execution flow
✅ **Patterns** - 4-8 common patterns with compact code snippets
✅ **Best practices** - 4-5 practices with explanations
✅ **Pitfalls** - 5-8 common issues with solutions
✅ **Troubleshooting** - 2-3 debug sections with checks
✅ **API reference** - Methods and configuration options

## What's NOT Included (20%)

❌ Full code examples with complete context
❌ Detailed "good vs avoid" code comparisons
❌ Visual formatting and tables
❌ Extended troubleshooting debug code blocks

## How to Use YAML Documentation

### Codex / ChatGPT (OpenAI)
- **File**: Drag-and-drop the `.opt.yaml` files into the web UI or CLI when needed.
- **Persistent reminder**: In *Custom Instructions*, note that YAML digests live under `docs/ai/index.yaml`.
- **One-off prompt**: Start the session with "Please consult `docs/ai/*.opt.yaml` for condensed docs."
- **Quick load**: From the CLI, `cat docs/ai/<filename>.opt.yaml` and paste into the conversation.

### Claude
- **File**: Drag-and-drop the `.opt.yaml` files into the web UI or terminal when needed.
- **Ad-hoc mention**: First message can say "Summaries: `docs/ai/index.yaml`."
- **Projects / system prompt**: Add a permanent note pointing to `docs/ai/index.yaml`.


## File Naming Convention

All YAML files follow the pattern: `{original-name}.opt.yaml`

- `view-builder-focus-plugin.md` → `view-builder-focus-plugin.opt.yaml`
- `cross-thread-mvi.md` → `cross-thread-mvi.opt.yaml`

Each markdown file links to its corresponding YAML at the top with:
> 🌱 Token-efficient AI refs for {topic}

## Additional Resources

For complete documentation, always refer to the full markdown files in the `/docs` directory. The YAML files are supplements, not replacements.
